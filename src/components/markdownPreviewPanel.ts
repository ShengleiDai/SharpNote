/**
 * @file markdownPreviewPanel.ts
 * @description Markdown preview panel with Mermaid rendering.
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

import { renderMarkdownToHtml } from '../utils/markdownRender'
import {
  cancelPendingMermaidRenders,
  renderMermaidInContainer,
  type MermaidUiLabels,
} from '../utils/mermaidRenderer'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface MarkdownPreviewOptions {
  getContent: () => string
  getTitle: () => string
  getEmptyHint: () => string
  getMermaidLabels: () => MermaidUiLabels
}

export class MarkdownPreviewPanel {
  private container: HTMLElement
  private titleEl: HTMLElement
  private bodyEl: HTMLElement
  private options: MarkdownPreviewOptions
  private renderToken = 0

  constructor(container: HTMLElement, options: MarkdownPreviewOptions) {
    this.container = container
    this.options = options
    this.container.innerHTML = `
      <div class="preview-panel-header">
        <span class="preview-panel-title"></span>
        <span class="preview-panel-hint"></span>
      </div>
      <div class="markdown-preview-body"></div>
    `
    this.titleEl = this.container.querySelector('.preview-panel-title')!
    this.bodyEl = this.container.querySelector('.markdown-preview-body')!
  }

  setLabels(title: string, hint: string): void {
    this.titleEl.textContent = title
    this.container.querySelector('.preview-panel-hint')!.textContent = hint
  }

  setVisible(visible: boolean): void {
    this.container.classList.toggle('hidden', !visible)
  }

  async render(): Promise<void> {
    const token = ++this.renderToken
    cancelPendingMermaidRenders()

    const content = this.options.getContent()
    this.titleEl.textContent = this.options.getTitle()

    if (!content.trim()) {
      this.bodyEl.innerHTML = `<p class="markdown-preview-empty">${escapeHtml(this.options.getEmptyHint())}</p>`
      return
    }

    this.bodyEl.innerHTML = renderMarkdownToHtml(content)
    if (token !== this.renderToken) return

    await renderMermaidInContainer(this.bodyEl, this.options.getMermaidLabels())
  }
}
