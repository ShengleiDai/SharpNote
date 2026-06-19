# SharpNote

**SharpNote** (锐记) is a free, open-source, lightweight desktop text editor built with **Electron**, **TypeScript**, **Vite**, and **Monaco Editor**. It focuses on a fast **open → edit → save** workflow with optional structured previews for JSON and Markdown—including **Mermaid** diagrams.

- **Version:** 1.0.0  
- **License:** [Apache License 2.0](LICENSE)  
- **Author:** Norman.S.L.Dai ([norman-dai@fixmail.com](mailto:norman-dai@fixmail.com))  
- **Initial release date:** 2026-06-20  

---

## Features

### Core editing

- Multi-tab single-window editor (Monaco-based)
- New / open / save / save as / close with unsaved-change prompts
- Undo, redo, cut, copy, paste, select all
- Find and replace bar
- Custom frameless title bar and in-app menu bar
- Drag-and-drop file open

### Workspace

- Sidebar folder tree (open folder as workspace)
- File context actions: open, rename, delete
- Directory actions: new file, delete folder
- Recent files (main process)

### Language support

- First-class support for `.txt`, `.log`, `.md`, `.json`
- Syntax highlighting for **40+** file extensions (Web, scripts, SQL, config, etc.)
- Manual language mode override from the menu
- SQL formatting with dialect, keyword case, and indent settings

### Structured previews

| Format | Capabilities |
|--------|----------------|
| **JSON** | Format document/selection, folding, tree preview, click-to-navigate |
| **Markdown** | Live preview (headings, lists, tables, code blocks) |
| **Mermaid** | Diagram rendering inside Markdown preview (flowchart, sequence, mindmap, …) |

### Internationalization

- UI languages: **English**, **中文**, or follow system locale
- Bilingual menu and dialog strings

### First-run experience

- NSIS installer (Windows) with Apache 2.0 license step
- Optional 3-step welcome wizard (language, workspace folder, shortcuts)
- No login or account required

---

## Screenshots

> Add screenshots to `docs/images/` and link them here before publishing the GitHub repository.

---

## System requirements

| Platform | Requirement |
|----------|-------------|
| **Windows** | Windows 10 1809+ (64-bit) — primary target |
| **macOS** | macOS 10.15+ (build configured, less tested) |
| **Linux** | AppImage target (build configured) |

Approximate installed size: ~300 MB (includes Electron runtime and Monaco).

---

## Installation

### Windows (recommended)

1. Download `SharpNote-Windows-1.0.0-Setup.exe` from [Releases](../../releases) (when published).
2. Run the installer. If **SmartScreen** appears for unsigned builds: **More info → Run anyway**.
3. Accept the **Apache License 2.0** and complete the wizard.
4. Launch SharpNote from the desktop or Start menu.

See [docs/安装与本地验证.md](docs/安装与本地验证.md) (Chinese) for local build and verification steps.

### From source

```bash
git clone https://github.com/YOUR_ORG/sharpnote.git
cd sharpnote
npm install
npm run dev
```

---

## Development

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server + Electron |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run generate-icons` | Regenerate `build/icon.ico` from `public/icon.svg` |
| `npm run build` | Production build + `electron-builder` installer |

Build output (Windows):

```
release/1.0.0/SharpNote-Windows-1.0.0-Setup.exe
```

### Project layout

```
sharpnote/
├── electron/          # Main process (IPC, menu, file I/O)
├── src/               # Renderer (UI, Monaco, previews)
├── shared/            # Shared constants (language registry)
├── public/            # Static assets (icon.svg, icon.ico)
├── build/             # Packaged app icons (generated)
├── scripts/           # Build helpers (icons, license headers, afterPack)
└── docs/              # Planning and architecture documents (mostly Chinese)
```

### Architecture

Electron **main** and **renderer** processes communicate through a typed **`window.finmind`** API exposed in `electron/preload.ts`. The renderer does not use Node integration directly.

See [docs/架构设计.md](docs/架构设计.md) for details.

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+O` | Open folder |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+Shift+P` | Toggle JSON preview |
| `Ctrl+Shift+M` | Toggle Markdown preview |
| `Ctrl+G` | Go to line (when implemented in menu) |

---

## Configuration

User settings are stored locally:

- **Windows:** `%APPDATA%\SharpNote\settings.json`
- **macOS:** `~/Library/Application Support/SharpNote/settings.json`
- **Linux:** `~/.config/SharpNote/settings.json`

Settings include UI language, sidebar width, SQL preferences, workspace root, and first-run completion flag.

---

## Roadmap

Version **2.0.0** planning covers standalone `.mmd` / `.mermaid` files, diagram preview mode, and Mermaid mind map templates. See [docs/2.0.0功能规划.md](docs/2.0.0功能规划.md).

---

## Contributing

Contributions are welcome under the Apache 2.0 license.

1. Fork the repository  
2. Create a feature branch  
3. Keep changes focused; match existing TypeScript and project conventions  
4. Run `npm run typecheck` before opening a pull request  
5. Ensure new source files include the standard Apache 2.0 file header  

---

## Copyright and license

```
Copyright 2026 Norman.S.L.Dai <norman-dai@fixmail.com>
```

Licensed under the **Apache License, Version 2.0**.  
You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

See [LICENSE](LICENSE) and [NOTICE](NOTICE).

---

## Contact

- **Author:** Norman.S.L.Dai  
- **Email:** [norman-dai@fixmail.com](mailto:norman-dai@fixmail.com)  

---

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — editing experience  
- [Mermaid](https://mermaid.js.org/) — diagram rendering  
- [Electron](https://www.electronjs.org/) — cross-platform desktop shell  
