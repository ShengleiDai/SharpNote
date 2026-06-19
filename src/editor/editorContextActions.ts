/**
 * @file editorContextActions.ts
 * @description Editor context menu action wiring.
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

import type { monaco } from './monacoSetup'

export interface EditorPreviewHandlers {
  onOpenPreview: () => void
  onClosePreview: () => void
}

const PREVIEW_CONTEXT_KEY = 'finmindContentPreview'

export interface EditorPreviewActions {
  disposables: monaco.IDisposable[]
  setPreviewActive(active: boolean): void
}

export function setupEditorPreviewActions(
  editor: monaco.editor.IStandaloneCodeEditor,
  handlers: EditorPreviewHandlers,
): EditorPreviewActions {
  const previewActiveKey = editor.createContextKey<boolean>(PREVIEW_CONTEXT_KEY, false)

  const disposables: monaco.IDisposable[] = [
    editor.addAction({
      id: 'finmind.preview.openJson',
      label: 'Open JSON Preview',
      contextMenuGroupId: 'finmind_preview',
      contextMenuOrder: 0,
      precondition: 'editorLangId == json && !finmindContentPreview',
      run: () => handlers.onOpenPreview(),
    }),
    editor.addAction({
      id: 'finmind.preview.closeJson',
      label: 'Close JSON Preview',
      contextMenuGroupId: 'finmind_preview',
      contextMenuOrder: 1,
      precondition: 'editorLangId == json && finmindContentPreview',
      run: () => handlers.onClosePreview(),
    }),
    editor.addAction({
      id: 'finmind.preview.openMarkdown',
      label: 'Open Markdown Preview',
      contextMenuGroupId: 'finmind_preview',
      contextMenuOrder: 2,
      precondition: 'editorLangId == markdown && !finmindContentPreview',
      run: () => handlers.onOpenPreview(),
    }),
    editor.addAction({
      id: 'finmind.preview.closeMarkdown',
      label: 'Close Markdown Preview',
      contextMenuGroupId: 'finmind_preview',
      contextMenuOrder: 3,
      precondition: 'editorLangId == markdown && finmindContentPreview',
      run: () => handlers.onClosePreview(),
    }),
  ]

  return {
    disposables,
    setPreviewActive(active: boolean): void {
      previewActiveKey.set(active)
    },
  }
}
