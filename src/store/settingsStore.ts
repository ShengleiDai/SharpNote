/**
 * @file settingsStore.ts
 * @description Renderer settings store synced with main process.
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

import { createTranslator, getAppName, resolveLocale, type MessageKey, type ResolvedLocale, type UiLanguage } from '../i18n'
import { defineSublimeTheme, type MonacoThemeId } from '../editor/monacoThemes'
import type { SqlDialect, SqlKeywordCase } from '../../shared/languageRegistry'

export type JsonIndentSize = 2 | 4
export type { UiLanguage, ResolvedLocale, MessageKey, SqlDialect, SqlKeywordCase }

export interface AppSettings {
  lineNumbers: boolean
  jsonIndentSize: JsonIndentSize
  sidebarVisible: boolean
  sidebarWidth: number
  workspaceRoot: string | null
  uiLanguage: UiLanguage
  sqlDialect: SqlDialect
  sqlKeywordCase: SqlKeywordCase
  sqlIndentSize: JsonIndentSize
  sqlLinesBetweenQueries: 0 | 1
  firstRunCompleted: boolean
}

export class SettingsStore {
  private settings: AppSettings = {
    lineNumbers: true,
    jsonIndentSize: 2,
    sidebarVisible: true,
    sidebarWidth: 240,
    workspaceRoot: null,
    uiLanguage: 'system',
    sqlDialect: 'sql',
    sqlKeywordCase: 'upper',
  sqlIndentSize: 2,
  sqlLinesBetweenQueries: 1,
  firstRunCompleted: false,
}
  private systemLocale = 'en-US'
  private listeners = new Set<() => void>()

  async load(): Promise<void> {
    this.systemLocale = await window.finmind.getSystemLocale()
    this.settings = await window.finmind.getSettings()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((l) => l())
  }

  getSettings(): AppSettings {
    return { ...this.settings }
  }

  getFormatSettings() {
    const s = this.settings
    return {
      sqlDialect: s.sqlDialect,
      sqlKeywordCase: s.sqlKeywordCase,
      sqlIndentSize: s.sqlIndentSize,
      sqlLinesBetweenQueries: s.sqlLinesBetweenQueries,
    }
  }

  getResolvedLocale(): ResolvedLocale {
    return resolveLocale(this.settings.uiLanguage, this.systemLocale)
  }

  translate(key: MessageKey): string {
    return createTranslator(this.getResolvedLocale())(key)
  }

  getAppName(): string {
    return getAppName(this.getResolvedLocale())
  }

  getMonacoTheme(): MonacoThemeId {
    defineSublimeTheme()
    return 'finmind-sublime'
  }

  async setUiLanguage(uiLanguage: UiLanguage): Promise<void> {
    if (this.settings.uiLanguage === uiLanguage) return
    this.settings = await window.finmind.setSettings({ uiLanguage })
    this.notify()
  }

  async toggleLineNumbers(): Promise<void> {
    this.settings = await window.finmind.setSettings({
      lineNumbers: !this.settings.lineNumbers,
    })
    this.notify()
  }

  async setLineNumbers(enabled: boolean): Promise<void> {
    if (this.settings.lineNumbers === enabled) return
    this.settings = await window.finmind.setSettings({ lineNumbers: enabled })
    this.notify()
  }

  async setJsonIndentSize(size: JsonIndentSize): Promise<void> {
    if (this.settings.jsonIndentSize === size) return
    this.settings = await window.finmind.setSettings({ jsonIndentSize: size })
    this.notify()
  }

  async setSqlDialect(dialect: SqlDialect): Promise<void> {
    if (this.settings.sqlDialect === dialect) return
    this.settings = await window.finmind.setSettings({ sqlDialect: dialect })
    this.notify()
  }

  async setSqlKeywordCase(keywordCase: SqlKeywordCase): Promise<void> {
    if (this.settings.sqlKeywordCase === keywordCase) return
    this.settings = await window.finmind.setSettings({ sqlKeywordCase: keywordCase })
    this.notify()
  }

  async setSqlIndentSize(size: JsonIndentSize): Promise<void> {
    if (this.settings.sqlIndentSize === size) return
    this.settings = await window.finmind.setSettings({ sqlIndentSize: size })
    this.notify()
  }

  async toggleSidebar(): Promise<void> {
    this.settings = await window.finmind.setSettings({
      sidebarVisible: !this.settings.sidebarVisible,
    })
    this.notify()
  }

  async setSidebarWidth(width: number): Promise<void> {
    const sidebarWidth = Math.min(480, Math.max(160, Math.round(width)))
    if (this.settings.sidebarWidth === sidebarWidth) return
    this.settings = { ...this.settings, sidebarWidth }
    this.settings = await window.finmind.setSettings({ sidebarWidth })
  }

  async setWorkspaceRoot(workspaceRoot: string | null): Promise<void> {
    this.settings = await window.finmind.setSettings({ workspaceRoot })
    this.notify()
  }

  async completeFirstRun(): Promise<void> {
    if (this.settings.firstRunCompleted) return
    this.settings = await window.finmind.setSettings({ firstRunCompleted: true })
    this.notify()
  }
}
