/**
 * @file fileHandlers.ts
 * @description IPC handlers for file dialogs, read/write, settings, and locale.
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

import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  FILE_FILTERS,
  IPC,
  MAX_FILE_SIZE_BYTES,
  normalizeAppSettings,
  type AppSettings,
} from '../constants'
import { ALL_SUPPORTED_EXTENSIONS } from '../../shared/languageRegistry'
import { addRecentFile, getRecentFiles } from '../recentFiles'
import { loadSettings, saveSettings } from '../settings'
import { refreshAppMenu } from '../menu'
import { setEditorContext } from '../editorContext'

function isSupportedFile(filePath: string): boolean {
  return ALL_SUPPORTED_EXTENSIONS.includes(path.extname(filePath).toLowerCase())
}

export function registerFileHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.FILE_OPEN_DIALOG, async () => {
    const result = await dialog.showOpenDialog(getMainWindow()!, {
      properties: ['openFile', 'multiSelections'],
      filters: FILE_FILTERS,
    })
    if (result.canceled) return null
    return result.filePaths.filter(isSupportedFile)
  })

  ipcMain.handle(IPC.FILE_READ, async (_event, filePath: string) => {
    if (!isSupportedFile(filePath)) {
      throw new Error(`Unsupported file type: ${path.extname(filePath)}`)
    }
    const stat = await fs.stat(filePath)
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB limit`)
    }
    const content = await fs.readFile(filePath, 'utf-8')
    await addRecentFile(filePath)
    const win = getMainWindow()
    if (win) await refreshAppMenu(win)
    return { content, filePath, fileName: path.basename(filePath) }
  })

  ipcMain.handle(IPC.FILE_WRITE, async (_event, filePath: string, content: string) => {
    if (!isSupportedFile(filePath)) {
      throw new Error(`Unsupported file type: ${path.extname(filePath)}`)
    }
    await fs.writeFile(filePath, content, 'utf-8')
    await addRecentFile(filePath)
    const win = getMainWindow()
    if (win) await refreshAppMenu(win)
    return { filePath, fileName: path.basename(filePath) }
  })

  ipcMain.handle(IPC.FILE_SAVE_AS_DIALOG, async (_event, defaultName?: string) => {
    const result = await dialog.showSaveDialog(getMainWindow()!, {
      defaultPath: defaultName,
      filters: FILE_FILTERS,
    })
    if (result.canceled || !result.filePath) return null
    let filePath = result.filePath
    const ext = path.extname(filePath).toLowerCase()
    if (!ext) {
      filePath += '.txt'
    } else if (!isSupportedFile(filePath)) {
      throw new Error(`Unsupported file type: ${ext}`)
    }
    return filePath
  })

  ipcMain.handle(IPC.DIALOG_MESSAGE_BOX, async (_event, options: Electron.MessageBoxOptions) => {
    const result = await dialog.showMessageBox(getMainWindow()!, options)
    return result.response
  })

  ipcMain.handle(IPC.SETTINGS_GET, async () => loadSettings())

  ipcMain.handle(IPC.SETTINGS_SET, async (_event, partial: Partial<AppSettings>) => {
    const current = await loadSettings()
    const next = normalizeAppSettings({ ...current, ...partial })
    await saveSettings(next)
    const win = getMainWindow()
    if (win) await refreshAppMenu(win)
    return next
  })

  ipcMain.handle(IPC.RECENT_GET, async () => getRecentFiles())

  ipcMain.handle(IPC.LOCALE_GET, async () => app.getLocale())

  ipcMain.handle(IPC.APP_GET_VERSION, async () => app.getVersion())

  ipcMain.on(IPC.WINDOW_SET_TITLE, (_event, title: string) => {
    getMainWindow()?.setTitle(title)
  })

  ipcMain.on(IPC.EDITOR_SET_CONTEXT, async (_event, context: { language: string; contentPreview?: boolean }) => {
    setEditorContext({
      language: context.language,
      contentPreview: context.contentPreview ?? false,
    })
    const win = getMainWindow()
    if (win) await refreshAppMenu(win)
  })
}

export { isSupportedFile }