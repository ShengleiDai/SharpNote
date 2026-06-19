/**
 * @file constants.ts
 * @description Shared main-process constants: IPC channels, settings schema, menu actions.
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

import {
  ALL_SUPPORTED_EXTENSIONS,
  buildFileFilters,
  type SqlDialect,
  type SqlKeywordCase,
} from '../shared/languageRegistry'

export const SUPPORTED_EXTENSIONS = ALL_SUPPORTED_EXTENSIONS

export const FILE_FILTERS: Electron.FileFilter[] = buildFileFilters()

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_RECENT_FILES = 10

export const APP_NAME = 'SharpNote'

export const IPC = {
  FILE_OPEN_DIALOG: 'file:open-dialog',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_SAVE_AS_DIALOG: 'file:save-as-dialog',
  FOLDER_OPEN_DIALOG: 'folder:open-dialog',
  FS_READ_DIRECTORY: 'fs:read-directory',
  FS_CREATE_FILE: 'fs:create-file',
  FS_DELETE_PATH: 'fs:delete-path',
  FS_RENAME_PATH: 'fs:rename-path',
  DIALOG_MESSAGE_BOX: 'dialog:show-message-box',
  WINDOW_SET_TITLE: 'window:set-title',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  MENU_ACTION: 'menu:action',
  APP_BEFORE_QUIT: 'app:before-quit',
  APP_QUIT_CONFIRMED: 'app:quit-confirmed',
  APP_QUIT_CANCELLED: 'app:quit-cancelled',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  RECENT_GET: 'recent:get',
  MENU_REFRESH: 'menu:refresh',
  EDITOR_SET_CONTEXT: 'editor:set-context',
  LOCALE_GET: 'locale:get',
  APP_GET_VERSION: 'app:get-version',
} as const

export type UiLanguage = 'system' | 'zh' | 'en'
export type JsonIndentSize = 2 | 4
export type { SqlDialect, SqlKeywordCase }

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

export const DEFAULT_SETTINGS: AppSettings = {
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

const SQL_DIALECTS = new Set<SqlDialect>(['sql', 'mysql', 'postgresql', 'sqlserver', 'sqlite', 'oracle', 'bigquery'])

export function normalizeAppSettings(parsed: Partial<AppSettings>): AppSettings {
  return {
    lineNumbers: parsed.lineNumbers ?? DEFAULT_SETTINGS.lineNumbers,
    jsonIndentSize: parsed.jsonIndentSize === 4 ? 4 : 2,
    sidebarVisible: parsed.sidebarVisible ?? DEFAULT_SETTINGS.sidebarVisible,
    sidebarWidth: typeof parsed.sidebarWidth === 'number' && parsed.sidebarWidth >= 160
      ? Math.min(parsed.sidebarWidth, 480)
      : DEFAULT_SETTINGS.sidebarWidth,
    workspaceRoot: typeof parsed.workspaceRoot === 'string' ? parsed.workspaceRoot : null,
    uiLanguage: parsed.uiLanguage === 'zh' || parsed.uiLanguage === 'en' ? parsed.uiLanguage : 'system',
    sqlDialect: parsed.sqlDialect && SQL_DIALECTS.has(parsed.sqlDialect) ? parsed.sqlDialect : DEFAULT_SETTINGS.sqlDialect,
    sqlKeywordCase: parsed.sqlKeywordCase === 'lower' || parsed.sqlKeywordCase === 'preserve'
      ? parsed.sqlKeywordCase
      : DEFAULT_SETTINGS.sqlKeywordCase,
    sqlIndentSize: parsed.sqlIndentSize === 4 ? 4 : 2,
    sqlLinesBetweenQueries: parsed.sqlLinesBetweenQueries === 0 ? 0 : 1,
    firstRunCompleted: 'firstRunCompleted' in parsed ? !!parsed.firstRunCompleted : true,
  }
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
