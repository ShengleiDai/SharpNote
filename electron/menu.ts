/**
 * @file menu.ts
 * @description Native application menu construction and refresh.
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

import { Menu, BrowserWindow, shell, app } from 'electron'
import { IPC, type MenuAction } from './constants'
import { getRecentFiles } from './recentFiles'
import { loadSettings } from './settings'
import { getEditorContext, isFoldableLanguage } from './editorContext'

function sendAction(win: BrowserWindow, action: MenuAction, payload?: string): void {
  if (payload !== undefined) {
    win.webContents.send(IPC.MENU_ACTION, action, payload)
  } else {
    win.webContents.send(IPC.MENU_ACTION, action)
  }
}

export async function buildAppMenu(win: BrowserWindow): Promise<Menu> {
  const isMac = process.platform === 'darwin'
  const settings = await loadSettings()
  const recentFiles = await getRecentFiles()
  const { language: activeLanguage, contentPreview } = getEditorContext()
  const foldable = isFoldableLanguage(activeLanguage)
  const isJson = activeLanguage === 'json'
  const isMarkdown = activeLanguage === 'markdown'

  const recentSubmenu: Electron.MenuItemConstructorOptions[] =
    recentFiles.length > 0
      ? recentFiles.map((filePath) => ({
          label: filePath,
          click: () => sendAction(win, 'file:open-recent', filePath),
        }))
      : [{ label: '(Empty)', enabled: false }]

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' as const },
            { type: 'separator' as const },
            { role: 'services' as const },
            { type: 'separator' as const },
            { role: 'hide' as const },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendAction(win, 'file:new'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction(win, 'file:open'),
        },
        {
          label: 'Open Folder...',
          click: () => sendAction(win, 'file:open-folder'),
        },
        {
          label: 'Recent Files',
          submenu: recentSubmenu,
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction(win, 'file:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendAction(win, 'file:save-as'),
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => sendAction(win, 'file:close-tab'),
        },
        ...(!isMac
          ? [
              { type: 'separator' as const },
              {
                label: 'Exit',
                accelerator: 'Alt+F4',
                click: () => sendAction(win, 'file:exit'),
              },
            ]
          : []),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => sendAction(win, 'edit:undo'),
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Y',
          click: () => sendAction(win, 'edit:redo'),
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          click: () => sendAction(win, 'edit:cut'),
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          click: () => sendAction(win, 'edit:copy'),
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          click: () => sendAction(win, 'edit:paste'),
        },
        { type: 'separator' },
        {
          label: 'Find...',
          accelerator: 'CmdOrCtrl+F',
          click: () => sendAction(win, 'edit:find'),
        },
        {
          label: 'Replace...',
          accelerator: 'CmdOrCtrl+H',
          click: () => sendAction(win, 'edit:replace'),
        },
        {
          label: 'Find Next',
          accelerator: 'F3',
          click: () => sendAction(win, 'edit:find-next'),
        },
        {
          label: 'Find Previous',
          accelerator: 'Shift+F3',
          click: () => sendAction(win, 'edit:find-previous'),
        },
        { type: 'separator' },
        {
          label: 'Format Document',
          accelerator: 'Shift+Alt+F',
          enabled: activeLanguage === 'json',
          click: () => sendAction(win, 'edit:format-document'),
        },
        {
          label: 'Format Selection',
          enabled: activeLanguage === 'json',
          click: () => sendAction(win, 'edit:format-selection'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: `${settings.lineNumbers ? '✓ ' : '    '}Line Numbers`,
          click: () => sendAction(win, 'view:toggle-line-numbers'),
        },
        { type: 'separator' },
        {
          label: 'Language Mode',
          submenu: [
            {
              label: 'JSON',
              type: 'radio',
              checked: activeLanguage === 'json',
              click: () => sendAction(win, 'view:language-json'),
            },
            {
              label: 'Markdown',
              type: 'radio',
              checked: activeLanguage === 'markdown',
              click: () => sendAction(win, 'view:language-markdown'),
            },
          ],
        },
        {
          label: 'Folding',
          enabled: foldable,
          submenu: [
            {
              label: 'Fold',
              accelerator: 'Ctrl+Shift+[',
              enabled: foldable,
              click: () => sendAction(win, 'view:fold'),
            },
            {
              label: 'Unfold',
              accelerator: 'Ctrl+Shift+]',
              enabled: foldable,
              click: () => sendAction(win, 'view:unfold'),
            },
            { type: 'separator' },
            {
              label: 'Fold All',
              enabled: foldable,
              click: () => sendAction(win, 'view:fold-all'),
            },
            {
              label: 'Unfold All',
              enabled: foldable,
              click: () => sendAction(win, 'view:unfold-all'),
            },
          ],
        },
        {
          label: 'JSON Indent',
          enabled: isJson,
          submenu: [
            {
              label: '2 Spaces',
              type: 'radio',
              checked: settings.jsonIndentSize === 2,
              click: () => sendAction(win, 'view:indent-2'),
            },
            {
              label: '4 Spaces',
              type: 'radio',
              checked: settings.jsonIndentSize === 4,
              click: () => sendAction(win, 'view:indent-4'),
            },
          ],
        },
        {
          label: `${contentPreview ? '✓ ' : '    '}JSON Preview`,
          enabled: isJson,
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => sendAction(win, 'view:toggle-json-preview'),
        },
        {
          label: `${contentPreview ? '✓ ' : '    '}Markdown Preview`,
          enabled: isMarkdown,
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => sendAction(win, 'view:toggle-markdown-preview'),
        },
        {
          label: `${settings.sidebarVisible ? '✓ ' : '    '}Sidebar`,
          accelerator: 'CmdOrCtrl+B',
          click: () => sendAction(win, 'view:toggle-sidebar'),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SharpNote',
          click: () => sendAction(win, 'help:about'),
        },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://electron-vite.github.io'),
        },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}

export async function refreshAppMenu(win: BrowserWindow): Promise<void> {
  Menu.setApplicationMenu(await buildAppMenu(win))
}

export async function setAppMenu(win: BrowserWindow): Promise<void> {
  await refreshAppMenu(win)
}
