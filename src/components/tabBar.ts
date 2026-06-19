/**
 * @file tabBar.ts
 * @description Document tab bar UI component.
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

import type { DocumentStore } from '../store/documentStore'

export class TabBar {
  private container: HTMLElement
  private onSwitch: (tabId: string) => void
  private onClose: (tabId: string) => void
  private onNew: () => void

  constructor(
    container: HTMLElement,
    handlers: {
      onSwitch: (tabId: string) => void
      onClose: (tabId: string) => void
      onNew: () => void
    },
  ) {
    this.container = container
    this.onSwitch = handlers.onSwitch
    this.onClose = handlers.onClose
    this.onNew = handlers.onNew
  }

  render(store: DocumentStore): void {
    const tabs = store.getTabs()
    const activeId = store.getActiveTabId()

    this.container.innerHTML = ''

    const list = document.createElement('div')
    list.className = 'tab-list'

    for (const tab of tabs) {
      const item = document.createElement('div')
      item.className = `tab-item${tab.id === activeId ? ' active' : ''}`
      item.dataset.tabId = tab.id

      const label = document.createElement('span')
      label.className = 'tab-label'
      label.textContent = `${store.isDirty(tab) ? '• ' : ''}${tab.displayName}`

      const closeBtn = document.createElement('button')
      closeBtn.className = 'tab-close'
      closeBtn.type = 'button'
      closeBtn.innerHTML = '&times;'
      closeBtn.title = 'Close'
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.onClose(tab.id)
      })

      item.addEventListener('click', () => this.onSwitch(tab.id))
      item.append(label, closeBtn)
      list.appendChild(item)
    }

    const addBtn = document.createElement('button')
    addBtn.className = 'tab-add'
    addBtn.type = 'button'
    addBtn.textContent = '+'
    addBtn.title = 'New tab'
    addBtn.addEventListener('click', () => this.onNew())

    this.container.append(list, addBtn)
  }
}
