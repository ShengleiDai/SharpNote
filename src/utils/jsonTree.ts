/**
 * @file jsonTree.ts
 * @description JSON parse tree utilities for preview navigation.
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

export type JsonPath = Array<string | number>

export type ParseJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string }

export function parseJsonSafe(content: string): ParseJsonResult {
  const trimmed = content.trim()
  if (!trimmed) return { ok: true, data: {} }
  try {
    return { ok: true, data: JSON.parse(content) }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export function formatJson(data: unknown, indent = 2): string {
  return JSON.stringify(data, null, indent)
}

function cloneRoot(data: unknown): unknown {
  return JSON.parse(JSON.stringify(data))
}

export function getAtPath(data: unknown, path: JsonPath): unknown {
  if (path.length === 0) return data
  let current = data
  for (const segment of path) {
    if (current === null || current === undefined) return undefined
    if (typeof segment === 'number') {
      current = (current as unknown[])[segment]
    } else {
      current = (current as Record<string, unknown>)[segment]
    }
  }
  return current
}

export function setAtPath(data: unknown, path: JsonPath, value: unknown): unknown {
  if (path.length === 0) return value
  const root = cloneRoot(data)
  let current: unknown = root
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    current = typeof segment === 'number'
      ? (current as unknown[])[segment]
      : (current as Record<string, unknown>)[segment]
  }
  const last = path[path.length - 1]
  if (typeof last === 'number') {
    (current as unknown[])[last] = value
  } else {
    (current as Record<string, unknown>)[last] = value
  }
  return root
}

export function deleteAtPath(data: unknown, path: JsonPath): unknown {
  if (path.length === 0) return data
  const root = cloneRoot(data)
  let current: unknown = root
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    current = typeof segment === 'number'
      ? (current as unknown[])[segment]
      : (current as Record<string, unknown>)[segment]
  }
  const last = path[path.length - 1]
  if (typeof last === 'number') {
    (current as unknown[]).splice(last, 1)
  } else {
    delete (current as Record<string, unknown>)[last]
  }
  return root
}

export function addObjectKey(data: unknown, path: JsonPath, key: string, value: unknown): unknown {
  const root = cloneRoot(data)
  const target = path.length === 0 ? root : getAtPath(root, path)
  if (typeof target !== 'object' || target === null || Array.isArray(target)) {
    throw new Error('Target is not an object')
  }
  (target as Record<string, unknown>)[key] = value
  return root
}

export function addArrayItem(data: unknown, path: JsonPath, value: unknown): unknown {
  const root = cloneRoot(data)
  const target = path.length === 0 ? root : getAtPath(root, path)
  if (!Array.isArray(target)) throw new Error('Target is not an array')
  target.push(value)
  return root
}

export function getValueType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

export function pathToLabel(path: JsonPath): string {
  if (path.length === 0) return '(root)'
  return path.map((segment) => (
    typeof segment === 'number' ? `[${segment}]` : segment
  )).join('.')
}

export function encodePath(path: JsonPath): string {
  return JSON.stringify(path)
}

export function decodePath(raw: string): JsonPath {
  return JSON.parse(raw) as JsonPath
}

export function parseEditableValue(raw: string, type: string): unknown {
  const trimmed = raw.trim()
  if (type === 'string') {
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return JSON.parse(trimmed)
    }
    return trimmed
  }
  if (type === 'number') {
    const num = Number(trimmed)
    if (Number.isNaN(num)) throw new Error('Invalid number')
    return num
  }
  if (type === 'boolean') return trimmed === 'true'
  if (type === 'null') return null
  return JSON.parse(trimmed)
}
