/**
 * @file monacoFormatter.ts
 * @description Monaco built-in formatter integration.
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
import { MONACO_FORMAT_LANGUAGES } from '../../../shared/languageRegistry'

export function canUseMonacoFormatter(languageId: string): boolean {
  return MONACO_FORMAT_LANGUAGES.has(languageId)
}

export async function runMonacoFormatDocument(editor: monaco.editor.IStandaloneCodeEditor): Promise<{ ok: true } | { ok: false; error: string }> {
  const action = editor.getAction('editor.action.formatDocument')
  if (!action) {
    return { ok: false, error: 'Format action is not available.' }
  }
  await action.run()
  return { ok: true }
}

export async function runMonacoFormatSelection(editor: monaco.editor.IStandaloneCodeEditor): Promise<{ ok: true } | { ok: false; error: string }> {
  const selection = editor.getSelection()
  if (!selection || selection.isEmpty()) {
    return { ok: false, error: 'Select text to format.' }
  }
  const action = editor.getAction('editor.action.formatSelection')
  if (!action) {
    return { ok: false, error: 'Format Selection action is not available.' }
  }
  await action.run()
  return { ok: true }
}
