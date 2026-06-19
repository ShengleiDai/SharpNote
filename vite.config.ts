/**
 * @file vite.config.ts
 * @description Vite and Electron build configuration.
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

import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mermaid: ['mermaid'],
        },
      },
    },
  },
})
