/**
 * @file promptDialog.ts
 * @description Modal prompt dialog component.
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

export class PromptDialog {
  private static overlay: HTMLElement | null = null

  static show(title: string, message: string, defaultValue = ''): Promise<string | null> {
    this.close()

    return new Promise((resolve) => {
      const overlay = document.createElement('div')
      overlay.className = 'prompt-overlay'
      overlay.innerHTML = `
        <div class="prompt-dialog" role="dialog" aria-modal="true">
          <div class="prompt-title"></div>
          <div class="prompt-message"></div>
          <input class="prompt-input" type="text" spellcheck="false" />
          <div class="prompt-actions">
            <button type="button" class="prompt-btn" data-action="cancel">Cancel</button>
            <button type="button" class="prompt-btn primary" data-action="ok">OK</button>
          </div>
        </div>
      `

      const titleEl = overlay.querySelector('.prompt-title')!
      const messageEl = overlay.querySelector('.prompt-message')!
      const input = overlay.querySelector('.prompt-input') as HTMLInputElement
      titleEl.textContent = title
      messageEl.textContent = message
      input.value = defaultValue

      const finish = (value: string | null) => {
        this.close()
        resolve(value)
      }

      overlay.querySelector('[data-action="cancel"]')!.addEventListener('click', () => finish(null))
      overlay.querySelector('[data-action="ok"]')!.addEventListener('click', () => {
        finish(input.value.trim() || null)
      })
      overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) finish(null)
      })
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish(input.value.trim() || null)
        if (e.key === 'Escape') finish(null)
      })

      document.body.appendChild(overlay)
      this.overlay = overlay
      input.focus()
      input.select()
    })
  }

  private static close(): void {
    this.overlay?.remove()
    this.overlay = null
  }
}
