/**
 * @file menuBar.ts
 * @description In-app menu bar component.
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

import type { MenuAction } from '../types/finmind'
import type { MessageKey } from '../i18n'
import type { UiLanguage } from '../i18n/types'
import { buildMenuGroups, type MenuEntry } from '../menu/menuDefinition'

export interface MenuBarState {
  lineNumbers: boolean
  sidebarVisible: boolean
  contentPreview: boolean
  activeLanguage: string
  foldable: boolean
  isJson: boolean
  isMarkdown: boolean
  canFormatDocument: boolean
  canFormatSelection: boolean
  jsonIndentSize: 2 | 4
  sqlDialect: import('../../shared/languageRegistry').SqlDialect
  sqlKeywordCase: import('../../shared/languageRegistry').SqlKeywordCase
  sqlIndentSize: 2 | 4
  recentFiles: string[]
  uiLanguage: UiLanguage
}

export interface MenuBarHandlers {
  onAction: (action: MenuAction, payload?: string) => void
  getState: () => MenuBarState
  loadRecentFiles: () => Promise<string[]>
  translate: (key: MessageKey) => string
}

export class MenuBar {
  private container: HTMLElement
  private openMenu: HTMLElement | null = null
  private dismissHandler: ((e: MouseEvent) => void) | null = null

  constructor(container: HTMLElement, private handlers: MenuBarHandlers) {
    this.container = container
    this.container.className = 'menu-bar'
  }

  update(): void {
    this.closeAll()
    this.renderTopLevel()
  }

  private renderTopLevel(): void {
    this.container.innerHTML = ''
    const t = this.handlers.translate
    for (const top of buildMenuGroups(this.handlers.getState())) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'menu-bar-top'
      btn.textContent = t(top.labelKey)
      btn.dataset.menuId = top.id
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        if (this.openMenu === btn) {
          this.closeAll()
          return
        }
        this.closeAll()
        let state = this.handlers.getState()
        if (top.id === 'file') {
          state = { ...state, recentFiles: await this.handlers.loadRecentFiles() }
        }
        const groups = buildMenuGroups(state)
        const group = groups.find((g) => g.id === top.id)!
        const panel = this.createDropdown(group.children)
        btn.classList.add('open')
        btn.appendChild(panel)
        this.openMenu = btn
        this.bindDismiss()
      })
      this.container.appendChild(btn)
    }
  }

  private createDropdown(entries: MenuEntry[]): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'menu-dropdown'
    for (const entry of entries) {
      panel.appendChild(this.renderEntry(entry))
    }
    return panel
  }

  private renderEntry(entry: MenuEntry): HTMLElement {
    const t = this.handlers.translate

    if (entry.type === 'separator') {
      const sep = document.createElement('div')
      sep.className = 'menu-separator'
      return sep
    }

    if (entry.type === 'submenu') {
      const row = document.createElement('div')
      row.className = `menu-item has-submenu${entry.disabled ? ' disabled' : ''}`
      row.innerHTML = `<span class="menu-label">${t(entry.labelKey)}</span><span class="menu-arrow">›</span>`
      const sub = document.createElement('div')
      sub.className = 'menu-submenu'
      for (const child of entry.children) {
        sub.appendChild(this.renderEntry(child))
      }
      row.appendChild(sub)
      if (!entry.disabled) {
        row.addEventListener('mouseenter', () => {
          row.classList.add('sub-open')
          row.closest('.menu-submenu')?.querySelectorAll(':scope > .menu-item.has-submenu.sub-open').forEach((el) => {
            if (el !== row) el.classList.remove('sub-open')
          })
        })
        row.addEventListener('mouseleave', () => row.classList.remove('sub-open'))
      }
      return row
    }

    const label = entry.label ?? t(entry.labelKey)
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `menu-item${entry.disabled ? ' disabled' : ''}${entry.checked ? ' checked' : ''}`
    btn.disabled = !!entry.disabled
    const check = entry.checked ? '✓ ' : ''
    btn.innerHTML = `
      <span class="menu-label">${check}${label}</span>
      ${entry.shortcut ? `<span class="menu-shortcut">${entry.shortcut}</span>` : ''}
    `
    if (!entry.disabled && entry.action) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.closeAll()
        this.handlers.onAction(entry.action!, entry.payload)
      })
    }
    return btn
  }

  private bindDismiss(): void {
    this.dismissHandler = (e: MouseEvent) => {
      if (this.openMenu?.contains(e.target as Node)) return
      this.closeAll()
    }
    window.addEventListener('mousedown', this.dismissHandler)
  }

  private closeAll(): void {
    if (this.dismissHandler) {
      window.removeEventListener('mousedown', this.dismissHandler)
      this.dismissHandler = null
    }
    this.openMenu = null
    this.container.querySelectorAll('.menu-bar-top.open').forEach((el) => {
      el.classList.remove('open')
      el.querySelector('.menu-dropdown')?.remove()
    })
  }
}
