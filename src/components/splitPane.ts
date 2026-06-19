/**
 * @file splitPane.ts
 * @description Editor/preview split pane layout.
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

export class SplitPane {
  private workspace: HTMLElement
  private previewPane: HTMLElement
  private splitter: HTMLElement
  private dragging = false

  constructor(
    workspace: HTMLElement,
    _editorPane: HTMLElement,
    previewPane: HTMLElement,
    splitter: HTMLElement,
    private onResize: () => void,
  ) {
    this.workspace = workspace
    this.previewPane = previewPane
    this.splitter = splitter

    this.splitter.addEventListener('mousedown', (e) => {
      e.preventDefault()
      this.dragging = true
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return
      const rect = this.workspace.getBoundingClientRect()
      const offset = e.clientX - rect.left
      const ratio = Math.min(0.8, Math.max(0.2, offset / rect.width))
      this.workspace.style.setProperty('--editor-ratio', String(ratio))
      this.onResize()
    })

    window.addEventListener('mouseup', () => {
      if (!this.dragging) return
      this.dragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    })
  }

  setPreviewVisible(visible: boolean): void {
    this.workspace.classList.toggle('preview-enabled', visible)
    this.splitter.classList.toggle('hidden', !visible)
    this.previewPane.classList.toggle('hidden', !visible)
    this.onResize()
  }
}
