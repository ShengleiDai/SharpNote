/**
 * @file fileIcons.ts
 * @description SVG file type icons for the sidebar tree.
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

export type FileIconKind =
  | 'folder' | 'folder-open'
  | 'txt' | 'log' | 'md' | 'json' | 'sql'
  | 'js' | 'ts' | 'html' | 'css'
  | 'py' | 'java' | 'go' | 'sh' | 'ps' | 'config' | 'code' | 'file'

export function getFileIconKind(fileName: string, isDirectory: boolean, expanded = false): FileIconKind {
  if (isDirectory) return expanded ? 'folder-open' : 'folder'
  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : ''
  switch (ext) {
    case '.json': return 'json'
    case '.md': return 'md'
    case '.log': return 'log'
    case '.txt': return 'txt'
    case '.sql': return 'sql'
    case '.js': case '.jsx': case '.mjs': case '.cjs': return 'js'
    case '.ts': case '.tsx': return 'ts'
    case '.html': case '.htm': case '.vue': return 'html'
    case '.css': case '.scss': case '.less': return 'css'
    case '.py': case '.pyw': return 'py'
    case '.java': return 'java'
    case '.go': return 'go'
    case '.sh': case '.bash': case '.zsh': return 'sh'
    case '.ps1': case '.psm1': case '.psd1': return 'ps'
    case '.yaml': case '.yml': case '.xml': case '.ini': case '.cfg': case '.conf': case '.properties': case '.toml':
      return 'config'
    case '.cs': case '.rs': case '.php': case '.rb': case '.kt': case '.kts': case '.swift': case '.scala':
    case '.c': case '.h': case '.cpp': case '.cc': case '.cxx': case '.hpp':
      return 'code'
    case '.bat': case '.cmd': return 'sh'
    default: return 'file'
  }
}

const ICONS: Record<FileIconKind, { color: string; body: string }> = {
  folder: {
    color: '#c5c5c5',
    body: '<path d="M2 4.5h5l1.5 1.5H16v8.5H2V4.5z" fill="currentColor" opacity="0.9"/>',
  },
  'folder-open': {
    color: '#c5c5c5',
    body: '<path d="M2 5.5h5l1.5 1.5H16v1H9.5L8 6.5H2v7h14V5.5H2z" fill="currentColor" opacity="0.9"/>',
  },
  txt: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6.5 6h7M6.5 9h7M6.5 12h4.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>',
  },
  log: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6.5 6h7M6.5 8.5h5.5M6.5 11h7M6.5 13.5h4" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>',
  },
  md: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 13V7.5l2 2.5L10 7.5V13M12 13V7.5l1.5 5.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  json: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M7.5 7c-.8 0-1.2.4-1.2 1s.4 1 1.2 1 1.2.3 1.2 1-.4 1.2-1.2 1.2M11.5 7c.8 0 1.2.4 1.2 1s-.4 1-1.2 1-1.2.3-1.2 1 .4 1.2 1.2 1.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" fill="none"/>',
  },
  sql: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><ellipse cx="9" cy="6.5" rx="4" ry="1.5" fill="none" stroke="currentColor" stroke-width="0.9"/><path d="M5 6.5v5c0 .8 1.8 1.5 4 1.5s4-.7 4-1.5v-5" fill="none" stroke="currentColor" stroke-width="0.9"/>',
  },
  js: {
    color: '#c5a035',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><text x="9" y="12" text-anchor="middle" font-size="6" fill="currentColor" font-family="sans-serif">JS</text>',
  },
  ts: {
    color: '#3b82f6',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><text x="9" y="12" text-anchor="middle" font-size="6" fill="currentColor" font-family="sans-serif">TS</text>',
  },
  html: {
    color: '#e44d26',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 5l3 8 3-8M7 9h4" stroke="currentColor" stroke-width="0.9" fill="none" stroke-linecap="round"/>',
  },
  css: {
    color: '#3b82f6',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 5h6l-1 10-2 1-2-1-1-10" stroke="currentColor" stroke-width="0.9" fill="none" stroke-linejoin="round"/>',
  },
  py: {
    color: '#3b82f6',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M7 6h2.5a1.5 1.5 0 100 3H7v3h2.5a1.5 1.5 0 100-3" stroke="currentColor" stroke-width="0.9" fill="none"/>',
  },
  java: {
    color: '#ef4444',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M8 6c2 1.5 3 2.5 3 4a3 3 0 11-6 0" stroke="currentColor" stroke-width="0.9" fill="none"/>',
  },
  go: {
    color: '#22d3ee',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><text x="9" y="12" text-anchor="middle" font-size="5.5" fill="currentColor" font-family="sans-serif">Go</text>',
  },
  sh: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 8h6M6 11h4M8 6l2 2-2 2" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" fill="none"/>',
  },
  ps: {
    color: '#3b82f6',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><text x="9" y="12" text-anchor="middle" font-size="5" fill="currentColor" font-family="sans-serif">PS</text>',
  },
  config: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M7 6h4M7 9h4M7 12h2" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>',
  },
  code: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M7 8l-1.5 1.5L7 11M11 8l1.5 1.5L11 11" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" fill="none"/>',
  },
  file: {
    color: '#9d9d9d',
    body: '<rect x="4" y="2" width="10" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><path d="M7 9h6M7 12h4" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/>',
  },
}

export function renderFileIcon(kind: FileIconKind): string {
  const icon = ICONS[kind]
  return `<svg class="file-icon" viewBox="0 0 18 18" width="16" height="16" style="color:${icon.color}" aria-hidden="true">${icon.body}</svg>`
}
