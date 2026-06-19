/**
 * @file fileTree.ts
 * @description Directory tree rendering and interactions.
 * @author Norman.S.L.Dai <norman-dai@fixmail.com>
 * @date 2026-06-20
 *
 * Copyright 2026 Norman.S.L.Dai
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ContextMenu } from './contextMenu'
import { getFileIconKind, renderFileIcon } from '../utils/fileIcons'
import type { MessageKey } from '../i18n'

export interface FsEntry {
  name: string
  path: string
  isDirectory: boolean
}

interface TreeNode {
  entry: FsEntry
  children: TreeNode[] | null
  expanded: boolean
  loading: boolean
}

export interface FileTreeOptions {
  readDirectory: (dirPath: string) => Promise<FsEntry[]>
  onOpenFile: (filePath: string) => void
  getActiveFilePath: () => string | null
  getWorkspaceRoot: () => string | null
  onNewFile: (dirPath: string) => void
  onDeleteDirectory: (dirPath: string) => void
  onRenameFile: (filePath: string, fileName: string) => void
  onDeleteFile: (filePath: string, fileName: string) => void
  translate: (key: MessageKey) => string
}

export class FileTree {
  private container: HTMLElement
  private rootNode: TreeNode | null = null
  private expandedPaths = new Set<string>()
  private contextMenu = new ContextMenu()

  constructor(container: HTMLElement, private options: FileTreeOptions) {
    this.container = container
    this.container.className = 'file-tree'
  }

  async setRoot(rootPath: string | null): Promise<void> {
    this.rootNode = null
    if (!rootPath) {
      this.renderEmpty()
      return
    }

    const entry: FsEntry = {
      name: rootPath.split(/[/\\]/).pop() ?? rootPath,
      path: rootPath,
      isDirectory: true,
    }
    this.rootNode = {
      entry,
      children: null,
      expanded: true,
      loading: false,
    }
    this.expandedPaths.add(rootPath)
    await this.loadChildren(this.rootNode)
    this.render()
  }

  async refresh(): Promise<void> {
    if (!this.rootNode) return
    const rootPath = this.rootNode.entry.path
    const entry: FsEntry = {
      name: rootPath.split(/[/\\]/).pop() ?? rootPath,
      path: rootPath,
      isDirectory: true,
    }
    this.rootNode = {
      entry,
      children: null,
      expanded: true,
      loading: false,
    }
    this.expandedPaths.add(rootPath)
    await this.loadChildren(this.rootNode)
    this.render()
  }

  refreshActiveHighlight(): void {
    this.render()
  }

  private renderEmpty(): void {
    this.container.innerHTML = `<div class="file-tree-empty">${this.options.translate('sidebarOpenFolderHint')}</div>`
  }

  private async loadChildren(node: TreeNode): Promise<void> {
    if (!node.entry.isDirectory) return
    node.loading = true
    try {
      const entries = await this.options.readDirectory(node.entry.path)
      node.children = entries.map((entry) => ({
        entry,
        children: null,
        expanded: this.expandedPaths.has(entry.path),
        loading: false,
      }))
      for (const child of node.children) {
        if (child.expanded && child.entry.isDirectory) {
          await this.loadChildren(child)
        }
      }
    } catch {
      node.children = []
    } finally {
      node.loading = false
    }
  }

  private render(): void {
    this.container.innerHTML = ''
    if (!this.rootNode) {
      this.renderEmpty()
      return
    }
    if (this.rootNode.loading && !this.rootNode.children) {
      const loading = document.createElement('div')
      loading.className = 'file-tree-loading'
      loading.style.paddingLeft = '12px'
      loading.textContent = 'Loading…'
      this.container.appendChild(loading)
      return
    }
    if (this.rootNode.children) {
      for (const child of this.rootNode.children) {
        this.renderNode(child, 0, this.container)
      }
    }
  }

  private showDirectoryMenu(x: number, y: number, dirPath: string): void {
    const workspaceRoot = this.options.getWorkspaceRoot()
    const isRoot = workspaceRoot !== null && this.normalizePath(dirPath) === this.normalizePath(workspaceRoot)
    const t = this.options.translate

    this.contextMenu.show(x, y, [
      { id: 'new-file', label: t('sidebarNewFile') },
      { id: 'delete', label: t('sidebarDeleteFolder'), danger: true, disabled: isRoot },
    ], (id) => {
      if (id === 'new-file') this.options.onNewFile(dirPath)
      if (id === 'delete') this.options.onDeleteDirectory(dirPath)
    })
  }

  private showFileMenu(x: number, y: number, filePath: string, fileName: string): void {
    const t = this.options.translate

    this.contextMenu.show(x, y, [
      { id: 'open', label: t('sidebarFileOpen') },
      { id: 'rename', label: t('sidebarFileRename') },
      { id: 'delete', label: t('sidebarFileDelete'), danger: true },
    ], (id) => {
      if (id === 'open') this.options.onOpenFile(filePath)
      if (id === 'rename') this.options.onRenameFile(filePath, fileName)
      if (id === 'delete') this.options.onDeleteFile(filePath, fileName)
    })
  }

  private normalizePath(value: string): string {
    return value.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
  }

  private renderNode(node: TreeNode, depth: number, parentEl: HTMLElement): void {
    const row = document.createElement('div')
    row.className = 'file-tree-row'
    row.style.paddingLeft = `${8 + depth * 14}px`
    row.dataset.path = node.entry.path

    const activePath = this.options.getActiveFilePath()
    if (activePath === node.entry.path) {
      row.classList.add('active')
    }

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'file-tree-toggle'
    if (node.entry.isDirectory) {
      toggle.textContent = node.expanded ? '▾' : '▸'
      toggle.addEventListener('click', (e) => {
        e.stopPropagation()
        void this.toggleNode(node)
      })
    } else {
      toggle.classList.add('spacer')
      toggle.textContent = ''
      toggle.disabled = true
    }

    const icon = document.createElement('span')
    icon.className = 'file-tree-icon'
    icon.innerHTML = renderFileIcon(getFileIconKind(
      node.entry.name,
      node.entry.isDirectory,
      node.expanded,
    ))

    const label = document.createElement('span')
    label.className = 'file-tree-label'
    label.textContent = node.entry.name
    label.title = node.entry.path

    row.append(toggle, icon, label)

    if (node.entry.isDirectory) {
      row.addEventListener('click', () => void this.toggleNode(node))
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.showDirectoryMenu(e.clientX, e.clientY, node.entry.path)
      })
    } else {
      row.addEventListener('click', () => this.options.onOpenFile(node.entry.path))
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.showFileMenu(e.clientX, e.clientY, node.entry.path, node.entry.name)
      })
    }

    parentEl.appendChild(row)

    if (node.entry.isDirectory && node.expanded) {
      const childrenEl = document.createElement('div')
      childrenEl.className = 'file-tree-children'
      if (node.loading) {
        const loading = document.createElement('div')
        loading.className = 'file-tree-loading'
        loading.style.paddingLeft = `${8 + (depth + 1) * 14}px`
        loading.textContent = 'Loading…'
        childrenEl.appendChild(loading)
      } else if (node.children) {
        for (const child of node.children) {
          this.renderNode(child, depth + 1, childrenEl)
        }
      }
      parentEl.appendChild(childrenEl)
    }
  }

  private async toggleNode(node: TreeNode): Promise<void> {
    if (!node.entry.isDirectory) return
    node.expanded = !node.expanded
    if (node.expanded) {
      this.expandedPaths.add(node.entry.path)
      if (!node.children) {
        await this.loadChildren(node)
      }
    } else {
      this.expandedPaths.delete(node.entry.path)
    }
    this.render()
  }
}
