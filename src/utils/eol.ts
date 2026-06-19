/**
 * @file eol.ts
 * @description End-of-line detection and normalization helpers.
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

export type EolType = 'LF' | 'CRLF' | 'Mixed'

export function detectEol(content: string): EolType {
  if (content.includes('\r\n')) {
    const remainder = content.replace(/\r\n/g, '')
    if (remainder.includes('\n') || remainder.includes('\r')) return 'Mixed'
    return 'CRLF'
  }
  if (content.includes('\r') || content.includes('\n')) return 'LF'
  return 'LF'
}

export function getFileTypeLabel(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  if (dot < 0) return 'TXT'
  return fileName.slice(dot + 1).toUpperCase()
}
