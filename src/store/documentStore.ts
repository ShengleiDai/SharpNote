/**
 * @file documentStore.ts
 * @description Multi-tab document state and dirty tracking.
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

import { monaco } from '../editor/monacoSetup'
import { getDefaultFileName } from '../utils/language'
import { getPreviewModeForLanguage } from '../editor/languageEditor'

export interface DocumentTab {
  id: string
  filePath: string | null
  displayName: string
  language: string
  languageOverride: boolean
  contentPreview: boolean
  model: monaco.editor.ITextModel
  lastSavedContent: string
}

let untitledCounter = 1

export class DocumentStore {
  private tabs = new Map<string, DocumentTab>()
  private tabOrder: string[] = []
  private activeTabId: string | null = null
  private listeners = new Set<() => void>()
  private resolvePathLanguage: (filePath: string) => string = (filePath) => {
    const dot = filePath.lastIndexOf('.')
    const ext = dot >= 0 ? filePath.slice(dot).toLowerCase() : ''
    if (ext === '.json') return 'json'
    if (ext === '.md') return 'markdown'
    if (ext === '.sql') return 'sql'
    if (ext === '.txt' || ext === '.log') return 'plaintext'
    return 'plaintext'
  }

  constructor(
    private createModel: (content: string, language: string) => monaco.editor.ITextModel,
    private disposeModel: (model: monaco.editor.ITextModel) => void,
  ) {}

  setPathLanguageResolver(resolver: (filePath: string) => string): void {
    this.resolvePathLanguage = resolver
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((l) => l())
  }

  getTabs(): DocumentTab[] {
    return this.tabOrder.map((id) => this.tabs.get(id)!)
  }

  getActiveTab(): DocumentTab | null {
    return this.activeTabId ? this.tabs.get(this.activeTabId) ?? null : null
  }

  getActiveTabId(): string | null {
    return this.activeTabId
  }

  isDirty(tab: DocumentTab): boolean {
    return tab.model.getValue() !== tab.lastSavedContent
  }

  getDirtyTabs(): DocumentTab[] {
    return this.getTabs().filter((tab) => this.isDirty(tab))
  }

  newTab(content = '', filePath: string | null = null, displayName?: string): DocumentTab {
    const id = crypto.randomUUID()
    const name = displayName ?? getDefaultFileName(untitledCounter++)
    const language = filePath ? this.resolvePathLanguage(filePath) : 'plaintext'
    const model = this.createModel(content, language)
    const tab: DocumentTab = {
      id,
      filePath,
      displayName: name,
      language,
      languageOverride: false,
      contentPreview: false,
      model,
      lastSavedContent: content,
    }
    this.tabs.set(id, tab)
    this.tabOrder.push(id)
    this.activeTabId = id
    this.notify()
    return tab
  }

  openFile(filePath: string, fileName: string, content: string): DocumentTab {
    const existing = this.getTabs().find((t) => t.filePath === filePath)
    if (existing) {
      this.activeTabId = existing.id
      this.notify()
      return existing
    }
    return this.newTab(content, filePath, fileName)
  }

  switchTab(tabId: string): DocumentTab | null {
    if (!this.tabs.has(tabId)) return null
    this.activeTabId = tabId
    this.notify()
    return this.tabs.get(tabId)!
  }

  markSaved(tabId: string, content: string, filePath?: string, displayName?: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return
    tab.lastSavedContent = content
    if (filePath !== undefined) tab.filePath = filePath
    if (displayName !== undefined) tab.displayName = displayName
    if (filePath && !tab.languageOverride) {
      const lang = this.resolvePathLanguage(filePath)
      if (lang !== tab.language) {
        tab.language = lang
        monaco.editor.setModelLanguage(tab.model, lang)
      }
    }
    this.notify()
  }

  setLanguage(tabId: string, language: string): DocumentTab | null {
    const tab = this.tabs.get(tabId)
    if (!tab) return null
    tab.language = language
    tab.languageOverride = true
    if (getPreviewModeForLanguage(language) === null) {
      tab.contentPreview = false
    }
    monaco.editor.setModelLanguage(tab.model, language)
    this.notify()
    return tab
  }

  applyPathLanguageToTab(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab?.filePath || tab.languageOverride) return
    const lang = this.resolvePathLanguage(tab.filePath)
    if (lang === tab.language) return
    tab.language = lang
    monaco.editor.setModelLanguage(tab.model, lang)
    this.notify()
  }

  toggleContentPreview(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false
    tab.contentPreview = !tab.contentPreview
    this.notify()
    return tab.contentPreview
  }

  setContentPreview(tabId: string, enabled: boolean): void {
    const tab = this.tabs.get(tabId)
    if (!tab || tab.contentPreview === enabled) return
    tab.contentPreview = enabled
    this.notify()
  }

  updateFilePath(tabId: string, filePath: string, displayName: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) return
    tab.filePath = filePath
    tab.displayName = displayName
    if (!tab.languageOverride) {
      const lang = this.resolvePathLanguage(filePath)
      if (lang !== tab.language) {
        tab.language = lang
        monaco.editor.setModelLanguage(tab.model, lang)
      }
    }
    this.notify()
  }

  closeTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false
    const index = this.tabOrder.indexOf(tabId)
    this.disposeModel(tab.model)
    this.tabs.delete(tabId)
    this.tabOrder = this.tabOrder.filter((id) => id !== tabId)

    if (this.activeTabId === tabId) {
      if (this.tabOrder.length === 0) {
        this.activeTabId = null
      } else {
        const nextIndex = Math.min(index, this.tabOrder.length - 1)
        this.activeTabId = this.tabOrder[nextIndex]
      }
    }
    this.notify()
    return true
  }

  hasOpenTabs(): boolean {
    return this.tabOrder.length > 0
  }
}
