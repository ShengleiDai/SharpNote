/**
 * @file monacoSetup.ts
 * @description Monaco worker and environment configuration.
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

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import * as monaco from 'monaco-editor'

self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return new jsonWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    return new editorWorker()
  },
}

export { monaco }
