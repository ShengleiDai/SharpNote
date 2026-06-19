/**
 * @file preload.ts
 * @description Preload script exposing the typed finmind API via contextBridge.
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

import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from './constants'
import type { AppSettings, MenuAction } from './constants'

const finmind = {
  openFileDialog: (): Promise<string[] | null> =>
    ipcRenderer.invoke(IPC.FILE_OPEN_DIALOG),

  openFolderDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC.FOLDER_OPEN_DIALOG),

  readDirectory: (dirPath: string): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> =>
    ipcRenderer.invoke(IPC.FS_READ_DIRECTORY, dirPath),

  createFile: (dirPath: string, fileName: string): Promise<{ filePath: string; fileName: string }> =>
    ipcRenderer.invoke(IPC.FS_CREATE_FILE, dirPath, fileName),

  deletePath: (targetPath: string, workspaceRoot?: string | null): Promise<void> =>
    ipcRenderer.invoke(IPC.FS_DELETE_PATH, targetPath, workspaceRoot ?? null),

  renamePath: (filePath: string, newName: string): Promise<{ filePath: string; fileName: string }> =>
    ipcRenderer.invoke(IPC.FS_RENAME_PATH, filePath, newName),

  readFile: (filePath: string): Promise<{ content: string; filePath: string; fileName: string }> =>
    ipcRenderer.invoke(IPC.FILE_READ, filePath),

  writeFile: (filePath: string, content: string): Promise<{ filePath: string; fileName: string }> =>
    ipcRenderer.invoke(IPC.FILE_WRITE, filePath, content),

  saveAsDialog: (defaultName?: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC.FILE_SAVE_AS_DIALOG, defaultName),

  showMessageBox: (options: Electron.MessageBoxOptions): Promise<number> =>
    ipcRenderer.invoke(IPC.DIALOG_MESSAGE_BOX, options),

  getSettings: (): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_GET),

  setSettings: (partial: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_SET, partial),

  getRecentFiles: (): Promise<string[]> =>
    ipcRenderer.invoke(IPC.RECENT_GET),

  getSystemLocale: (): Promise<string> =>
    ipcRenderer.invoke(IPC.LOCALE_GET),

  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC.APP_GET_VERSION),

  setTitle: (title: string): void => {
    ipcRenderer.send(IPC.WINDOW_SET_TITLE, title)
  },

  minimizeWindow: (): void => {
    ipcRenderer.send(IPC.WINDOW_MINIMIZE)
  },

  maximizeWindow: (): void => {
    ipcRenderer.send(IPC.WINDOW_MAXIMIZE)
  },

  closeWindow: (): void => {
    ipcRenderer.send(IPC.WINDOW_CLOSE)
  },

  onMenuAction: (callback: (action: MenuAction, payload?: string) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, action: MenuAction, payload?: string) =>
      callback(action, payload)
    ipcRenderer.on(IPC.MENU_ACTION, listener)
    return () => ipcRenderer.removeListener(IPC.MENU_ACTION, listener)
  },

  onBeforeQuit: (callback: () => void): (() => void) => {
    const listener = () => callback()
    ipcRenderer.on(IPC.APP_BEFORE_QUIT, listener)
    return () => ipcRenderer.removeListener(IPC.APP_BEFORE_QUIT, listener)
  },

  confirmQuit: (): void => {
    ipcRenderer.send(IPC.APP_QUIT_CONFIRMED)
  },

  cancelQuit: (): void => {
    ipcRenderer.send(IPC.APP_QUIT_CANCELLED)
  },

  setEditorContext: (context: { language: string; contentPreview?: boolean }): void => {
    ipcRenderer.send(IPC.EDITOR_SET_CONTEXT, context)
  },
}

contextBridge.exposeInMainWorld('finmind', finmind)
