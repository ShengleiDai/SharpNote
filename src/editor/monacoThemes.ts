/**
 * @file monacoThemes.ts
 * @description Custom Monaco editor themes.
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

let sublimeThemeDefined = false

export function defineSublimeTheme(): void {
  if (sublimeThemeDefined) return
  sublimeThemeDefined = true

  monaco.editor.defineTheme('finmind-sublime', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'keyword.json', foreground: '66d9ef' },
      { token: 'string.key.json', foreground: 'a6e22e' },
      { token: 'string.value.json', foreground: 'e6db74' },
      { token: 'number.json', foreground: 'ae81ff' },
      { token: 'delimiter.bracket.json', foreground: 'f8f8f2' },
      { token: 'tag', foreground: 'f92672' },
      { token: 'attribute.name', foreground: 'a6e22e' },
      { token: 'attribute.value', foreground: 'e6db74' },
      { token: 'key', foreground: '66d9ef' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6e7066',
      'editorLineNumber.activeForeground': '#c2c2bc',
      'editor.selectionBackground': '#49483e',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#464741',
      'editorIndentGuide.background': '#464741',
      'editorIndentGuide.activeBackground': '#767771',
      'editor.findMatchBackground': '#ffd86655',
      'editor.findMatchHighlightBackground': '#ffd86633',
    },
  })
}

export type MonacoThemeId = 'vs' | 'vs-dark' | 'finmind-sublime'

export function resolveMonacoTheme(isDark: boolean, uiStyle: 'default' | 'sublime'): MonacoThemeId {
  if (uiStyle === 'sublime' && isDark) {
    defineSublimeTheme()
    return 'finmind-sublime'
  }
  return isDark ? 'vs-dark' : 'vs'
}
