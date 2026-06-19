/**
 * @file recentFiles.ts
 * @description Recent files list persistence.
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

import { app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { MAX_RECENT_FILES } from './constants'

const RECENT_FILE = 'recent-files.json'

function getRecentPath(): string {
  return path.join(app.getPath('userData'), RECENT_FILE)
}

async function readRecent(): Promise<string[]> {
  try {
    const raw = await fs.readFile(getRecentPath(), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === 'string') : []
  } catch {
    return []
  }
}

async function writeRecent(files: string[]): Promise<void> {
  await fs.mkdir(app.getPath('userData'), { recursive: true })
  await fs.writeFile(getRecentPath(), JSON.stringify(files, null, 2), 'utf-8')
}

async function filterExisting(files: string[]): Promise<string[]> {
  const existing: string[] = []
  for (const filePath of files) {
    try {
      await fs.access(filePath)
      existing.push(filePath)
    } catch {
      // skip missing files
    }
  }
  return existing
}

export async function getRecentFiles(): Promise<string[]> {
  const files = await readRecent()
  const existing = await filterExisting(files)
  if (existing.length !== files.length) {
    await writeRecent(existing)
  }
  return existing
}

export async function addRecentFile(filePath: string): Promise<string[]> {
  const normalized = path.resolve(filePath)
  const current = await getRecentFiles()
  const next = [normalized, ...current.filter((p) => p !== normalized)].slice(0, MAX_RECENT_FILES)
  await writeRecent(next)
  return next
}
