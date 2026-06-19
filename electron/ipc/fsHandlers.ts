/**
 * @file fsHandlers.ts
 * @description IPC handlers for directory listing and workspace file operations.
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

import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { IPC } from '../constants'
import { ALL_SUPPORTED_EXTENSIONS } from '../../shared/languageRegistry'

export interface FsEntry {
  name: string
  path: string
  isDirectory: boolean
}

function isSupportedFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  return ALL_SUPPORTED_EXTENSIONS.includes(ext)
}

function sanitizeFileName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('File name is required')
  if (/[\\/:*?"<>|]/.test(trimmed)) {
    throw new Error('File name contains invalid characters')
  }
  if (trimmed === '.' || trimmed === '..') {
    throw new Error('Invalid file name')
  }
  return trimmed
}

function normalizeNewFileName(name: string): string {
  let fileName = sanitizeFileName(name)
  if (!path.extname(fileName)) {
    fileName += '.txt'
  }
  const ext = path.extname(fileName).toLowerCase()
  if (!/^\.[a-z0-9][a-z0-9._+-]{0,15}$/i.test(ext)) {
    throw new Error('Invalid file extension')
  }
  return fileName
}

async function readDirectoryEntries(dirPath: string): Promise<FsEntry[]> {
  const names = await fs.readdir(dirPath)
  const entries: FsEntry[] = []

  for (const name of names) {
    if (name.startsWith('.')) continue
    const fullPath = path.join(dirPath, name)
    try {
      const stat = await fs.stat(fullPath)
      if (stat.isDirectory()) {
        entries.push({ name, path: fullPath, isDirectory: true })
      } else if (isSupportedFile(fullPath)) {
        entries.push({ name, path: fullPath, isDirectory: false })
      }
    } catch {
      // skip inaccessible entries
    }
  }

  entries.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })

  return entries
}

export function registerFsHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.FOLDER_OPEN_DIALOG, async () => {
    const result = await dialog.showOpenDialog(getMainWindow()!, {
      properties: ['openDirectory'],
    })
    if (result.canceled || !result.filePaths[0]) return null
    return result.filePaths[0]
  })

  ipcMain.handle(IPC.FS_READ_DIRECTORY, async (_event, dirPath: string) => {
    try {
      const stat = await fs.stat(dirPath)
      if (!stat.isDirectory()) {
        throw new Error('Path is not a directory')
      }
      return await readDirectoryEntries(dirPath)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Cannot read directory: ${message}`)
    }
  })

  ipcMain.handle(IPC.FS_CREATE_FILE, async (_event, dirPath: string, fileName: string) => {
    const stat = await fs.stat(dirPath)
    if (!stat.isDirectory()) {
      throw new Error('Target is not a directory')
    }

    const safeName = normalizeNewFileName(fileName)
    const filePath = path.join(dirPath, safeName)

    try {
      await fs.access(filePath)
      throw new Error(`File already exists: ${safeName}`)
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('File already exists')) {
        throw err
      }
    }

    await fs.writeFile(filePath, '', 'utf-8')
    return { filePath, fileName: safeName }
  })

  ipcMain.handle(IPC.FS_RENAME_PATH, async (_event, filePath: string, newName: string) => {
    const safeName = sanitizeFileName(newName)
    const dir = path.dirname(filePath)
    const newPath = path.join(dir, safeName)

    if (path.resolve(newPath) === path.resolve(filePath)) {
      return { filePath, fileName: safeName }
    }

    try {
      await fs.access(newPath)
      throw new Error(`File already exists: ${safeName}`)
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('File already exists')) {
        throw err
      }
    }

    try {
      await fs.rename(filePath, newPath)
      return { filePath: newPath, fileName: safeName }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Rename failed: ${message}`)
    }
  })

  ipcMain.handle(IPC.FS_DELETE_PATH, async (_event, targetPath: string, workspaceRoot?: string | null) => {
    if (workspaceRoot) {
      const resolvedTarget = path.resolve(targetPath)
      const resolvedRoot = path.resolve(workspaceRoot)
      if (resolvedTarget === resolvedRoot) {
        throw new Error('Cannot delete the workspace root folder')
      }
    }

    try {
      await fs.rm(targetPath, { recursive: true, force: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Delete failed: ${message}`)
    }
  })
}
