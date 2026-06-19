/**
 * @file statusBar.ts
 * @description Editor status bar (cursor, language, encoding).
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
import type { EditorManager } from '../editor/editorManager'
import type { SettingsStore } from '../store/settingsStore'
import { detectEol } from '../utils/eol'
import { getLanguageDisplayLabel, isJsonLanguage, isSqlLanguageId } from '../editor/languageEditor'
import { isSqlLanguage } from '../../shared/languageRegistry'

export class StatusBar {
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
  }

  update(store: DocumentStore, editorManager: EditorManager, settingsStore: SettingsStore): void {
    const tab = store.getActiveTab()
    if (!tab) {
      this.container.innerHTML = ''
      return
    }

    const position = editorManager.getCursorPosition()
    const content = tab.model.getValue()
    const eol = detectEol(content)
    const languageLabel = getLanguageDisplayLabel(tab.language)
    const settings = settingsStore.getSettings()

    const jsonStatus = isJsonLanguage(tab.language)
      ? this.renderJsonStatus(editorManager)
      : ''

    const sqlStatus = isSqlLanguage(tab.language) || isSqlLanguageId(tab.language)
      ? `<span class="status-sep"></span><span class="status-item" title="${settings.sqlDialect}">SQL · ${settings.sqlDialect.toUpperCase()}</span>`
      : ''

    this.container.innerHTML = `
      <span class="status-item">Ln ${position.lineNumber}, Col ${position.column}</span>
      <span class="status-sep"></span>
      <span class="status-item">${languageLabel}</span>
      ${sqlStatus}
      <span class="status-sep"></span>
      <span class="status-item">UTF-8</span>
      <span class="status-sep"></span>
      <span class="status-item">${eol}</span>
      ${jsonStatus}
    `
  }

  private renderJsonStatus(editorManager: EditorManager): string {
    const validation = editorManager.getJsonValidationStatus()
    if (!validation) return ''

    if (validation.valid) {
      return `
        <span class="status-sep"></span>
        <span class="status-item status-valid">Valid</span>
      `
    }

    return `
      <span class="status-sep"></span>
      <span class="status-item status-invalid" title="${escapeAttr(validation.error ?? 'Invalid JSON')}">Invalid JSON</span>
    `
  }
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}
