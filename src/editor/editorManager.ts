/**
 * @file editorManager.ts
 * @description Monaco Editor instance and model lifecycle management.
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
  applyLanguageEditorOptions,
  getJsonValidation,
  isJsonLanguage,
  type JsonIndentSize,
} from './languageEditor'
import { FormatService, type FormatSettings } from './format/formatService'
import { setupEditorPreviewActions, type EditorPreviewActions, type EditorPreviewHandlers } from './editorContextActions'

export interface CursorPosition {
  lineNumber: number
  column: number
}

export class EditorManager {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private lastDecorations: string[] = []
  private jsonIndentSize: JsonIndentSize = 2
  private previewActions: EditorPreviewActions | null = null
  private formatService = new FormatService()

  init(container: HTMLElement, lineNumbers: boolean, previewHandlers?: EditorPreviewHandlers): void {
    this.editor = monaco.editor.create(container, {
      automaticLayout: true,
      fontFamily: "'Cascadia Code', Consolas, 'JetBrains Mono', monospace",
      fontSize: 14,
      lineNumbers: lineNumbers ? 'on' : 'off',
      minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      tabSize: 4,
      folding: false,
      renderWhitespace: 'none',
      renderLineHighlight: 'line',
      theme: 'vs',
      contextmenu: true,
    })

    if (previewHandlers) {
      this.previewActions = setupEditorPreviewActions(this.getEditor(), previewHandlers)
    }
  }

  setPreviewContextActive(active: boolean): void {
    this.previewActions?.setPreviewActive(active)
  }

  getEditor(): monaco.editor.IStandaloneCodeEditor {
    if (!this.editor) throw new Error('Editor not initialized')
    return this.editor
  }

  setModel(model: monaco.editor.ITextModel): void {
    this.getEditor().setModel(model)
    this.applyLanguageOptions(model.getLanguageId())
    this.clearFindHighlights()
  }

  setJsonIndentSize(size: JsonIndentSize): void {
    this.jsonIndentSize = size
    const model = this.getEditor().getModel()
    if (model) this.applyLanguageOptions(model.getLanguageId())
  }

  applyLanguageOptions(language: string): void {
    applyLanguageEditorOptions(this.getEditor(), language, this.jsonIndentSize)
  }

  createModel(content: string, language: string): monaco.editor.ITextModel {
    return monaco.editor.createModel(content, language)
  }

  disposeModel(model: monaco.editor.ITextModel): void {
    model.dispose()
  }

  setTheme(theme: 'vs' | 'vs-dark' | 'finmind-sublime'): void {
    monaco.editor.setTheme(theme)
  }

  setLineNumbers(enabled: boolean): void {
    this.getEditor().updateOptions({ lineNumbers: enabled ? 'on' : 'off' })
  }

  runAction(actionId: string): void {
    const editor = this.getEditor()
    editor.getAction(actionId)?.run()
  }

  focus(): void {
    this.getEditor().focus()
  }

  layout(): void {
    this.getEditor().layout()
  }

  getCursorPosition(): CursorPosition {
    const position = this.getEditor().getPosition()
    return {
      lineNumber: position?.lineNumber ?? 1,
      column: position?.column ?? 1,
    }
  }

  onCursorChange(callback: () => void): monaco.IDisposable {
    return this.getEditor().onDidChangeCursorPosition(callback)
  }

  onContentChange(callback: () => void): monaco.IDisposable {
    return this.getEditor().onDidChangeModelContent(callback)
  }

  onMarkersChange(callback: () => void): monaco.IDisposable {
    return monaco.editor.onDidChangeMarkers((uris) => {
      const model = this.getEditor().getModel()
      if (model && uris.some((uri) => uri.toString() === model.uri.toString())) {
        callback()
      }
    })
  }

  getJsonValidationStatus(): JsonValidationResult | null {
    const model = this.getEditor().getModel()
    if (!model || !isJsonLanguage(model.getLanguageId())) return null
    return getJsonValidation(model, model.getValue())
  }

  async formatDocument(settings: FormatSettings): Promise<{ ok: true } | { ok: false; error: string }> {
    const editor = this.getEditor()
    const model = editor.getModel()
    if (!model) return { ok: false, error: 'No document open.' }
    return this.formatService.formatDocument(editor, model.getLanguageId(), settings)
  }

  async formatSelection(settings: FormatSettings): Promise<{ ok: true } | { ok: false; error: string }> {
    const editor = this.getEditor()
    const model = editor.getModel()
    if (!model) return { ok: false, error: 'No document open.' }
    return this.formatService.formatSelection(editor, model.getLanguageId(), settings)
  }

  canFormatDocument(languageId: string): boolean {
    return this.formatService.canFormatDocument(languageId)
  }

  canFormatSelection(languageId: string): boolean {
    return this.formatService.canFormatSelection(languageId)
  }

  findNext(query: string, caseSensitive: boolean): void {
    const editor = this.getEditor()
    const model = editor.getModel()
    if (!model || !query) return

    const matches = model.findMatches(query, false, false, caseSensitive, null, false)
    if (matches.length === 0) {
      this.clearFindHighlights()
      return
    }

    const position = editor.getSelection()?.getEndPosition() ?? editor.getPosition()
    let next = matches.find((m) =>
      position && (
        m.range.startLineNumber > position.lineNumber
        || (m.range.startLineNumber === position.lineNumber && m.range.startColumn > position.column)
      ),
    )
    if (!next) next = matches[0]

    editor.setSelection(next.range)
    editor.revealRangeInCenter(next.range)
    this.highlightMatches(matches)
  }

  findPrevious(query: string, caseSensitive: boolean): void {
    const editor = this.getEditor()
    const model = editor.getModel()
    if (!model || !query) return

    const matches = model.findMatches(query, false, false, caseSensitive, null, false)
    if (matches.length === 0) {
      this.clearFindHighlights()
      return
    }

    const position = editor.getSelection()?.getStartPosition() ?? editor.getPosition()
    const reversed = [...matches].reverse()
    let prev = reversed.find((m) =>
      position && (
        m.range.startLineNumber < position.lineNumber
        || (m.range.startLineNumber === position.lineNumber && m.range.startColumn < position.column)
      ),
    )
    if (!prev) prev = matches[matches.length - 1]

    editor.setSelection(prev.range)
    editor.revealRangeInCenter(prev.range)
    this.highlightMatches(matches)
  }

  replaceOne(query: string, replacement: string, caseSensitive: boolean): void {
    const editor = this.getEditor()
    const model = editor.getModel()
    if (!model || !query) return

    const selection = editor.getSelection()
    if (!selection || selection.isEmpty()) {
      this.findNext(query, caseSensitive)
      return
    }

    const selected = model.getValueInRange(selection)
    const matches = caseSensitive
      ? selected === query
      : selected.toLowerCase() === query.toLowerCase()

    if (matches) {
      editor.executeEdits('replace', [{
        range: selection,
        text: replacement,
        forceMoveMarkers: true,
      }])
    }
    this.findNext(query, caseSensitive)
  }

  replaceAll(query: string, replacement: string, caseSensitive: boolean): void {
    const editor = this.getEditor()
    const model = editor.getModel()
    if (!model || !query) return

    const matches = model.findMatches(query, false, false, caseSensitive, null, false)
    if (matches.length === 0) return

    editor.executeEdits('replace-all', matches.map((match) => ({
      range: match.range,
      text: replacement,
      forceMoveMarkers: true,
    })))
    this.clearFindHighlights()
  }

  private highlightMatches(matches: monaco.editor.FindMatch[]): void {
    const editor = this.getEditor()
    this.lastDecorations = editor.deltaDecorations(this.lastDecorations, matches.map((m) => ({
      range: m.range,
      options: {
        className: 'find-match-highlight',
        overviewRuler: { color: '#0d948866', position: monaco.editor.OverviewRulerLane.Center },
      },
    })))
  }

  clearFindHighlights(): void {
    if (this.lastDecorations.length === 0) return
    this.lastDecorations = this.getEditor().deltaDecorations(this.lastDecorations, [])
  }
}

export interface JsonValidationResult {
  valid: boolean
  error?: string
}
