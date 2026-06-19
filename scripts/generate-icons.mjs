/**
 * @file generate-icons.mjs
 * @description Build script: generate ICO and PNG icons from SVG.
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

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const svgPath = path.join(root, 'public', 'icon.svg')
const buildDir = path.join(root, 'build')
const publicDir = path.join(root, 'public')

fs.mkdirSync(buildDir, { recursive: true })

const icoSizes = [16, 32, 48, 256]
const pngBuffers = await Promise.all(
  icoSizes.map((size) => sharp(svgPath).resize(size, size).png().toBuffer()),
)

const icoBuffer = await pngToIco(pngBuffers)
const icoPath = path.join(buildDir, 'icon.ico')
fs.writeFileSync(icoPath, icoBuffer)
fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuffer)

const squarePngPath = path.join(buildDir, 'icon-square.png')
await sharp(svgPath).resize(512, 512).png().toFile(squarePngPath)

console.log('Generated icons:', icoPath, squarePngPath)
