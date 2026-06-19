/**
 * @file titleBar.ts
 * @description Custom frameless window title bar.
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

export class TitleBar {
  private brandEl: HTMLElement
  private docTitleEl: HTMLElement

  constructor(container: HTMLElement, appName: string) {
    container.innerHTML = `
      <div class="title-bar-drag">
        <img class="title-bar-icon" src="./icon.svg" width="16" height="16" alt="" />
        <span class="title-bar-brand"></span>
        <span class="title-bar-doc-title"></span>
      </div>
      <div class="title-bar-controls">
        <button type="button" class="title-bar-btn" data-action="minimize" title="Minimize" aria-label="Minimize">
          <svg viewBox="0 0 12 12" width="12" height="12"><rect x="1" y="5.5" width="10" height="1" fill="currentColor"/></svg>
        </button>
        <button type="button" class="title-bar-btn" data-action="maximize" title="Maximize" aria-label="Maximize">
          <svg viewBox="0 0 12 12" width="12" height="12"><rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1"/></svg>
        </button>
        <button type="button" class="title-bar-btn close" data-action="close" title="Close" aria-label="Close">
          <svg viewBox="0 0 12 12" width="12" height="12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.2"/></svg>
        </button>
      </div>
    `

    this.brandEl = container.querySelector('.title-bar-brand')!
    this.docTitleEl = container.querySelector('.title-bar-doc-title')!
    this.setAppName(appName)

    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset.action
        if (action === 'minimize') window.finmind.minimizeWindow()
        if (action === 'maximize') void window.finmind.maximizeWindow()
        if (action === 'close') window.finmind.closeWindow()
      })
    })
  }

  setAppName(name: string): void {
    this.brandEl.textContent = name
  }

  setDocumentTitle(title: string | null): void {
    if (!title) {
      this.docTitleEl.textContent = ''
      return
    }
    this.docTitleEl.textContent = ` — ${title}`
  }
}
