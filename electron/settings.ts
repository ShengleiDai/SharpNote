/**
 * @file settings.ts
 * @description Persistent application settings read/write in userData.
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
import { DEFAULT_SETTINGS, normalizeAppSettings, type AppSettings } from './constants'

const SETTINGS_FILE = 'settings.json'

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), SETTINGS_FILE)
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(getSettingsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return normalizeAppSettings(parsed)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const normalized = normalizeAppSettings(settings)
  await fs.mkdir(app.getPath('userData'), { recursive: true })
  await fs.writeFile(getSettingsPath(), JSON.stringify(normalized, null, 2), 'utf-8')
  return normalized
}
