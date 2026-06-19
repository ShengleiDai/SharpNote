/**
 * @file main.ts
 * @description Renderer process bootstrap.
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

import './styles/app.css'
import { FinMindApp } from './app'

const app = new FinMindApp()
app.init().catch((err) => {
  console.error(err)
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = `<div style="padding:24px;color:#ccc;font-family:Segoe UI,sans-serif">
      <h2 style="color:#f87171;margin-bottom:12px">SharpNote failed to start</h2>
      <pre style="white-space:pre-wrap;font-size:13px">${err instanceof Error ? err.message : String(err)}</pre>
    </div>`
  }
})
