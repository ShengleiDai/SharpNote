/**
 * @file findReplaceBar.ts
 * @description Find and replace toolbar.
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

import type { EditorManager } from '../editor/editorManager'

export interface FindReplaceState {
  query: string
  replacement: string
  caseSensitive: boolean
}

export class FindReplaceBar {
  private container: HTMLElement
  private editorManager: EditorManager
  private visible = false
  private replaceMode = false
  private state: FindReplaceState = { query: '', replacement: '', caseSensitive: false }
  private onVisibilityChange?: (visible: boolean) => void

  constructor(container: HTMLElement, editorManager: EditorManager) {
    this.container = container
    this.editorManager = editorManager
    this.render()
  }

  onVisibleChange(callback: (visible: boolean) => void): void {
    this.onVisibilityChange = callback
  }

  isVisible(): boolean {
    return this.visible
  }

  show(mode: 'find' | 'replace'): void {
    this.replaceMode = mode === 'replace'
    this.visible = true
    this.render()
    this.onVisibilityChange?.(true)
    this.container.querySelector<HTMLInputElement>('#find-input')?.focus()
  }

  hide(): void {
    this.visible = false
    this.container.classList.add('hidden')
    this.onVisibilityChange?.(false)
    this.editorManager.focus()
  }

  findNext(): void {
    if (this.state.query) {
      this.editorManager.findNext(this.state.query, this.state.caseSensitive)
    } else {
      this.editorManager.runAction('editor.action.nextMatchFindAction')
    }
  }

  findPrevious(): void {
    if (this.state.query) {
      this.editorManager.findPrevious(this.state.query, this.state.caseSensitive)
    } else {
      this.editorManager.runAction('editor.action.previousMatchFindAction')
    }
  }

  replaceOne(): void {
    this.editorManager.replaceOne(this.state.query, this.state.replacement, this.state.caseSensitive)
  }

  replaceAll(): void {
    this.editorManager.replaceAll(this.state.query, this.state.replacement, this.state.caseSensitive)
  }

  private render(): void {
    if (!this.visible) {
      this.container.classList.add('hidden')
      return
    }

    this.container.classList.remove('hidden')
    this.container.innerHTML = `
      <div class="find-row">
        <label class="find-label" for="find-input">Find</label>
        <input id="find-input" class="find-input" type="text" value="${escapeAttr(this.state.query)}" />
        ${this.replaceMode ? `
          <label class="find-label" for="replace-input">Replace</label>
          <input id="replace-input" class="find-input" type="text" value="${escapeAttr(this.state.replacement)}" />
        ` : ''}
        <label class="find-check">
          <input id="find-case" type="checkbox" ${this.state.caseSensitive ? 'checked' : ''} />
          Match case
        </label>
        <button type="button" class="find-btn" data-action="prev">Previous</button>
        <button type="button" class="find-btn" data-action="next">Next</button>
        ${this.replaceMode ? `
          <button type="button" class="find-btn" data-action="replace">Replace</button>
          <button type="button" class="find-btn" data-action="replace-all">Replace All</button>
        ` : ''}
        <button type="button" class="find-btn find-close" data-action="close" title="Close">&times;</button>
      </div>
    `

    const findInput = this.container.querySelector<HTMLInputElement>('#find-input')!
    const replaceInput = this.container.querySelector<HTMLInputElement>('#replace-input')
    const caseInput = this.container.querySelector<HTMLInputElement>('#find-case')!

    findInput.addEventListener('input', () => {
      this.state.query = findInput.value
    })
    findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.shiftKey ? this.findPrevious() : this.findNext()
      } else if (e.key === 'Escape') {
        this.hide()
      }
    })

    replaceInput?.addEventListener('input', () => {
      this.state.replacement = replaceInput.value
    })

    caseInput.addEventListener('change', () => {
      this.state.caseSensitive = caseInput.checked
    })

    this.container.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action
        switch (action) {
          case 'prev': this.findPrevious(); break
          case 'next': this.findNext(); break
          case 'replace': this.replaceOne(); break
          case 'replace-all': this.replaceAll(); break
          case 'close': this.hide(); break
        }
      })
    })
  }
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}
