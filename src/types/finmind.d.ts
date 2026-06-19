/**
 * @file finmind.d.ts
 * @description TypeScript definitions for window.finmind preload API.
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

export type JsonIndentSize = 2 | 4
export type UiLanguage = 'system' | 'zh' | 'en'
export type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'sqlserver' | 'sqlite' | 'oracle' | 'bigquery'
export type SqlKeywordCase = 'upper' | 'lower' | 'preserve'

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

export type MenuAction =
  | 'file:new'
  | 'file:open'
  | 'file:open-folder'
  | 'file:open-recent'
  | 'file:save'
  | 'file:save-as'
  | 'file:save-all'
  | 'file:close-tab'
  | 'file:close-all'
  | 'file:exit'
  | 'edit:undo'
  | 'edit:redo'
  | 'edit:cut'
  | 'edit:copy'
  | 'edit:paste'
  | 'edit:find'
  | 'edit:replace'
  | 'edit:find-next'
  | 'edit:find-previous'
  | 'edit:format-document'
  | 'edit:format-selection'
  | 'edit:select-all'
  | 'edit:delete'
  | 'search:goto-line'
  | 'view:toggle-line-numbers'
  | 'view:language-json'
  | 'view:language-markdown'
  | 'view:language-plaintext'
  | 'view:language-set'
  | 'view:fold'
  | 'view:unfold'
  | 'view:fold-all'
  | 'view:unfold-all'
  | 'view:indent-2'
  | 'view:indent-4'
  | 'view:toggle-json-preview'
  | 'view:toggle-markdown-preview'
  | 'view:toggle-sidebar'
  | 'settings:ui-language-system'
  | 'settings:ui-language-zh'
  | 'settings:ui-language-en'
  | 'settings:sql-dialect'
  | 'settings:sql-keyword-case'
  | 'settings:sql-indent-2'
  | 'settings:sql-indent-4'
  | 'window:next-document'
  | 'window:prev-document'
  | 'help:about'

export interface FsEntry {
  name: string
  path: string
  isDirectory: boolean
}

export interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  title?: string
  message: string
  detail?: string
  buttons?: string[]
  defaultId?: number
  cancelId?: number
}

export interface FinMindAPI {
  openFileDialog(): Promise<string[] | null>
  openFolderDialog(): Promise<string | null>
  readDirectory(dirPath: string): Promise<FsEntry[]>
  createFile(dirPath: string, fileName: string): Promise<{ filePath: string; fileName: string }>
  deletePath(targetPath: string, workspaceRoot?: string | null): Promise<void>
  renamePath(filePath: string, newName: string): Promise<{ filePath: string; fileName: string }>
  readFile(filePath: string): Promise<{ content: string; filePath: string; fileName: string }>
  writeFile(filePath: string, content: string): Promise<{ filePath: string; fileName: string }>
  saveAsDialog(defaultName?: string): Promise<string | null>
  showMessageBox(options: MessageBoxOptions): Promise<number>
  getSettings(): Promise<AppSettings>
  setSettings(partial: Partial<AppSettings>): Promise<AppSettings>
  getRecentFiles(): Promise<string[]>
  getSystemLocale(): Promise<string>
  getAppVersion(): Promise<string>
  setTitle(title: string): void
  minimizeWindow(): void
  maximizeWindow(): void
  closeWindow(): void
  setEditorContext(context: { language: string; contentPreview?: boolean }): void
  onMenuAction(callback: (action: MenuAction, payload?: string) => void): () => void
  onBeforeQuit(callback: () => void): () => void
  confirmQuit(): void
  cancelQuit(): void
}

declare global {
  interface Window {
    finmind: FinMindAPI
  }
}

export {}
