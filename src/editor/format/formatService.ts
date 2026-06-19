/**
 * @file formatService.ts
 * @description Document and selection formatting dispatch.
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

import type { monaco } from '../monacoSetup'
import {
  canFormatDocument,
  canFormatSelection,
  isSqlLanguage,
} from '../../../shared/languageRegistry'
import { validateJsonContent } from '../languageEditor'
import { runMonacoFormatDocument, runMonacoFormatSelection, canUseMonacoFormatter } from './monacoFormatter'
import { formatSqlSafe } from './sqlFormatter'
import type { SqlDialect, SqlKeywordCase } from '../../../shared/languageRegistry'

export interface FormatSettings {
  sqlDialect: SqlDialect
  sqlKeywordCase: SqlKeywordCase
  sqlIndentSize: 2 | 4
  sqlLinesBetweenQueries: 0 | 1
}

export class FormatService {
  canFormatDocument(languageId: string): boolean {
    return canFormatDocument(languageId)
  }

  canFormatSelection(languageId: string): boolean {
    return canFormatSelection(languageId)
  }

  async formatDocument(
    editor: monaco.editor.IStandaloneCodeEditor,
    languageId: string,
    settings: FormatSettings,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const model = editor.getModel()
    if (!model) return { ok: false, error: 'No document open.' }

    if (languageId === 'json') {
      const validation = validateJsonContent(model.getValue())
      if (!validation.valid) {
        return { ok: false, error: validation.error ?? 'Invalid JSON' }
      }
      return runMonacoFormatDocument(editor)
    }

    if (isSqlLanguage(languageId)) {
      const result = formatSqlSafe(model.getValue(), {
        dialect: settings.sqlDialect,
        keywordCase: settings.sqlKeywordCase,
        tabWidth: settings.sqlIndentSize,
        linesBetweenQueries: settings.sqlLinesBetweenQueries,
      })
      if (!result.ok) return result
      model.setValue(result.text)
      return { ok: true }
    }

    if (canUseMonacoFormatter(languageId)) {
      return runMonacoFormatDocument(editor)
    }

    return { ok: false, error: 'Format Document is not available for this language.' }
  }

  async formatSelection(
    editor: monaco.editor.IStandaloneCodeEditor,
    languageId: string,
    settings: FormatSettings,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const model = editor.getModel()
    if (!model) return { ok: false, error: 'No document open.' }

    const selection = editor.getSelection()
    if (!selection || selection.isEmpty()) {
      return { ok: false, error: 'Select a fragment to format.' }
    }

    if (languageId === 'json') {
      const selected = model.getValueInRange(selection)
      const validation = validateJsonContent(selected)
      if (!validation.valid) {
        return { ok: false, error: validation.error ?? 'Selected text is not valid JSON.' }
      }
      return runMonacoFormatSelection(editor)
    }

    if (isSqlLanguage(languageId)) {
      const selected = model.getValueInRange(selection)
      const result = formatSqlSafe(selected, {
        dialect: settings.sqlDialect,
        keywordCase: settings.sqlKeywordCase,
        tabWidth: settings.sqlIndentSize,
        linesBetweenQueries: settings.sqlLinesBetweenQueries,
      })
      if (!result.ok) return result
      editor.executeEdits('format-selection', [{
        range: selection,
        text: result.text,
        forceMoveMarkers: true,
      }])
      return { ok: true }
    }

    if (canUseMonacoFormatter(languageId)) {
      return runMonacoFormatSelection(editor)
    }

    return { ok: false, error: 'Format Selection is not available for this language.' }
  }
}
