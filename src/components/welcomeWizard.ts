/**
 * @file welcomeWizard.ts
 * @description First-run welcome wizard UI.
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

import type { MessageKey } from '../i18n'
import type { UiLanguage } from '../store/settingsStore'

export interface WelcomeWizardOptions {
  translate: (key: MessageKey) => string
  getAppVersion: () => Promise<string>
  getUiLanguage: () => UiLanguage
  onUiLanguageChange: (lang: UiLanguage) => Promise<void>
  onPickFolder: () => Promise<string | null>
  onComplete: (workspaceFolder: string | null) => Promise<void>
}

export class WelcomeWizard {
  private static overlay: HTMLElement | null = null

  static show(options: WelcomeWizardOptions): Promise<void> {
    this.close()

    return new Promise((resolve) => {
      void (async () => {
        const version = await options.getAppVersion()
        let step = 0
        let selectedFolder: string | null = null
        const totalSteps = 3

        const finish = async () => {
          await options.onComplete(selectedFolder)
          this.close()
          resolve()
        }

        const render = () => {
          if (!this.overlay) return
          const t = options.translate
          const uiLanguage = options.getUiLanguage()

          const stepIndicator = t('welcomeStepIndicator')
            .replace('{current}', String(step + 1))
            .replace('{total}', String(totalSteps))

          let bodyHtml = ''
          if (step === 0) {
            bodyHtml = `
              <div class="welcome-step welcome-step-intro">
                <img class="welcome-logo" src="./icon.svg" alt="" width="72" height="72" />
                <h2 class="welcome-title">${t('welcomeStep1Title')}</h2>
                <p class="welcome-version">v${escapeHtml(version)}</p>
                <p class="welcome-subtitle">${t('welcomeStep1Subtitle')}</p>
                <p class="welcome-tagline">${t('welcomeStep1Tagline')}</p>
              </div>
            `
          } else if (step === 1) {
            bodyHtml = `
              <div class="welcome-step">
                <h2 class="welcome-title">${t('welcomeStep2Title')}</h2>
                <div class="welcome-field">
                  <label class="welcome-label">${t('welcomeStep2Language')}</label>
                  <div class="welcome-radio-group" role="radiogroup">
                    ${renderLanguageOption('system', t('settingsLangSystem'), uiLanguage)}
                    ${renderLanguageOption('zh', t('settingsLangZh'), uiLanguage)}
                    ${renderLanguageOption('en', t('settingsLangEn'), uiLanguage)}
                  </div>
                </div>
                <div class="welcome-field">
                  <label class="welcome-label">${t('welcomeStep2Folder')}</label>
                  <p class="welcome-hint">${t('welcomeStep2FolderHint')}</p>
                  <div class="welcome-folder-row">
                    <span class="welcome-folder-path">${escapeHtml(selectedFolder ?? t('welcomeStep2FolderNone'))}</span>
                    <button type="button" class="welcome-btn secondary" data-action="browse-folder">${t('welcomeStep2FolderBrowse')}</button>
                  </div>
                </div>
              </div>
            `
          } else {
            bodyHtml = `
              <div class="welcome-step">
                <h2 class="welcome-title">${t('welcomeStep3Title')}</h2>
                <ul class="welcome-shortcuts">
                  ${renderShortcut('Ctrl+O', t('welcomeShortcutOpen'))}
                  ${renderShortcut('Ctrl+S', t('welcomeShortcutSave'))}
                  ${renderShortcut('Ctrl+Shift+M', t('welcomeShortcutMdPreview'))}
                  ${renderShortcut('Ctrl+Shift+P', t('welcomeShortcutJsonPreview'))}
                </ul>
              </div>
            `
          }

          const primaryLabel = step === totalSteps - 1 ? t('welcomeGetStarted') : t('welcomeContinue')

          this.overlay!.innerHTML = `
            <div class="welcome-dialog" role="dialog" aria-modal="true">
              <div class="welcome-step-indicator">${stepIndicator}</div>
              ${bodyHtml}
              <div class="welcome-actions">
                <button type="button" class="welcome-btn ghost" data-action="skip">${t('welcomeSkip')}</button>
                <button type="button" class="welcome-btn primary" data-action="next">${primaryLabel}</button>
              </div>
            </div>
          `

          bindEvents()
        }

        const bindEvents = () => {
          if (!this.overlay) return

          this.overlay.querySelector('[data-action="skip"]')?.addEventListener('click', () => void finish())
          this.overlay.querySelector('[data-action="next"]')?.addEventListener('click', () => {
            if (step < totalSteps - 1) {
              step += 1
              render()
              return
            }
            void finish()
          })

          this.overlay.querySelector('[data-action="browse-folder"]')?.addEventListener('click', () => {
            void options.onPickFolder().then((folder) => {
              if (folder) {
                selectedFolder = folder
                render()
              }
            })
          })

          this.overlay.querySelectorAll<HTMLInputElement>('input[name="ui-language"]').forEach((input) => {
            input.addEventListener('change', () => {
              if (!input.checked) return
              void options.onUiLanguageChange(input.value as UiLanguage).then(() => render())
            })
          })
        }

        const overlay = document.createElement('div')
        overlay.className = 'welcome-overlay'
        document.body.appendChild(overlay)
        this.overlay = overlay
        render()
      })()
    })
  }

  private static close(): void {
    this.overlay?.remove()
    this.overlay = null
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderLanguageOption(value: UiLanguage, label: string, current: UiLanguage): string {
  const checked = current === value ? ' checked' : ''
  return `
    <label class="welcome-radio">
      <input type="radio" name="ui-language" value="${value}"${checked} />
      <span>${escapeHtml(label)}</span>
    </label>
  `
}

function renderShortcut(keys: string, label: string): string {
  return `
    <li class="welcome-shortcut-item">
      <kbd>${escapeHtml(keys)}</kbd>
      <span>${escapeHtml(label)}</span>
    </li>
  `
}
