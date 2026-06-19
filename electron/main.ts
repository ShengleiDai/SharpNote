/**
 * @file main.ts
 * @description Electron main process entry: window lifecycle and IPC registration.
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

import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { IPC } from './constants'
import { registerFileHandlers } from './ipc/fileHandlers'
import { registerFsHandlers } from './ipc/fsHandlers'
import { registerWindowHandlers } from './windowHandlers'
import { setAppMenu } from './menu'
import { APP_NAME } from './constants'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let mainWindow: BrowserWindow | null = null
let allowQuit = false

function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

function resolveAppIcon(): string {
  const base = process.env.VITE_PUBLIC!
  if (process.platform === 'win32') {
    const ico = path.join(base, 'icon.ico')
    if (fs.existsSync(ico)) return ico
  }
  const png = path.join(base, 'icon.png')
  if (fs.existsSync(png)) return png
  return path.join(base, 'icon.svg')
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    title: APP_NAME,
    icon: resolveAppIcon(),
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#212121',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  void setAppMenu(mainWindow)

  mainWindow.on('close', (event) => {
    if (allowQuit) return
    event.preventDefault()
    if (!mainWindow || mainWindow.webContents.isDestroyed()) {
      allowQuit = true
      app.quit()
      return
    }
    mainWindow.webContents.send(IPC.APP_BEFORE_QUIT)
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

registerFileHandlers(getMainWindow)
registerFsHandlers(getMainWindow)
registerWindowHandlers(getMainWindow)

ipcMain.on(IPC.APP_QUIT_CONFIRMED, () => {
  allowQuit = true
  app.quit()
})

ipcMain.on(IPC.APP_QUIT_CANCELLED, () => {
  allowQuit = false
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
