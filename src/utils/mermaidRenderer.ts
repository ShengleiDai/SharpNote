/**
 * @file mermaidRenderer.ts
 * @description Dynamic Mermaid load, theme, and SVG rendering.
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

import type { Mermaid } from 'mermaid'

export interface MermaidUiLabels {
  errorTitle: string
  loadFailed: string
  emptyHint: string
}

let renderGeneration = 0
let mermaidApi: Mermaid | null = null
let mermaidInitialized = false

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getSharpnoteMermaidTheme() {
  return {
    theme: 'dark' as const,
    themeVariables: {
      primaryColor: '#0D9488',
      primaryTextColor: '#e0e0e0',
      primaryBorderColor: '#14B8A6',
      lineColor: '#9d9d9d',
      secondaryColor: '#252526',
      tertiaryColor: '#1e1e1e',
      background: '#1e1e1e',
      mainBkg: '#252526',
      nodeBorder: '#3c3c3c',
      clusterBkg: '#2d2d2d',
      titleColor: '#e0e0e0',
      edgeLabelBackground: '#252526',
      nodeTextColor: '#e0e0e0',
    },
  }
}

export function cancelPendingMermaidRenders(): void {
  renderGeneration += 1
}

export async function loadMermaid(): Promise<Mermaid> {
  if (!mermaidApi) {
    const mod = await import('mermaid')
    mermaidApi = mod.default
  }

  if (!mermaidInitialized) {
    mermaidApi.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      ...getSharpnoteMermaidTheme(),
    })
    mermaidInitialized = true
  }

  return mermaidApi
}

function getNodeSource(node: HTMLElement): string {
  return node.getAttribute('data-mermaid-source') ?? node.textContent ?? ''
}

function resetNodeForRender(node: HTMLElement, source: string): void {
  node.className = 'mermaid-diagram'
  node.textContent = source
}

function markEmptyBlock(node: HTMLElement, hint: string): void {
  node.className = 'mermaid-diagram mermaid-empty'
  node.innerHTML = `<p class="mermaid-empty-hint">${escapeHtml(hint)}</p>`
}

function markErrorBlock(node: HTMLElement, source: string, detail: string, labels: MermaidUiLabels): void {
  node.className = 'mermaid-diagram mermaid-error'
  node.innerHTML = `
    <div class="mermaid-error-title">${escapeHtml(labels.errorTitle)}</div>
    <pre class="mermaid-error-detail">${escapeHtml(detail)}</pre>
    <pre class="mermaid-error-source">${escapeHtml(source)}</pre>
  `
}

function fallbackNodeToPre(node: HTMLElement, source: string): void {
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  code.className = 'language-mermaid'
  code.textContent = source
  pre.appendChild(code)
  node.replaceWith(pre)
}

function showLoadFailedBanner(container: HTMLElement, message: string): void {
  if (container.querySelector('.mermaid-load-failed')) return
  const banner = document.createElement('div')
  banner.className = 'mermaid-load-failed'
  banner.textContent = message
  container.prepend(banner)
}

function buildRenderId(node: HTMLElement): string {
  const raw = node.dataset.mermaidId ?? crypto.randomUUID()
  return `sharpnote-mmd-${raw.replace(/[^\w-]/g, '-')}`
}

async function renderSingleBlock(
  mermaid: Mermaid,
  node: HTMLElement,
  labels: MermaidUiLabels,
): Promise<void> {
  const source = getNodeSource(node).trim()
  if (!source) {
    markEmptyBlock(node, labels.emptyHint)
    return
  }

  node.setAttribute('data-mermaid-source', source)
  resetNodeForRender(node, source)
  node.classList.add('mermaid')

  try {
    const id = buildRenderId(node)
    const result = await mermaid.render(id, source)
    node.innerHTML = result.svg
    node.classList.add('mermaid-rendered')
    result.bindFunctions?.(node)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    markErrorBlock(node, source, detail, labels)
  }
}

export async function renderMermaidInContainer(
  container: HTMLElement,
  labels: MermaidUiLabels,
): Promise<void> {
  const generation = ++renderGeneration
  container.querySelector('.mermaid-load-failed')?.remove()

  const nodes = Array.from(
    container.querySelectorAll('.mermaid-diagram:not(.mermaid-error)'),
  ) as HTMLElement[]

  const pending: HTMLElement[] = []
  for (const node of nodes) {
    const source = (node.textContent ?? '').trim()
    node.setAttribute('data-mermaid-source', source)
    if (!source) {
      markEmptyBlock(node, labels.emptyHint)
      continue
    }
    pending.push(node)
  }

  if (pending.length === 0) return

  let mermaid: Mermaid
  try {
    mermaid = await loadMermaid()
  } catch {
    if (generation !== renderGeneration) return
    showLoadFailedBanner(container, labels.loadFailed)
    for (const node of pending) {
      fallbackNodeToPre(node, getNodeSource(node))
    }
    return
  }

  if (generation !== renderGeneration) return

  for (const node of pending) {
    const source = getNodeSource(node)
    resetNodeForRender(node, source)
    node.classList.add('mermaid')
  }

  try {
    await mermaid.run({ nodes: pending })
    if (generation !== renderGeneration) return
  } catch {
    if (generation !== renderGeneration) return
    for (const node of pending) {
      if (generation !== renderGeneration) return
      await renderSingleBlock(mermaid, node, labels)
    }
  }
}
