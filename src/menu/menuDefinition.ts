/**
 * @file menuDefinition.ts
 * @description Menu structure and item definitions.
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

import type { MenuAction } from '../types/finmind'
import type { MessageKey } from '../i18n'
import type { MenuBarState } from '../components/menuBar'
import { buildLanguageMenuEntries } from './languageMenu'

export type MenuEntry =
  | { type: 'separator' }
  | {
      type: 'item'
      labelKey: MessageKey
      label?: string
      action?: MenuAction
      payload?: string
      shortcut?: string
      disabled?: boolean
      checked?: boolean
    }
  | {
      type: 'submenu'
      labelKey: MessageKey
      disabled?: boolean
      children: MenuEntry[]
    }

export interface MenuGroup {
  id: string
  labelKey: MessageKey
  children: MenuEntry[]
}

export function buildMenuGroups(state: MenuBarState): MenuGroup[] {
  const recentItems: MenuEntry[] = state.recentFiles.length > 0
    ? state.recentFiles.map((filePath) => ({
        type: 'item' as const,
        label: filePath,
        labelKey: 'empty' as MessageKey,
        action: 'file:open-recent' as MenuAction,
        payload: filePath,
      }))
    : [{ type: 'item' as const, labelKey: 'empty', disabled: true }]

  return [
    {
      id: 'file',
      labelKey: 'menuFile',
      children: [
        { type: 'item', labelKey: 'fileNew', action: 'file:new', shortcut: 'Ctrl+N' },
        { type: 'item', labelKey: 'fileOpen', action: 'file:open', shortcut: 'Ctrl+O' },
        { type: 'item', labelKey: 'fileOpenFolder', action: 'file:open-folder', shortcut: 'Ctrl+Shift+O' },
        { type: 'item', labelKey: 'fileNewFromClipboard', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'fileSave', action: 'file:save', shortcut: 'Ctrl+S' },
        { type: 'item', labelKey: 'fileSaveAs', action: 'file:save-as', shortcut: 'Ctrl+Shift+S' },
        { type: 'item', labelKey: 'fileSaveAll', action: 'file:save-all', shortcut: 'Ctrl+Alt+S' },
        { type: 'separator' },
        { type: 'item', labelKey: 'fileClose', action: 'file:close-tab', shortcut: 'Ctrl+W' },
        { type: 'item', labelKey: 'fileCloseAll', action: 'file:close-all' },
        { type: 'item', labelKey: 'fileRename', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'filePageSetup', disabled: true },
        { type: 'item', labelKey: 'filePrint', disabled: true, shortcut: 'Ctrl+P' },
        { type: 'separator' },
        { type: 'submenu', labelKey: 'fileRecent', children: recentItems },
        { type: 'separator' },
        { type: 'item', labelKey: 'fileExit', action: 'file:exit', shortcut: 'Alt+F4' },
      ],
    },
    {
      id: 'edit',
      labelKey: 'menuEdit',
      children: [
        { type: 'item', labelKey: 'editUndo', action: 'edit:undo', shortcut: 'Ctrl+Z' },
        { type: 'item', labelKey: 'editRedo', action: 'edit:redo', shortcut: 'Ctrl+Y' },
        { type: 'separator' },
        { type: 'item', labelKey: 'editCut', action: 'edit:cut', shortcut: 'Ctrl+X' },
        { type: 'item', labelKey: 'editCopy', action: 'edit:copy', shortcut: 'Ctrl+C' },
        { type: 'item', labelKey: 'editPaste', action: 'edit:paste', shortcut: 'Ctrl+V' },
        { type: 'item', labelKey: 'editDelete', action: 'edit:delete', shortcut: 'Del' },
        { type: 'item', labelKey: 'editSelectAll', action: 'edit:select-all', shortcut: 'Ctrl+A' },
        { type: 'separator' },
        { type: 'item', labelKey: 'editColumnMode', disabled: true },
        { type: 'item', labelKey: 'editClipboardHistory', disabled: true, shortcut: 'Ctrl+Shift+V' },
        { type: 'item', labelKey: 'editCopyAsRtf', disabled: true },
        { type: 'item', labelKey: 'editCopyAsHtml', disabled: true },
        { type: 'item', labelKey: 'editAdvanced', disabled: true },
        { type: 'item', labelKey: 'editInsertSpecialChar', disabled: true },
        { type: 'item', labelKey: 'editBookmarks', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'editFormatDocument', action: 'edit:format-document', shortcut: 'Shift+Alt+F', disabled: !state.canFormatDocument },
        { type: 'item', labelKey: 'editFormatSelection', action: 'edit:format-selection', disabled: !state.canFormatSelection },
      ],
    },
    {
      id: 'search',
      labelKey: 'menuSearch',
      children: [
        { type: 'item', labelKey: 'searchFind', action: 'edit:find', shortcut: 'Ctrl+F' },
        { type: 'item', labelKey: 'searchReplace', action: 'edit:replace', shortcut: 'Ctrl+H' },
        { type: 'item', labelKey: 'searchFindInFiles', disabled: true, shortcut: 'Ctrl+Shift+F' },
        { type: 'item', labelKey: 'searchReplaceInFiles', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'searchFindNext', action: 'edit:find-next', shortcut: 'F3' },
        { type: 'item', labelKey: 'searchFindPrevious', action: 'edit:find-previous', shortcut: 'Shift+F3' },
        { type: 'item', labelKey: 'searchMarkAll', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'searchGotoLine', action: 'search:goto-line', shortcut: 'Ctrl+G' },
        { type: 'item', labelKey: 'searchGotoBracket', disabled: true, shortcut: 'Ctrl+B' },
        { type: 'item', labelKey: 'searchIncremental', disabled: true },
      ],
    },
    {
      id: 'view',
      labelKey: 'menuView',
      children: [
        { type: 'item', labelKey: 'viewShowSymbols', disabled: true },
        { type: 'item', labelKey: 'viewWordWrap', disabled: true },
        { type: 'item', labelKey: 'viewIndentGuides', disabled: true },
        {
          type: 'submenu',
          labelKey: 'viewFolding',
          disabled: !state.foldable,
          children: [
            { type: 'item', labelKey: 'viewFold', action: 'view:fold', shortcut: 'Ctrl+Shift+[', disabled: !state.foldable },
            { type: 'item', labelKey: 'viewUnfold', action: 'view:unfold', shortcut: 'Ctrl+Shift+]', disabled: !state.foldable },
            { type: 'separator' },
            { type: 'item', labelKey: 'viewFoldAll', action: 'view:fold-all', disabled: !state.foldable },
            { type: 'item', labelKey: 'viewUnfoldAll', action: 'view:unfold-all', disabled: !state.foldable },
          ],
        },
        { type: 'item', labelKey: 'viewZoom', disabled: true },
        { type: 'item', labelKey: 'viewFullscreen', disabled: true, shortcut: 'F11' },
        { type: 'item', labelKey: 'viewFocusMode', disabled: true },
        { type: 'item', labelKey: 'viewMinimap', disabled: true },
        { type: 'item', labelKey: 'viewDocStructure', disabled: true },
        { type: 'item', labelKey: 'viewToolbar', disabled: true },
        { type: 'item', labelKey: 'viewTabPosition', disabled: true },
        { type: 'item', labelKey: 'viewAlwaysOnTop', disabled: true },
        { type: 'item', labelKey: 'viewSplitWindow', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'viewLineNumbers', action: 'view:toggle-line-numbers', checked: state.lineNumbers },
        { type: 'item', labelKey: 'viewSidebar', action: 'view:toggle-sidebar', shortcut: 'Ctrl+B', checked: state.sidebarVisible },
        { type: 'item', labelKey: 'viewJsonPreview', action: 'view:toggle-json-preview', shortcut: 'Ctrl+Shift+P', checked: state.contentPreview && state.isJson, disabled: !state.isJson },
        { type: 'item', labelKey: 'viewMdPreview', action: 'view:toggle-markdown-preview', shortcut: 'Ctrl+Shift+M', checked: state.contentPreview && state.isMarkdown, disabled: !state.isMarkdown },
        {
          type: 'submenu',
          labelKey: 'viewJsonIndent',
          disabled: !state.isJson,
          children: [
            { type: 'item', labelKey: 'viewIndent2', action: 'view:indent-2', checked: state.jsonIndentSize === 2, disabled: !state.isJson },
            { type: 'item', labelKey: 'viewIndent4', action: 'view:indent-4', checked: state.jsonIndentSize === 4, disabled: !state.isJson },
          ],
        },
      ],
    },
    {
      id: 'encoding',
      labelKey: 'menuEncoding',
      children: [
        { type: 'item', labelKey: 'encCharset', disabled: true },
        { type: 'item', labelKey: 'encUtf8', checked: true, disabled: true },
        { type: 'item', labelKey: 'encConvert', disabled: true },
        { type: 'item', labelKey: 'encReopen', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'encLineEnding', disabled: true },
      ],
    },
    {
      id: 'language',
      labelKey: 'menuLanguage',
      children: buildLanguageMenuEntries(state),
    },
    {
      id: 'settings',
      labelKey: 'menuSettings',
      children: [
        { type: 'item', labelKey: 'settingsPreferences', disabled: true },
        { type: 'item', labelKey: 'settingsStyleConfigurator', disabled: true },
        { type: 'item', labelKey: 'settingsPluginManager', disabled: true },
        { type: 'item', labelKey: 'settingsReset', disabled: true },
        { type: 'separator' },
        {
          type: 'submenu',
          labelKey: 'settingsSqlDialect',
          children: [
            { type: 'item', labelKey: 'sqlDialectAnsi', action: 'settings:sql-dialect', payload: 'sql', checked: state.sqlDialect === 'sql' },
            { type: 'item', labelKey: 'sqlDialectMysql', action: 'settings:sql-dialect', payload: 'mysql', checked: state.sqlDialect === 'mysql' },
            { type: 'item', labelKey: 'sqlDialectPostgresql', action: 'settings:sql-dialect', payload: 'postgresql', checked: state.sqlDialect === 'postgresql' },
            { type: 'item', labelKey: 'sqlDialectSqlserver', action: 'settings:sql-dialect', payload: 'sqlserver', checked: state.sqlDialect === 'sqlserver' },
            { type: 'item', labelKey: 'sqlDialectSqlite', action: 'settings:sql-dialect', payload: 'sqlite', checked: state.sqlDialect === 'sqlite' },
            { type: 'item', labelKey: 'sqlDialectOracle', action: 'settings:sql-dialect', payload: 'oracle', checked: state.sqlDialect === 'oracle' },
            { type: 'item', labelKey: 'sqlDialectBigquery', action: 'settings:sql-dialect', payload: 'bigquery', checked: state.sqlDialect === 'bigquery' },
          ],
        },
        {
          type: 'submenu',
          labelKey: 'settingsSqlKeywordCase',
          children: [
            { type: 'item', labelKey: 'sqlKeywordUpper', action: 'settings:sql-keyword-case', payload: 'upper', checked: state.sqlKeywordCase === 'upper' },
            { type: 'item', labelKey: 'sqlKeywordLower', action: 'settings:sql-keyword-case', payload: 'lower', checked: state.sqlKeywordCase === 'lower' },
            { type: 'item', labelKey: 'sqlKeywordPreserve', action: 'settings:sql-keyword-case', payload: 'preserve', checked: state.sqlKeywordCase === 'preserve' },
          ],
        },
        {
          type: 'submenu',
          labelKey: 'settingsSqlIndent',
          children: [
            { type: 'item', labelKey: 'viewIndent2', action: 'settings:sql-indent-2', checked: state.sqlIndentSize === 2 },
            { type: 'item', labelKey: 'viewIndent4', action: 'settings:sql-indent-4', checked: state.sqlIndentSize === 4 },
          ],
        },
        {
          type: 'submenu',
          labelKey: 'settingsUiLanguage',
          children: [
            { type: 'item', labelKey: 'settingsLangSystem', action: 'settings:ui-language-system', checked: state.uiLanguage === 'system' },
            { type: 'item', labelKey: 'settingsLangZh', action: 'settings:ui-language-zh', checked: state.uiLanguage === 'zh' },
            { type: 'item', labelKey: 'settingsLangEn', action: 'settings:ui-language-en', checked: state.uiLanguage === 'en' },
          ],
        },
      ],
    },
    {
      id: 'tools',
      labelKey: 'menuTools',
      children: [
        { type: 'item', labelKey: 'toolsPluginCommands', disabled: true },
        { type: 'item', labelKey: 'settingsPluginManager', disabled: true },
        { type: 'item', labelKey: 'toolsExternalTools', disabled: true },
        { type: 'item', labelKey: 'toolsAsciiTable', disabled: true },
        { type: 'item', labelKey: 'toolsWordCount', disabled: true },
        { type: 'item', labelKey: 'toolsCompareFiles', disabled: true },
        { type: 'item', labelKey: 'toolsAlign', disabled: true },
        { type: 'item', labelKey: 'toolsGenerate', disabled: true },
        { type: 'item', labelKey: 'toolsSnippets', disabled: true },
        { type: 'item', labelKey: 'toolsScreenshot', disabled: true },
      ],
    },
    {
      id: 'macro',
      labelKey: 'menuMacro',
      children: [
        { type: 'item', labelKey: 'macroStart', disabled: true },
        { type: 'item', labelKey: 'macroStop', disabled: true },
        { type: 'item', labelKey: 'macroPlay', disabled: true },
        { type: 'item', labelKey: 'macroSave', disabled: true },
        { type: 'item', labelKey: 'macroManage', disabled: true },
        { type: 'item', labelKey: 'macroRunMultiple', disabled: true },
      ],
    },
    {
      id: 'run',
      labelKey: 'menuRun',
      children: [
        { type: 'item', labelKey: 'runRun', disabled: true, shortcut: 'F5' },
        { type: 'item', labelKey: 'runCompileRun', disabled: true },
        { type: 'item', labelKey: 'runExternal', disabled: true },
        { type: 'item', labelKey: 'runConfigure', disabled: true },
      ],
    },
    {
      id: 'window',
      labelKey: 'menuWindow',
      children: [
        { type: 'item', labelKey: 'windowCascade', disabled: true },
        { type: 'item', labelKey: 'windowTileHorizontal', disabled: true },
        { type: 'item', labelKey: 'windowTileVertical', disabled: true },
        { type: 'item', labelKey: 'windowDocList', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'windowNextDoc', action: 'window:next-document', shortcut: 'Ctrl+Tab' },
        { type: 'item', labelKey: 'windowPrevDoc', action: 'window:prev-document', shortcut: 'Ctrl+Shift+Tab' },
        { type: 'item', labelKey: 'windowSyncScroll', disabled: true },
        { type: 'separator' },
        { type: 'item', labelKey: 'windowNew', disabled: true },
        { type: 'item', labelKey: 'windowCloseAll', disabled: true },
      ],
    },
    {
      id: 'help',
      labelKey: 'menuHelp',
      children: [
        { type: 'item', labelKey: 'helpAbout', action: 'help:about' },
        { type: 'item', labelKey: 'helpCheckUpdate', disabled: true },
        { type: 'item', labelKey: 'helpGuide', disabled: true },
        { type: 'item', labelKey: 'helpShortcuts', disabled: true },
        { type: 'item', labelKey: 'helpDebugInfo', disabled: true },
        { type: 'item', labelKey: 'helpFeedback', disabled: true },
      ],
    },
  ]
}
