/**
 * @file markdownRender.ts
 * @description Lightweight Markdown to HTML renderer.
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

let mermaidBlockCounter = 0

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(https?:|mailto:|#)/i.test(trimmed)) return escapeHtml(trimmed)
  return '#'
}

function renderInline(text: string): string {
  let result = escapeHtml(text)
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>')
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) =>
    `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  )
  return result
}

function parseTableCells(line: string): string[] {
  let trimmed = line.trim()
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1)
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1)
  return trimmed.split('|').map((cell) => cell.trim())
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.includes('-')) return false
  const parts = parseTableCells(line)
  return parts.length >= 1 && parts.every((part) => /^:?-{3,}:?$/.test(part))
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.includes('|')) return false
  if (isTableSeparator(line)) return false
  return true
}

function renderTable(headerLine: string, bodyLines: string[]): string {
  const headers = parseTableCells(headerLine)
  const rows = bodyLines.map(parseTableCells)
  const thead = `<thead><tr>${headers.map((h) => `<th>${renderInline(h)}</th>`).join('')}</tr></thead>`
  const tbody = rows.length > 0
    ? `<tbody>${rows.map((row) =>
      `<tr>${headers.map((_, idx) => `<td>${renderInline(row[idx] ?? '')}</td>`).join('')}</tr>`,
    ).join('')}</tbody>`
    : ''
  return `<table>${thead}${tbody}</table>`
}

function renderMermaidBlock(source: string): string {
  const id = `md-mermaid-${mermaidBlockCounter++}`
  if (!source.trim()) {
    return `<div class="mermaid-diagram mermaid-empty" data-mermaid-id="${id}"></div>`
  }
  return `<div class="mermaid-diagram" data-mermaid-id="${id}">${escapeHtml(source)}</div>`
}

function renderCodeBlock(lang: string, codeLines: string[]): string {
  const content = codeLines.join('\n')
  if (lang === 'mermaid') {
    return renderMermaidBlock(content)
  }
  const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : ''
  return `<pre><code${langClass}>${escapeHtml(content)}</code></pre>`
}

export function renderMarkdownToHtml(markdown: string): string {
  mermaidBlockCounter = 0
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const parts: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^```/.test(line)) {
      const openMatch = line.match(/^```([\w-]+)?\s*$/)
      const lang = openMatch?.[1]?.toLowerCase() ?? ''
      const codeLines: string[] = []
      i += 1
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i])
        i += 1
      }
      i += 1
      parts.push(renderCodeBlock(lang, codeLines))
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      parts.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      i += 1
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      parts.push('<hr />')
      i += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i += 1
      }
      parts.push(`<blockquote><p>${quoteLines.map(renderInline).join('<br />')}</p></blockquote>`)
      continue
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*+]\s+/, ''))}</li>`)
        i += 1
      }
      parts.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s+/, ''))}</li>`)
        i += 1
      }
      parts.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headerLine = line
      i += 2
      const bodyLines: string[] = []
      while (i < lines.length && isTableRow(lines[i])) {
        bodyLines.push(lines[i])
        i += 1
      }
      parts.push(renderTable(headerLine, bodyLines))
      continue
    }

    if (line.trim() === '') {
      i += 1
      continue
    }

    const paragraphLines: string[] = []
    while (
      i < lines.length
      && lines[i].trim() !== ''
      && !/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|```)/.test(lines[i])
      && !(isTableRow(lines[i]) && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paragraphLines.push(lines[i])
      i += 1
    }
    parts.push(`<p>${paragraphLines.map(renderInline).join('<br />')}</p>`)
  }

  return parts.join('\n')
}
