/**
 * @file sqlFormatter.ts
 * @description SQL formatting via sql-formatter.
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

import { format as formatSql, type FormatOptionsWithLanguage } from 'sql-formatter'
import {
  isSqlLanguage,
  mapSqlDialectToFormatterLanguage,
  type SqlDialect,
  type SqlKeywordCase,
} from '../../../shared/languageRegistry'

export interface SqlFormatOptions {
  dialect: SqlDialect
  keywordCase: SqlKeywordCase
  tabWidth: 2 | 4
  linesBetweenQueries: 0 | 1
}

export function formatSqlContent(content: string, opts: SqlFormatOptions): string {
  const trimmed = content.trim()
  if (!trimmed) return content

  const formatOptions: FormatOptionsWithLanguage = {
    language: mapSqlDialectToFormatterLanguage(opts.dialect) as FormatOptionsWithLanguage['language'],
    keywordCase: opts.keywordCase,
    tabWidth: opts.tabWidth,
    linesBetweenQueries: opts.linesBetweenQueries === 0 ? 0 : 2,
  }
  return formatSql(trimmed, formatOptions)
}

export function formatSqlSafe(content: string, opts: SqlFormatOptions): { ok: true; text: string } | { ok: false; error: string } {
  try {
    return { ok: true, text: formatSqlContent(content, opts) }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export function canFormatSqlLanguage(languageId: string): boolean {
  return isSqlLanguage(languageId)
}
