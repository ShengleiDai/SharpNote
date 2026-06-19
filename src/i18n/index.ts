/**
 * @file index.ts
 * @description Locale resolution and translator factory.
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

import { messages, type MessageKey } from './messages'
import type { ResolvedLocale, UiLanguage } from './types'

export type { UiLanguage, ResolvedLocale, MessageKey }

export function resolveLocale(uiLanguage: UiLanguage, systemLocale: string): ResolvedLocale {
  if (uiLanguage === 'zh' || uiLanguage === 'en') return uiLanguage
  const lower = systemLocale.toLowerCase()
  if (lower.startsWith('zh')) return 'zh'
  return 'en'
}

export function createTranslator(locale: ResolvedLocale): (key: MessageKey) => string {
  const table = messages[locale]
  return (key: MessageKey) => table[key] ?? messages.en[key] ?? key
}

export function getAppName(locale: ResolvedLocale): string {
  return messages[locale].appName
}
