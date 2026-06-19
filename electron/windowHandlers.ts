/**
 * @file windowHandlers.ts
 * @description IPC handlers for window title and chrome controls.
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

import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from './constants'

export function registerWindowHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => {
    getMainWindow()?.minimize()
  })

  ipcMain.on(IPC.WINDOW_MAXIMIZE, () => {
    const win = getMainWindow()
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })

  ipcMain.on(IPC.WINDOW_CLOSE, () => {
    getMainWindow()?.close()
  })
}
