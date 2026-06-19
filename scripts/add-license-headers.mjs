/**
 * @file add-license-headers.mjs
 * @description One-time utility to prepend Apache 2.0 file headers to source files.
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

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const MARKER = 'Licensed under the Apache License, Version 2.0'

const FILE_DESCRIPTIONS = {
  'electron/main.ts': 'Electron main process entry: window lifecycle and IPC registration.',
  'electron/preload.ts': 'Preload script exposing the typed finmind API via contextBridge.',
  'electron/constants.ts': 'Shared main-process constants: IPC channels, settings schema, menu actions.',
  'electron/settings.ts': 'Persistent application settings read/write in userData.',
  'electron/menu.ts': 'Native application menu construction and refresh.',
  'electron/windowHandlers.ts': 'IPC handlers for window title and chrome controls.',
  'electron/editorContext.ts': 'Editor context state for native menu enablement.',
  'electron/recentFiles.ts': 'Recent files list persistence.',
  'electron/electron-env.d.ts': 'Type augmentations for the Electron + Vite environment.',
  'electron/ipc/fileHandlers.ts': 'IPC handlers for file dialogs, read/write, settings, and locale.',
  'electron/ipc/fsHandlers.ts': 'IPC handlers for directory listing and workspace file operations.',
  'src/main.ts': 'Renderer process bootstrap.',
  'src/app.ts': 'Application orchestration: tabs, preview, sidebar, and menu actions.',
  'src/vite-env.d.ts': 'Vite client type references.',
  'src/types/finmind.d.ts': 'TypeScript definitions for window.finmind preload API.',
  'src/constants/app.ts': 'Renderer-side application constants.',
  'src/i18n/index.ts': 'Locale resolution and translator factory.',
  'src/i18n/messages.ts': 'UI string catalog for Chinese and English.',
  'src/i18n/types.ts': 'Internationalization type definitions.',
  'src/store/documentStore.ts': 'Multi-tab document state and dirty tracking.',
  'src/store/settingsStore.ts': 'Renderer settings store synced with main process.',
  'src/editor/editorManager.ts': 'Monaco Editor instance and model lifecycle management.',
  'src/editor/languageEditor.ts': 'Language-specific editor capabilities and preview modes.',
  'src/editor/monacoSetup.ts': 'Monaco worker and environment configuration.',
  'src/editor/monacoThemes.ts': 'Custom Monaco editor themes.',
  'src/editor/editorContextActions.ts': 'Editor context menu action wiring.',
  'src/editor/format/formatService.ts': 'Document and selection formatting dispatch.',
  'src/editor/format/monacoFormatter.ts': 'Monaco built-in formatter integration.',
  'src/editor/format/sqlFormatter.ts': 'SQL formatting via sql-formatter.',
  'src/components/tabBar.ts': 'Document tab bar UI component.',
  'src/components/titleBar.ts': 'Custom frameless window title bar.',
  'src/components/statusBar.ts': 'Editor status bar (cursor, language, encoding).',
  'src/components/menuBar.ts': 'In-app menu bar component.',
  'src/components/sidebar.ts': 'Workspace sidebar with resizable file tree.',
  'src/components/fileTree.ts': 'Directory tree rendering and interactions.',
  'src/components/splitPane.ts': 'Editor/preview split pane layout.',
  'src/components/findReplaceBar.ts': 'Find and replace toolbar.',
  'src/components/promptDialog.ts': 'Modal prompt dialog component.',
  'src/components/contextMenu.ts': 'Reusable context menu helper.',
  'src/components/jsonPreviewPanel.ts': 'JSON tree preview panel with navigation.',
  'src/components/markdownPreviewPanel.ts': 'Markdown preview panel with Mermaid rendering.',
  'src/components/welcomeWizard.ts': 'First-run welcome wizard UI.',
  'src/menu/menuDefinition.ts': 'Menu structure and item definitions.',
  'src/menu/languageMenu.ts': 'Language mode submenu builder.',
  'src/utils/language.ts': 'File path to Monaco language ID mapping.',
  'src/utils/markdownRender.ts': 'Lightweight Markdown to HTML renderer.',
  'src/utils/mermaidRenderer.ts': 'Dynamic Mermaid load, theme, and SVG rendering.',
  'src/utils/jsonTree.ts': 'JSON parse tree utilities for preview navigation.',
  'src/utils/fileIcons.ts': 'SVG file type icons for the sidebar tree.',
  'src/utils/eol.ts': 'End-of-line detection and normalization helpers.',
  'src/config/languageRegistry.ts': 'Re-export of shared language registry for renderer.',
  'shared/languageRegistry.ts': 'Supported file extensions, SQL dialects, and language metadata.',
  'scripts/generate-icons.mjs': 'Build script: generate ICO and PNG icons from SVG.',
  'scripts/afterPack.mjs': 'electron-builder hook: embed Windows executable icon via rcedit.',
  'vite.config.ts': 'Vite and Electron build configuration.',
}

function buildHeader(relativePath) {
  const fileName = path.basename(relativePath)
  const description = FILE_DESCRIPTIONS[relativePath.replace(/\\/g, '/')]
    ?? `${fileName} — SharpNote source module.`

  return `/**
 * @file ${fileName}
 * @description ${description}
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

`
}

const targets = []
for (const dir of ['electron', 'src', 'shared', 'scripts']) {
  const base = path.join(root, dir)
  if (!fs.existsSync(base)) continue
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|mjs)$/.test(entry.name)) targets.push(full)
    }
  }
  walk(base)
}
targets.push(path.join(root, 'vite.config.ts'))

let updated = 0
for (const file of targets.sort()) {
  const content = fs.readFileSync(file, 'utf-8')
  if (content.includes(MARKER)) continue
  const relative = path.relative(root, file)
  fs.writeFileSync(file, buildHeader(relative) + content, 'utf-8')
  updated += 1
  console.log('header added:', relative)
}

console.log(`Done. ${updated} file(s) updated.`)
