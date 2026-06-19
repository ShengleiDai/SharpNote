/**
 * @file contextMenu.ts
 * @description Reusable context menu helper.
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

export interface ContextMenuItem {
  id: string
  label: string
  danger?: boolean
  disabled?: boolean
}

export class ContextMenu {
  private menuEl: HTMLElement | null = null
  private dismissHandler: ((e: MouseEvent) => void) | null = null

  show(x: number, y: number, items: ContextMenuItem[], onSelect: (id: string) => void): void {
    this.hide()

    const menu = document.createElement('div')
    menu.className = 'context-menu'
    menu.setAttribute('role', 'menu')

    for (const item of items) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `context-menu-item${item.danger ? ' danger' : ''}`
      btn.textContent = item.label
      btn.disabled = !!item.disabled
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (item.disabled) return
        this.hide()
        onSelect(item.id)
      })
      menu.appendChild(btn)
    }

    document.body.appendChild(menu)
    this.menuEl = menu

    const rect = menu.getBoundingClientRect()
    const left = Math.min(x, window.innerWidth - rect.width - 8)
    const top = Math.min(y, window.innerHeight - rect.height - 8)
    menu.style.left = `${Math.max(8, left)}px`
    menu.style.top = `${Math.max(8, top)}px`

    this.dismissHandler = (e: MouseEvent) => {
      if (menu.contains(e.target as Node)) return
      this.hide()
    }
    window.addEventListener('mousedown', this.dismissHandler)
    window.addEventListener('blur', () => this.hide())
    window.addEventListener('keydown', this.onKeyDown)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.hide()
  }

  hide(): void {
    if (this.dismissHandler) {
      window.removeEventListener('mousedown', this.dismissHandler)
      this.dismissHandler = null
    }
    window.removeEventListener('keydown', this.onKeyDown)
    this.menuEl?.remove()
    this.menuEl = null
  }
}
