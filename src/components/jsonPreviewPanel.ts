/**
 * @file jsonPreviewPanel.ts
 * @description JSON tree preview panel with navigation.
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

import type { monaco } from '../editor/monacoSetup'
import {
  addArrayItem,
  addObjectKey,
  deleteAtPath,
  encodePath,
  formatJson,
  getValueType,
  parseEditableValue,
  parseJsonSafe,
  setAtPath,
  type JsonPath,
} from '../utils/jsonTree'

export interface JsonPreviewOptions {
  getContent: () => string
  getIndent: () => number
  onApplyContent: (content: string) => void
  onNavigate: (path: JsonPath, key?: string) => void
}

export class JsonPreviewPanel {
  private container: HTMLElement
  private treeEl: HTMLElement
  private options: JsonPreviewOptions
  private expandedPaths = new Set<string>(['[]'])
  private suppressRender = false

  constructor(container: HTMLElement, options: JsonPreviewOptions) {
    this.container = container
    this.options = options
    this.container.innerHTML = `
      <div class="json-preview-header">
        <span class="json-preview-title">JSON Preview</span>
        <span class="json-preview-hint">双击值可编辑 · 点击节点定位</span>
      </div>
      <div class="json-preview-tree"></div>
    `
    this.treeEl = this.container.querySelector('.json-preview-tree')!
  }

  setVisible(visible: boolean): void {
    this.container.classList.toggle('hidden', !visible)
  }

  isVisible(): boolean {
    return !this.container.classList.contains('hidden')
  }

  render(): void {
    if (this.suppressRender) return
    const content = this.options.getContent()
    const parsed = parseJsonSafe(content)

    if (!parsed.ok) {
      this.treeEl.innerHTML = `
        <div class="json-preview-error">
          <strong>无法预览</strong>
          <p>${escapeHtml(parsed.error)}</p>
        </div>
      `
      return
    }

    this.treeEl.innerHTML = ''
    this.treeEl.appendChild(this.renderNode(parsed.data, [], '(root)'))
  }

  applyExternalContent(): void {
    this.render()
  }

  private renderNode(value: unknown, path: JsonPath, label: string): HTMLElement {
    const type = getValueType(value)
    const pathKey = encodePath(path)
    const isExpandable = type === 'object' || type === 'array'
    const isExpanded = this.expandedPaths.has(pathKey)

    const node = document.createElement('div')
    node.className = 'json-tree-node'
    node.dataset.path = pathKey

    const row = document.createElement('div')
    row.className = `json-tree-row${isExpandable ? ' expandable' : ''}`

    if (isExpandable) {
      const toggle = document.createElement('button')
      toggle.type = 'button'
      toggle.className = 'json-tree-toggle'
      toggle.textContent = isExpanded ? '▼' : '▶'
      toggle.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this.expandedPaths.has(pathKey)) {
          this.expandedPaths.delete(pathKey)
        } else {
          this.expandedPaths.add(pathKey)
        }
        this.render()
      })
      row.appendChild(toggle)
    } else {
      const spacer = document.createElement('span')
      spacer.className = 'json-tree-spacer'
      row.appendChild(spacer)
    }

    const keyEl = document.createElement('span')
    keyEl.className = 'json-tree-key'
    keyEl.textContent = label
    row.appendChild(keyEl)

    const colon = document.createElement('span')
    colon.className = 'json-tree-colon'
    colon.textContent = ':'
    row.appendChild(colon)

    const valueEl = document.createElement('span')
    valueEl.className = `json-tree-value json-type-${type}`
    valueEl.textContent = this.formatPreviewValue(value, type)
    if (!isExpandable) {
      valueEl.title = '双击编辑'
      valueEl.addEventListener('dblclick', (e) => {
        e.stopPropagation()
        this.startInlineEdit(valueEl, path, value, type)
      })
    }
    row.appendChild(valueEl)

    const actions = document.createElement('div')
    actions.className = 'json-tree-actions'

    if (type === 'object') {
      const addBtn = document.createElement('button')
      addBtn.type = 'button'
      addBtn.className = 'json-tree-action'
      addBtn.textContent = '+'
      addBtn.title = '添加属性'
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.promptAddObjectKey(path)
      })
      actions.appendChild(addBtn)
    }

    if (type === 'array') {
      const addBtn = document.createElement('button')
      addBtn.type = 'button'
      addBtn.className = 'json-tree-action'
      addBtn.textContent = '+'
      addBtn.title = '添加元素'
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.applyMutation((data) => addArrayItem(data, path, null))
      })
      actions.appendChild(addBtn)
    }

    if (path.length > 0) {
      const deleteBtn = document.createElement('button')
      deleteBtn.type = 'button'
      deleteBtn.className = 'json-tree-action danger'
      deleteBtn.textContent = '×'
      deleteBtn.title = '删除节点'
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.applyMutation((data) => deleteAtPath(data, path))
      })
      actions.appendChild(deleteBtn)
    }

    row.appendChild(actions)

    row.addEventListener('click', () => {
      const key = typeof path[path.length - 1] === 'string'
        ? String(path[path.length - 1])
        : undefined
      this.options.onNavigate(path, key)
    })

    node.appendChild(row)

    if (isExpandable && isExpanded) {
      const children = document.createElement('div')
      children.className = 'json-tree-children'

      if (type === 'object') {
        for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
          children.appendChild(this.renderNode(child, [...path, key], key))
        }
      } else {
        (value as unknown[]).forEach((child, index) => {
          children.appendChild(this.renderNode(child, [...path, index], `[${index}]`))
        })
      }

      node.appendChild(children)
    }

    return node
  }

  private formatPreviewValue(value: unknown, type: string): string {
    if (type === 'object') {
      const count = Object.keys(value as Record<string, unknown>).length
      return `{${count} keys}`
    }
    if (type === 'array') {
      return `[${(value as unknown[]).length} items]`
    }
    if (type === 'string') return JSON.stringify(value)
    return String(value)
  }

  private startInlineEdit(
    valueEl: HTMLElement,
    path: JsonPath,
    current: unknown,
    type: string,
  ): void {
    const input = document.createElement('input')
    input.className = 'json-tree-input'
    input.value = type === 'string' ? String(current) : String(current)
    valueEl.replaceWith(input)
    input.focus()
    input.select()

    const commit = (): void => {
      try {
        const nextValue = parseEditableValue(input.value, type)
        this.applyMutation((data) => setAtPath(data, path, nextValue))
      } catch (err) {
        input.classList.add('error')
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit()
      if (e.key === 'Escape') this.render()
    })
    input.addEventListener('blur', commit)
  }

  private promptAddObjectKey(path: JsonPath): void {
    const key = window.prompt('新属性名')
    if (!key?.trim()) return
    this.applyMutation((data) => addObjectKey(data, path, key.trim(), null))
  }

  private applyMutation(mutator: (data: unknown) => unknown): void {
    const content = this.options.getContent()
    const parsed = parseJsonSafe(content)
    if (!parsed.ok) return

    try {
      const nextData = mutator(parsed.data)
      const nextContent = formatJson(nextData, this.options.getIndent())
      this.suppressRender = true
      this.options.onApplyContent(nextContent)
      this.suppressRender = false
      this.render()
    } catch (err) {
      console.error(err)
    }
  }
}

export function navigateEditorToPath(
  editor: monaco.editor.IStandaloneCodeEditor,
  path: JsonPath,
  key?: string,
): void {
  const model = editor.getModel()
  if (!model) return

  const queries: string[] = []
  if (key) queries.push(`"${key}"`)
  if (path.length > 0) {
    const last = path[path.length - 1]
    if (typeof last === 'string' && last !== key) queries.push(`"${last}"`)
  }

  for (const query of queries) {
    const matches = model.findMatches(query, false, false, false, null, false)
    if (matches.length > 0) {
      const match = matches[0]
      editor.setSelection(match.range)
      editor.revealRangeInCenter(match.range)
      editor.focus()
      return
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
