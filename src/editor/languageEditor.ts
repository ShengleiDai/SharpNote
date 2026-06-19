/**
 * @file languageEditor.ts
 * @description Language-specific editor capabilities and preview modes.
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

import { monaco } from './monacoSetup'
import {
  getLanguageDefinitionById,
  getLanguageDisplayLabel as registryDisplayLabel,
  isFoldableLanguage as registryFoldable,
} from '../../shared/languageRegistry'

export type JsonIndentSize = 2 | 4

let jsonDefaultsConfigured = false

export function configureJsonLanguageService(): void {
  if (jsonDefaultsConfigured) return
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    trailingCommas: 'error',
    schemaValidation: 'error',
  })
  jsonDefaultsConfigured = true
}

export function applyLanguageEditorOptions(
  editor: monaco.editor.IStandaloneCodeEditor,
  language: string,
  jsonIndentSize: JsonIndentSize = 2,
): void {
  configureJsonLanguageService()

  const def = getLanguageDefinitionById(language)
  if (def?.capabilities.folding) {
    const tabSize = language === 'json'
      ? jsonIndentSize
      : (def.editorOptions?.tabSize ?? 4)
    editor.updateOptions({
      folding: true,
      foldingStrategy: 'auto',
      showFoldingControls: 'mouseover',
      tabSize,
      insertSpaces: def.editorOptions?.insertSpaces ?? true,
    })
    return
  }

  editor.updateOptions({ folding: false, tabSize: 4 })
}

export interface JsonValidationResult {
  valid: boolean
  error?: string
}

export function validateJsonContent(content: string): JsonValidationResult {
  const trimmed = content.trim()
  if (!trimmed) return { valid: true }

  try {
    JSON.parse(content)
    return { valid: true }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export function getJsonValidation(model: monaco.editor.ITextModel, content: string): JsonValidationResult {
  const parseResult = validateJsonContent(content)
  if (!parseResult.valid) return parseResult

  const errors = monaco.editor.getModelMarkers({ resource: model.uri })
    .filter((marker) => marker.severity === monaco.MarkerSeverity.Error)

  if (errors.length === 0) return { valid: true }

  const first = errors[0]
  return {
    valid: false,
    error: first.message,
  }
}

export function isJsonLanguage(language: string): boolean {
  return language === 'json'
}

export function isMarkdownLanguage(language: string): boolean {
  return language === 'markdown'
}

export function isSqlLanguageId(language: string): boolean {
  return language === 'sql' || language === 'mysql' || language === 'pgsql'
}

export function isFoldableLanguage(language: string): boolean {
  return registryFoldable(language)
}

export function getLanguageDisplayLabel(language: string): string {
  return registryDisplayLabel(language)
}

export function supportsPreview(language: string): boolean {
  const def = getLanguageDefinitionById(language)
  return def?.capabilities.preview != null
}

export function getPreviewModeForLanguage(language: string): 'json' | 'markdown' | null {
  return getLanguageDefinitionById(language)?.capabilities.preview ?? null
}
