/**
 * @file languageRegistry.ts
 * @description Supported file extensions, SQL dialects, and language metadata.
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

export type LanguageIconKind =
  | 'txt' | 'log' | 'md' | 'json' | 'sql' | 'js' | 'ts' | 'html' | 'css'
  | 'py' | 'java' | 'go' | 'sh' | 'ps' | 'config' | 'code' | 'file'

export type LanguageMenuGroup = 'common' | 'web' | 'system' | 'script' | 'config' | 'sql'

export type PreviewMode = 'json' | 'markdown' | null

export type SqlDialect =
  | 'sql'
  | 'mysql'
  | 'postgresql'
  | 'sqlserver'
  | 'sqlite'
  | 'oracle'
  | 'bigquery'

export type SqlKeywordCase = 'upper' | 'lower' | 'preserve'

export interface LanguageCapabilities {
  folding: boolean
  formatDocument: boolean
  formatSelection: boolean
  preview: PreviewMode
}

export interface LanguageDefinition {
  id: string
  displayName: string
  extensions: string[]
  icon?: LanguageIconKind
  menuGroup: LanguageMenuGroup
  capabilities: LanguageCapabilities
  editorOptions?: {
    tabSize?: number
    insertSpaces?: boolean
  }
}

const cap = (
  folding: boolean,
  formatDocument: boolean,
  formatSelection = formatDocument,
  preview: PreviewMode = null,
): LanguageCapabilities => ({ folding, formatDocument, formatSelection, preview })

export const LANGUAGE_DEFINITIONS: LanguageDefinition[] = [
  { id: 'plaintext', displayName: 'Plain Text', extensions: ['.txt', '.log'], icon: 'txt', menuGroup: 'common', capabilities: cap(false, false) },
  { id: 'markdown', displayName: 'Markdown', extensions: ['.md'], icon: 'md', menuGroup: 'common', capabilities: cap(true, false, false, 'markdown'), editorOptions: { tabSize: 2 } },
  { id: 'json', displayName: 'JSON', extensions: ['.json'], icon: 'json', menuGroup: 'common', capabilities: cap(true, true, true, 'json'), editorOptions: { tabSize: 2 } },
  { id: 'sql', displayName: 'SQL', extensions: ['.sql'], icon: 'sql', menuGroup: 'sql', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'mysql', displayName: 'MySQL', extensions: [], icon: 'sql', menuGroup: 'sql', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'pgsql', displayName: 'PostgreSQL', extensions: [], icon: 'sql', menuGroup: 'sql', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'javascript', displayName: 'JavaScript', extensions: ['.js', '.jsx', '.mjs', '.cjs'], icon: 'js', menuGroup: 'web', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'typescript', displayName: 'TypeScript', extensions: ['.ts', '.tsx'], icon: 'ts', menuGroup: 'web', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'html', displayName: 'HTML', extensions: ['.html', '.htm', '.vue'], icon: 'html', menuGroup: 'web', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'css', displayName: 'CSS', extensions: ['.css'], icon: 'css', menuGroup: 'web', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'scss', displayName: 'SCSS', extensions: ['.scss'], icon: 'css', menuGroup: 'web', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'less', displayName: 'Less', extensions: ['.less'], icon: 'css', menuGroup: 'web', capabilities: cap(true, true, true), editorOptions: { tabSize: 2 } },
  { id: 'python', displayName: 'Python', extensions: ['.py', '.pyw'], icon: 'py', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'java', displayName: 'Java', extensions: ['.java'], icon: 'java', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'csharp', displayName: 'C#', extensions: ['.cs'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'go', displayName: 'Go', extensions: ['.go'], icon: 'go', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4, insertSpaces: false } },
  { id: 'rust', displayName: 'Rust', extensions: ['.rs'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'php', displayName: 'PHP', extensions: ['.php'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'ruby', displayName: 'Ruby', extensions: ['.rb'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 2 } },
  { id: 'kotlin', displayName: 'Kotlin', extensions: ['.kt', '.kts'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'swift', displayName: 'Swift', extensions: ['.swift'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'scala', displayName: 'Scala', extensions: ['.scala'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 2 } },
  { id: 'c', displayName: 'C', extensions: ['.c', '.h'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'cpp', displayName: 'C++', extensions: ['.cpp', '.cc', '.cxx', '.hpp'], icon: 'code', menuGroup: 'system', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'yaml', displayName: 'YAML', extensions: ['.yaml', '.yml'], icon: 'config', menuGroup: 'config', capabilities: cap(true, false), editorOptions: { tabSize: 2 } },
  { id: 'xml', displayName: 'XML', extensions: ['.xml'], icon: 'config', menuGroup: 'config', capabilities: cap(true, false), editorOptions: { tabSize: 2 } },
  { id: 'ini', displayName: 'INI / Config', extensions: ['.ini', '.cfg', '.conf', '.properties', '.toml'], icon: 'config', menuGroup: 'config', capabilities: cap(false, false), editorOptions: { tabSize: 4 } },
  { id: 'shellscript', displayName: 'Shell', extensions: ['.sh', '.bash', '.zsh'], icon: 'sh', menuGroup: 'script', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'powershell', displayName: 'PowerShell', extensions: ['.ps1', '.psm1', '.psd1'], icon: 'ps', menuGroup: 'script', capabilities: cap(true, false), editorOptions: { tabSize: 4 } },
  { id: 'bat', displayName: 'Batch', extensions: ['.bat', '.cmd'], icon: 'sh', menuGroup: 'script', capabilities: cap(false, false), editorOptions: { tabSize: 4 } },
]

const extensionMap = new Map<string, LanguageDefinition>()
const idMap = new Map<string, LanguageDefinition>()

for (const def of LANGUAGE_DEFINITIONS) {
  idMap.set(def.id, def)
  for (const ext of def.extensions) {
    extensionMap.set(ext.toLowerCase(), def)
  }
}

export const ALL_SUPPORTED_EXTENSIONS = [...new Set(
  LANGUAGE_DEFINITIONS.flatMap((d) => d.extensions.map((e) => e.toLowerCase())),
)].sort()

const CODE_EXTENSIONS = ALL_SUPPORTED_EXTENSIONS.filter((ext) =>
  !['.txt', '.log', '.md', '.json'].includes(ext),
)

const SCRIPT_EXTENSIONS = ['.sh', '.bash', '.zsh', '.ps1', '.psm1', '.psd1', '.bat', '.cmd']

export function buildFileFilters(): Array<{ name: string; extensions: string[] }> {
  const stripDot = (ext: string) => ext.slice(1)
  return [
    { name: 'Supported Files', extensions: ALL_SUPPORTED_EXTENSIONS.map(stripDot) },
    { name: 'Code Files', extensions: CODE_EXTENSIONS.map(stripDot) },
    { name: 'Scripts', extensions: SCRIPT_EXTENSIONS.map(stripDot) },
    { name: 'All Files', extensions: ['*'] },
  ]
}

export function getLanguageDefinitionById(id: string): LanguageDefinition | undefined {
  return idMap.get(id)
}

export function getLanguageFromPath(filePath: string, sqlHighlightId?: string): string {
  const dot = filePath.lastIndexOf('.')
  const ext = dot >= 0 ? filePath.slice(dot).toLowerCase() : ''
  if (ext === '.sql' && sqlHighlightId) {
    return sqlHighlightId
  }
  return extensionMap.get(ext)?.id ?? 'plaintext'
}

export function getLanguageDisplayLabel(languageId: string): string {
  return getLanguageDefinitionById(languageId)?.displayName ?? languageId.toUpperCase()
}

export function isFoldableLanguage(languageId: string): boolean {
  return getLanguageDefinitionById(languageId)?.capabilities.folding ?? false
}

export function canFormatDocument(languageId: string): boolean {
  return getLanguageDefinitionById(languageId)?.capabilities.formatDocument ?? false
}

export function canFormatSelection(languageId: string): boolean {
  return getLanguageDefinitionById(languageId)?.capabilities.formatSelection ?? false
}

export function getPreviewMode(languageId: string): PreviewMode {
  return getLanguageDefinitionById(languageId)?.capabilities.preview ?? null
}

export function isSqlLanguage(languageId: string): boolean {
  return languageId === 'sql' || languageId === 'mysql' || languageId === 'pgsql'
}

export function mapSqlDialectToMonacoId(dialect: SqlDialect): string {
  switch (dialect) {
    case 'mysql': return 'mysql'
    case 'postgresql': return 'pgsql'
    default: return 'sql'
  }
}

export function mapSqlDialectToFormatterLanguage(dialect: SqlDialect): string {
  switch (dialect) {
    case 'mysql': return 'mysql'
    case 'postgresql': return 'postgresql'
    case 'sqlserver': return 'tsql'
    case 'sqlite': return 'sqlite'
    case 'oracle': return 'plsql'
    case 'bigquery': return 'bigquery'
    default: return 'sql'
  }
}

export function getMenuLanguagesByGroup(group: LanguageMenuGroup): LanguageDefinition[] {
  return LANGUAGE_DEFINITIONS.filter((d) => d.menuGroup === group)
}

export function getDefaultFileName(untitledIndex: number): string {
  return `Untitled-${untitledIndex}.txt`
}

export function isSupportedExtension(ext: string): boolean {
  return extensionMap.has(ext.toLowerCase())
}

export const MONACO_FORMAT_LANGUAGES = new Set([
  'json', 'javascript', 'typescript', 'html', 'css', 'scss', 'less',
])
