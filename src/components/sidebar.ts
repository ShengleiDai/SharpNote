/**
 * @file sidebar.ts
 * @description Workspace sidebar with resizable file tree.
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

import { FileTree } from './fileTree'
import { ContextMenu } from './contextMenu'

export interface SidebarOptions {
  readDirectory: (dirPath: string) => Promise<Array<{ name: string; path: string; isDirectory: boolean }>>
  onOpenFile: (filePath: string) => void
  getActiveFilePath: () => string | null
  onResize: () => void
  onWidthCommit: (width: number) => void
  onNewFile: (dirPath: string) => void
  onDeleteDirectory: (dirPath: string) => void
  onRenameFile: (filePath: string, fileName: string) => void
  onDeleteFile: (filePath: string, fileName: string) => void
  translate: (key: import('../i18n').MessageKey) => string
}

export class Sidebar {
  private pane: HTMLElement
  private splitter: HTMLElement
  private layout: HTMLElement
  private headerEl: HTMLElement
  private treeContainer: HTMLElement
  private fileTree: FileTree
  private rootPath: string | null = null
  private dragging = false
  private currentWidth = 240
  private headerMenu = new ContextMenu()

  constructor(
    layoutEl: HTMLElement,
    paneEl: HTMLElement,
    splitterEl: HTMLElement,
    private options: SidebarOptions,
  ) {
    this.layout = layoutEl
    this.pane = paneEl
    this.splitter = splitterEl

    this.pane.innerHTML = ''
    this.headerEl = document.createElement('div')
    this.headerEl.className = 'sidebar-header'
    this.treeContainer = document.createElement('div')
    this.treeContainer.className = 'sidebar-tree'
    this.pane.append(this.headerEl, this.treeContainer)

    this.fileTree = new FileTree(this.treeContainer, {
      readDirectory: options.readDirectory,
      onOpenFile: options.onOpenFile,
      getActiveFilePath: options.getActiveFilePath,
      getWorkspaceRoot: () => this.rootPath,
      onNewFile: options.onNewFile,
      onDeleteDirectory: options.onDeleteDirectory,
      onRenameFile: options.onRenameFile,
      onDeleteFile: options.onDeleteFile,
      translate: options.translate,
    })

    this.headerEl.addEventListener('contextmenu', (e) => {
      if (!this.rootPath) return
      e.preventDefault()
      this.headerMenu.show(e.clientX, e.clientY, [
        { id: 'new-file', label: options.translate('sidebarNewFile') },
      ], (id) => {
        if (id === 'new-file') options.onNewFile(this.rootPath!)
      })
    })

    this.splitter.addEventListener('mousedown', (e) => {
      e.preventDefault()
      this.dragging = true
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return
      const rect = this.layout.getBoundingClientRect()
      const width = Math.min(480, Math.max(160, e.clientX - rect.left))
      this.setWidth(width)
      this.options.onResize()
    })

    window.addEventListener('mouseup', () => {
      if (!this.dragging) return
      this.dragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      this.options.onWidthCommit(this.currentWidth)
    })
  }

  setVisible(visible: boolean): void {
    this.layout.classList.toggle('sidebar-enabled', visible && !!this.rootPath)
    this.pane.classList.toggle('hidden', !visible || !this.rootPath)
    this.splitter.classList.toggle('hidden', !visible || !this.rootPath)
  }

  setWidth(width: number): void {
    this.currentWidth = width
    this.layout.style.setProperty('--sidebar-width', `${width}px`)
  }

  async setRoot(rootPath: string | null): Promise<void> {
    this.rootPath = rootPath
    if (!rootPath) {
      this.headerEl.textContent = 'FOLDERS'
      this.headerEl.title = ''
      await this.fileTree.setRoot(null)
      return
    }

    this.headerEl.textContent = 'FOLDERS'
    this.headerEl.title = rootPath
    await this.fileTree.setRoot(rootPath)
  }

  getRootPath(): string | null {
    return this.rootPath
  }

  highlightActiveFile(): void {
    this.fileTree.refreshActiveHighlight()
  }

  async refreshTree(): Promise<void> {
    await this.fileTree.refresh()
  }
}
