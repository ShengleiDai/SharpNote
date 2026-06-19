/**
 * @file languageMenu.ts
 * @description Language mode submenu builder.
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

import type { LanguageMenuGroup } from '../../shared/languageRegistry'
import type { MenuEntry } from './menuDefinition'
import type { MenuBarState } from '../components/menuBar'
import { getMenuLanguagesByGroup, LANGUAGE_DEFINITIONS } from '../../shared/languageRegistry'

function languageMenuItems(group: LanguageMenuGroup, activeLanguage: string): MenuEntry[] {
  const defs = getMenuLanguagesByGroup(group)
  return defs.map((def) => ({
    type: 'item' as const,
    labelKey: 'empty' as const,
    label: def.displayName,
    action: 'view:language-set' as const,
    payload: def.id,
    checked: activeLanguage === def.id,
  }))
}

export function buildLanguageMenuEntries(state: MenuBarState): MenuEntry[] {
  const entries: MenuEntry[] = [
    { type: 'item', labelKey: 'langPlaintext', action: 'view:language-set', payload: 'plaintext', checked: state.activeLanguage === 'plaintext' },
    { type: 'separator' },
    ...languageMenuItems('common', state.activeLanguage).filter((e) => e.type === 'item' && e.payload !== 'plaintext'),
    { type: 'separator' },
    {
      type: 'submenu',
      labelKey: 'langGroupWeb',
      children: languageMenuItems('web', state.activeLanguage),
    },
    {
      type: 'submenu',
      labelKey: 'langGroupSystem',
      children: languageMenuItems('system', state.activeLanguage),
    },
    {
      type: 'submenu',
      labelKey: 'langGroupScript',
      children: languageMenuItems('script', state.activeLanguage),
    },
    {
      type: 'submenu',
      labelKey: 'langGroupSql',
      children: languageMenuItems('sql', state.activeLanguage),
    },
    {
      type: 'submenu',
      labelKey: 'langGroupConfig',
      children: languageMenuItems('config', state.activeLanguage),
    },
  ]

  return entries
}

export function getAllLanguageIds(): string[] {
  return LANGUAGE_DEFINITIONS.map((d) => d.id)
}
