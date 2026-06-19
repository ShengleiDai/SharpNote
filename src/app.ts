/**
 * @file app.ts
 * @description Application orchestration: tabs, preview, sidebar, and menu actions.
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

import type { MenuAction } from './types/finmind'
import { EditorManager } from './editor/editorManager'
import { DocumentStore } from './store/documentStore'
import { SettingsStore } from './store/settingsStore'
import { TabBar } from './components/tabBar'
import { StatusBar } from './components/statusBar'
import { FindReplaceBar } from './components/findReplaceBar'
import { JsonPreviewPanel, navigateEditorToPath } from './components/jsonPreviewPanel'
import { MarkdownPreviewPanel } from './components/markdownPreviewPanel'
import { SplitPane } from './components/splitPane'
import { Sidebar } from './components/sidebar'
import { TitleBar } from './components/titleBar'
import { MenuBar } from './components/menuBar'
import { PromptDialog } from './components/promptDialog'
import { WelcomeWizard } from './components/welcomeWizard'
import { isJsonLanguage, isMarkdownLanguage, isFoldableLanguage, getPreviewModeForLanguage } from './editor/languageEditor'
import { getLanguageFromPath } from './utils/language'
import { isSupportedExtension } from '../shared/languageRegistry'
import type { SqlDialect, SqlKeywordCase } from '../shared/languageRegistry'
import type { JsonPath } from './utils/jsonTree'

export class FinMindApp {
  private editorManager = new EditorManager()
  private settingsStore = new SettingsStore()
  private store!: DocumentStore
  private tabBar!: TabBar
  private statusBar!: StatusBar
  private findReplaceBar!: FindReplaceBar
  private jsonPreviewPanel!: JsonPreviewPanel
  private markdownPreviewPanel!: MarkdownPreviewPanel
  private splitPane!: SplitPane
  private sidebar!: Sidebar
  private titleBar!: TitleBar
  private menuBar!: MenuBar
  private isQuitting = false
  private previewUpdateTimer: number | null = null

  async init(): Promise<void> {
    const editorEl = document.getElementById('editor')
    const tabBarEl = document.getElementById('tab-bar')
    const statusBarEl = document.getElementById('status-bar')
    const findBarEl = document.getElementById('find-replace-bar')
    const workspaceEl = document.getElementById('editor-workspace')
    const editorPaneEl = document.getElementById('editor-pane')
    const previewPaneEl = document.getElementById('json-preview-pane')
    const splitterEl = document.getElementById('json-splitter')
    const mainLayoutEl = document.getElementById('main-layout')
    const sidebarPaneEl = document.getElementById('sidebar-pane')
    const sidebarSplitterEl = document.getElementById('sidebar-splitter')
    const titleBarEl = document.getElementById('title-bar')
    const menuBarEl = document.getElementById('menu-bar')
    const appEl = document.getElementById('app')
    if (
      !editorEl || !tabBarEl || !statusBarEl || !findBarEl || !appEl
      || !workspaceEl || !editorPaneEl || !previewPaneEl || !splitterEl
      || !mainLayoutEl || !sidebarPaneEl || !sidebarSplitterEl || !titleBarEl || !menuBarEl
    ) {
      throw new Error('Missing app containers')
    }

    this.titleBar = new TitleBar(titleBarEl, '')

    await this.settingsStore.load()
    const settings = this.settingsStore.getSettings()
    this.titleBar.setAppName(this.settingsStore.getAppName())

    this.editorManager.init(editorEl, settings.lineNumbers, {
      onOpenPreview: () => this.enableContentPreview(),
      onClosePreview: () => this.disableContentPreview(),
    })
    this.store = new DocumentStore(
      (content, language) => this.editorManager.createModel(content, language),
      (model) => this.editorManager.disposeModel(model),
    )
    this.store.setPathLanguageResolver((filePath) =>
      getLanguageFromPath(filePath, this.settingsStore.getSettings().sqlDialect),
    )

    window.finmind.onBeforeQuit(() => void this.handleBeforeQuit())
    window.finmind.onMenuAction((action, payload) => void this.handleMenuAction(action, payload))

    this.menuBar = new MenuBar(menuBarEl, {
      onAction: (action, payload) => void this.handleMenuAction(action, payload),
      getState: () => this.getMenuBarState(),
      loadRecentFiles: () => window.finmind.getRecentFiles(),
      translate: (key) => this.settingsStore.translate(key),
    })

    this.tabBar = new TabBar(tabBarEl, {
      onSwitch: (id) => this.switchTab(id),
      onClose: (id) => void this.closeTab(id),
      onNew: () => this.newTab(),
    })

    this.statusBar = new StatusBar(statusBarEl)
    this.findReplaceBar = new FindReplaceBar(findBarEl, this.editorManager)

    previewPaneEl.innerHTML = ''
    const jsonPreviewRoot = document.createElement('div')
    jsonPreviewRoot.id = 'json-preview-root'
    jsonPreviewRoot.className = 'preview-panel-root'
    const markdownPreviewRoot = document.createElement('div')
    markdownPreviewRoot.id = 'markdown-preview-root'
    markdownPreviewRoot.className = 'preview-panel-root'
    previewPaneEl.append(jsonPreviewRoot, markdownPreviewRoot)

    this.jsonPreviewPanel = new JsonPreviewPanel(jsonPreviewRoot, {
      getContent: () => this.store.getActiveTab()?.model.getValue() ?? '',
      getIndent: () => this.settingsStore.getSettings().jsonIndentSize,
      onApplyContent: (content) => this.applyContentFromPreview(content),
      onNavigate: (path, key) => this.navigateToJsonPath(path, key),
    })

    this.markdownPreviewPanel = new MarkdownPreviewPanel(markdownPreviewRoot, {
      getContent: () => this.store.getActiveTab()?.model.getValue() ?? '',
      getTitle: () => this.settingsStore.translate('viewMdPreview'),
      getEmptyHint: () => this.settingsStore.translate('mdPreviewEmpty'),
      getMermaidLabels: () => ({
        errorTitle: this.settingsStore.translate('mermaidErrorTitle'),
        loadFailed: this.settingsStore.translate('mermaidLoadFailed'),
        emptyHint: this.settingsStore.translate('mermaidEmpty'),
      }),
    })
    this.markdownPreviewPanel.setLabels(
      this.settingsStore.translate('viewMdPreview'),
      this.settingsStore.translate('mdPreviewHint'),
    )

    this.splitPane = new SplitPane(
      workspaceEl,
      editorPaneEl,
      previewPaneEl,
      splitterEl,
      () => this.editorManager.layout(),
    )

    this.sidebar = new Sidebar(
      mainLayoutEl,
      sidebarPaneEl,
      sidebarSplitterEl,
      {
        readDirectory: (dirPath) => window.finmind.readDirectory(dirPath),
        onOpenFile: (filePath) => void this.openPaths([filePath]),
        getActiveFilePath: () => this.store.getActiveTab()?.filePath ?? null,
        onResize: () => this.editorManager.layout(),
        onWidthCommit: (width) => void this.settingsStore.setSidebarWidth(width),
        onNewFile: (dirPath) => void this.handleNewFileInDir(dirPath),
        onDeleteDirectory: (dirPath) => void this.handleDeleteDirectory(dirPath),
        onRenameFile: (filePath, fileName) => void this.handleRenameFile(filePath, fileName),
        onDeleteFile: (filePath, fileName) => void this.handleDeleteFile(filePath, fileName),
        translate: (key) => this.settingsStore.translate(key),
      },
    )

    this.settingsStore.subscribe(() => this.applySettings())
    this.store.subscribe(() => this.refresh())
    this.editorManager.onContentChange(() => {
      this.refresh()
      this.schedulePreviewUpdate()
    })
    this.editorManager.onCursorChange(() => this.updateStatusBar())
    this.editorManager.onMarkersChange(() => this.updateStatusBar())

    this.setupDragDrop(appEl)
    this.applySettings()
    if (settings.workspaceRoot) {
      await this.sidebar.setRoot(settings.workspaceRoot)
    }
    this.applySidebarLayout()
    this.newTab()
    await this.maybeShowWelcomeWizard()
  }

  private async maybeShowWelcomeWizard(): Promise<void> {
    if (this.settingsStore.getSettings().firstRunCompleted) return

    await WelcomeWizard.show({
      translate: (key) => this.settingsStore.translate(key),
      getAppVersion: () => window.finmind.getAppVersion(),
      getUiLanguage: () => this.settingsStore.getSettings().uiLanguage,
      onUiLanguageChange: (lang) => this.settingsStore.setUiLanguage(lang),
      onPickFolder: () => window.finmind.openFolderDialog(),
      onComplete: async (workspaceFolder) => {
        if (workspaceFolder) {
          await this.settingsStore.setWorkspaceRoot(workspaceFolder)
          await this.sidebar.setRoot(workspaceFolder)
        }
        await this.settingsStore.completeFirstRun()
        this.applySidebarLayout()
        this.menuBar.update()
      },
    })
  }

  private applySettings(): void {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.dataset.uiStyle = 'sublime'
    document.documentElement.lang = this.settingsStore.getResolvedLocale()
    this.editorManager.setTheme(this.settingsStore.getMonacoTheme())
    this.editorManager.setLineNumbers(this.settingsStore.getSettings().lineNumbers)
    this.editorManager.setJsonIndentSize(this.settingsStore.getSettings().jsonIndentSize)
    this.titleBar.setAppName(this.settingsStore.getAppName())
    this.markdownPreviewPanel?.setLabels(
      this.settingsStore.translate('viewMdPreview'),
      this.settingsStore.translate('mdPreviewHint'),
    )
    this.store?.setPathLanguageResolver((filePath) =>
      getLanguageFromPath(filePath, this.settingsStore.getSettings().sqlDialect),
    )
    this.applySidebarLayout()
    for (const tab of this.store.getTabs()) {
      if (tab.filePath?.toLowerCase().endsWith('.sql') && !tab.languageOverride) {
        this.store.applyPathLanguageToTab(tab.id)
      }
    }
    this.menuBar?.update()
    this.refresh()
  }

  private getMenuBarState() {
    const settings = this.settingsStore.getSettings()
    const tab = this.store?.getActiveTab() ?? null
    const language = tab?.language ?? 'plaintext'
    return {
      lineNumbers: settings.lineNumbers,
      sidebarVisible: settings.sidebarVisible,
      contentPreview: tab?.contentPreview ?? false,
      activeLanguage: language,
      foldable: isFoldableLanguage(language),
      isJson: isJsonLanguage(language),
      isMarkdown: isMarkdownLanguage(language),
      canFormatDocument: this.editorManager.canFormatDocument(language),
      canFormatSelection: this.editorManager.canFormatSelection(language),
      jsonIndentSize: settings.jsonIndentSize,
      sqlDialect: settings.sqlDialect,
      sqlKeywordCase: settings.sqlKeywordCase,
      sqlIndentSize: settings.sqlIndentSize,
      recentFiles: [] as string[],
      uiLanguage: settings.uiLanguage,
    }
  }

  private applySidebarLayout(): void {
    const settings = this.settingsStore.getSettings()
    this.sidebar.setWidth(settings.sidebarWidth)
    this.sidebar.setVisible(settings.sidebarVisible && !!this.sidebar.getRootPath())
    this.editorManager.layout()
  }

  private syncEditorContext(): void {
    const tab = this.store.getActiveTab()
    window.finmind.setEditorContext({
      language: tab?.language ?? 'plaintext',
      contentPreview: tab?.contentPreview ?? false,
    })
  }

  private updatePreviewLayout(): void {
    const tab = this.store.getActiveTab()
    const showJson = !!tab && getPreviewModeForLanguage(tab.language) === 'json' && tab.contentPreview
    const showMarkdown = !!tab && getPreviewModeForLanguage(tab.language) === 'markdown' && tab.contentPreview
    const enabled = showJson || showMarkdown

    this.editorManager.setPreviewContextActive(enabled)
    this.splitPane.setPreviewVisible(enabled)
    this.jsonPreviewPanel.setVisible(showJson)
    this.markdownPreviewPanel.setVisible(showMarkdown)

    if (showJson) {
      this.jsonPreviewPanel.render()
    }
    if (showMarkdown) {
      void this.markdownPreviewPanel.render()
    }
    this.editorManager.layout()
  }

  private schedulePreviewUpdate(): void {
    const tab = this.store.getActiveTab()
    if (!tab?.contentPreview) return
    const previewMode = getPreviewModeForLanguage(tab.language)
    if (!previewMode) return
    if (this.previewUpdateTimer !== null) {
      window.clearTimeout(this.previewUpdateTimer)
    }
    this.previewUpdateTimer = window.setTimeout(() => {
      this.previewUpdateTimer = null
      if (previewMode === 'json') {
        this.jsonPreviewPanel.render()
      } else if (previewMode === 'markdown') {
        void this.markdownPreviewPanel.render()
      }
    }, 200)
  }

  private applyContentFromPreview(content: string): void {
    const tab = this.store.getActiveTab()
    if (!tab) return
    tab.model.setValue(content)
    this.editorManager.focus()
  }

  private navigateToJsonPath(path: JsonPath, key?: string): void {
    navigateEditorToPath(this.editorManager.getEditor(), path, key)
  }

  private toggleContentPreview(): void {
    const tab = this.store.getActiveTab()
    if (!tab || !getPreviewModeForLanguage(tab.language)) return
    this.store.toggleContentPreview(tab.id)
    this.updatePreviewLayout()
    this.syncEditorContext()
  }

  private enableContentPreview(): void {
    const tab = this.store.getActiveTab()
    if (!tab || !getPreviewModeForLanguage(tab.language)) return
    this.store.setContentPreview(tab.id, true)
    this.updatePreviewLayout()
    this.syncEditorContext()
  }

  private disableContentPreview(): void {
    const tab = this.store.getActiveTab()
    if (!tab || !getPreviewModeForLanguage(tab.language)) return
    this.store.setContentPreview(tab.id, false)
    this.updatePreviewLayout()
    this.syncEditorContext()
  }

  private setupDragDrop(appEl: HTMLElement): void {
    appEl.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    appEl.addEventListener('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const files = Array.from(e.dataTransfer?.files ?? [])
      const paths = files
        .map((f) => (f as File & { path?: string }).path)
        .filter((p): p is string => !!p)
      void this.openPaths(paths)
    })
  }

  private refresh(): void {
    const active = this.store.getActiveTab()
    if (active && this.editorManager.getEditor().getModel() !== active.model) {
      this.editorManager.setModel(active.model)
    } else if (active) {
      this.editorManager.applyLanguageOptions(active.language)
    }
    this.tabBar.render(this.store)
    this.updateTitle()
    this.updateStatusBar()
    this.updatePreviewLayout()
    this.sidebar.highlightActiveFile()
    this.menuBar?.update()
    this.syncEditorContext()
  }

  private updateStatusBar(): void {
    this.statusBar.update(this.store, this.editorManager, this.settingsStore)
  }

  private updateTitle(): void {
    const appName = this.settingsStore.getAppName()
    const tab = this.store.getActiveTab()
    if (!tab) {
      window.finmind.setTitle(appName)
      this.titleBar.setDocumentTitle(null)
      return
    }
    const prefix = this.store.isDirty(tab) ? '* ' : ''
    const docTitle = `${prefix}${tab.displayName}`
    window.finmind.setTitle(`${docTitle} - ${appName}`)
    this.titleBar.setDocumentTitle(docTitle)
  }

  private switchTab(tabId: string): void {
    const tab = this.store.switchTab(tabId)
    if (tab) {
      this.editorManager.setModel(tab.model)
      this.editorManager.focus()
    }
  }

  private newTab(): void {
    this.store.newTab()
    const tab = this.store.getActiveTab()
    if (tab) this.editorManager.setModel(tab.model)
    this.editorManager.focus()
  }

  private async closeTab(tabId: string): Promise<void> {
    const tab = this.store.getTabs().find((t) => t.id === tabId)
    if (!tab) return

    const canClose = await this.confirmDiscardIfDirty(tab.id)
    if (!canClose) return

    this.store.closeTab(tabId)
    if (!this.store.hasOpenTabs()) {
      this.newTab()
    } else {
      const active = this.store.getActiveTab()
      if (active) this.editorManager.setModel(active.model)
    }
  }

  private async confirmDiscardIfDirty(tabId: string): Promise<boolean> {
    const tab = this.store.getTabs().find((t) => t.id === tabId)
    if (!tab || !this.store.isDirty(tab)) return true

    const response = await window.finmind.showMessageBox({
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      message: `Save changes to "${tab.displayName}"?`,
      detail: 'Your changes will be lost if you do not save.',
    })

    if (response === 2) return false
    if (response === 1) return true
    return this.saveTab(tabId)
  }

  private async saveTab(tabId: string): Promise<boolean> {
    const tab = this.store.getTabs().find((t) => t.id === tabId)
    if (!tab) return false

    const content = tab.model.getValue()
    let filePath = tab.filePath

    if (!filePath) {
      filePath = await window.finmind.saveAsDialog(tab.displayName)
      if (!filePath) return false
    }

    try {
      const result = await window.finmind.writeFile(filePath, content)
      this.store.markSaved(tabId, content, result.filePath, result.fileName)
      return true
    } catch (err) {
      await this.showError('Save failed', err)
      return false
    }
  }

  private async saveActiveTab(): Promise<boolean> {
    const tab = this.store.getActiveTab()
    if (!tab) return false
    return this.saveTab(tab.id)
  }

  private async openPaths(paths: string[]): Promise<void> {
    if (!paths.length) return
    try {
      for (const filePath of paths) {
        const file = await window.finmind.readFile(filePath)
        const tab = this.store.openFile(file.filePath, file.fileName, file.content)
        this.editorManager.setModel(tab.model)
      }
      this.editorManager.focus()
    } catch (err) {
      await this.showError('Open failed', err)
    }
  }

  private async openFiles(): Promise<void> {
    const paths = await window.finmind.openFileDialog()
    if (!paths?.length) return
    await this.openPaths(paths)
  }

  private async openFolder(): Promise<void> {
    const folderPath = await window.finmind.openFolderDialog()
    if (!folderPath) return
    await this.sidebar.setRoot(folderPath)
    await this.settingsStore.setWorkspaceRoot(folderPath)
    this.applySidebarLayout()
  }

  private async handleNewFileInDir(dirPath: string): Promise<void> {
    const name = await PromptDialog.show(
      'New File',
      'Enter file name with extension (e.g. notes.json, readme.md). Defaults to .txt if omitted.',
      'untitled.txt',
    )
    if (!name) return

    try {
      const result = await window.finmind.createFile(dirPath, name)
      await this.sidebar.refreshTree()
      const ext = result.fileName.includes('.')
        ? result.fileName.slice(result.fileName.lastIndexOf('.')).toLowerCase()
        : '.txt'
      const editable = isSupportedExtension(ext)
      if (editable) {
        await this.openPaths([result.filePath])
      } else {
        await window.finmind.showMessageBox({
          type: 'info',
          title: 'File Created',
          message: 'File created successfully',
          detail: `"${result.fileName}" was created. ${this.settingsStore.getAppName()} does not support editing ${ext} files yet.`,
        })
      }
    } catch (err) {
      await this.showError('Create file failed', err)
    }
  }

  private async handleDeleteDirectory(dirPath: string): Promise<void> {
    const folderName = dirPath.split(/[/\\]/).pop() ?? dirPath
    const response = await window.finmind.showMessageBox({
      type: 'warning',
      title: 'Delete Folder',
      buttons: ['Delete', 'Cancel'],
      defaultId: 1,
      cancelId: 1,
      message: `Delete folder "${folderName}"?`,
      detail: 'This will permanently delete the folder and all its contents.',
    })
    if (response !== 0) return

    try {
      await window.finmind.deletePath(dirPath, this.sidebar.getRootPath())
      await this.sidebar.refreshTree()
    } catch (err) {
      await this.showError('Delete folder failed', err)
    }
  }

  private async handleRenameFile(filePath: string, fileName: string): Promise<void> {
    const newName = await PromptDialog.show(
      this.settingsStore.translate('sidebarRenamePrompt'),
      this.settingsStore.translate('sidebarRenameMessage'),
      fileName,
    )
    if (!newName || newName === fileName) return

    try {
      const result = await window.finmind.renamePath(filePath, newName)
      const openTab = this.store.getTabs().find((t) => t.filePath === filePath)
      if (openTab) {
        this.store.updateFilePath(openTab.id, result.filePath, result.fileName)
      }
      await this.sidebar.refreshTree()
    } catch (err) {
      await this.showError(this.settingsStore.translate('sidebarRenamePrompt'), err)
    }
  }

  private async handleDeleteFile(filePath: string, fileName: string): Promise<void> {
    const message = this.settingsStore.translate('sidebarDeleteFileMessage').replace('{name}', fileName)
    const isZh = this.settingsStore.getResolvedLocale() === 'zh'
    const response = await window.finmind.showMessageBox({
      type: 'warning',
      title: this.settingsStore.translate('sidebarDeleteFileTitle'),
      buttons: [isZh ? '删除' : 'Delete', isZh ? '取消' : 'Cancel'],
      defaultId: 1,
      cancelId: 1,
      message,
      detail: this.settingsStore.translate('sidebarDeleteFileDetail'),
    })
    if (response !== 0) return

    const openTab = this.store.getTabs().find((t) => t.filePath === filePath)
    if (openTab) {
      const canClose = await this.confirmDiscardIfDirty(openTab.id)
      if (!canClose) return
      this.store.closeTab(openTab.id)
      if (!this.store.hasOpenTabs()) {
        this.newTab()
      } else {
        const active = this.store.getActiveTab()
        if (active) this.editorManager.setModel(active.model)
      }
    }

    try {
      await window.finmind.deletePath(filePath, this.sidebar.getRootPath())
      await this.sidebar.refreshTree()
    } catch (err) {
      await this.showError(this.settingsStore.translate('sidebarDeleteFileTitle'), err)
    }
  }

  private async handleBeforeQuit(): Promise<void> {
    if (this.isQuitting) return
    this.isQuitting = true

    if (!this.store) {
      window.finmind.confirmQuit()
      return
    }

    const dirtyTabs = this.store.getDirtyTabs()
    for (const tab of dirtyTabs) {
      this.store.switchTab(tab.id)
      this.editorManager.setModel(tab.model)
      const canProceed = await this.confirmDiscardIfDirty(tab.id)
      if (!canProceed) {
        this.isQuitting = false
        window.finmind.cancelQuit()
        return
      }
    }

    window.finmind.confirmQuit()
  }

  private async handleMenuAction(action: MenuAction, payload?: string): Promise<void> {
    switch (action) {
      case 'file:new':
        this.newTab()
        break
      case 'file:open':
        await this.openFiles()
        break
      case 'file:open-folder':
        await this.openFolder()
        break
      case 'file:open-recent':
        if (payload) await this.openPaths([payload])
        break
      case 'file:save':
        await this.saveActiveTab()
        break
      case 'file:save-as': {
        const tab = this.store.getActiveTab()
        if (!tab) break
        const path = await window.finmind.saveAsDialog(tab.displayName)
        if (!path) break
        try {
          const content = tab.model.getValue()
          const result = await window.finmind.writeFile(path, content)
          this.store.markSaved(tab.id, content, result.filePath, result.fileName)
        } catch (err) {
          await this.showError('Save As failed', err)
        }
        break
      }
      case 'file:save-all':
        await this.saveAllTabs()
        break
      case 'file:close-tab': {
        const tab = this.store.getActiveTab()
        if (tab) await this.closeTab(tab.id)
        break
      }
      case 'file:close-all':
        await this.closeAllTabs()
        break
      case 'file:exit':
        await this.handleBeforeQuit()
        break
      case 'edit:undo':
        this.editorManager.runAction('undo')
        break
      case 'edit:redo':
        this.editorManager.runAction('redo')
        break
      case 'edit:cut':
        this.editorManager.runAction('editor.action.clipboardCutAction')
        break
      case 'edit:copy':
        this.editorManager.runAction('editor.action.clipboardCopyAction')
        break
      case 'edit:paste':
        this.editorManager.runAction('editor.action.clipboardPasteAction')
        break
      case 'edit:select-all':
        this.editorManager.runAction('editor.action.selectAll')
        break
      case 'edit:delete':
        this.editorManager.runAction('deleteRight')
        break
      case 'edit:find':
        this.findReplaceBar.show('find')
        break
      case 'edit:replace':
        this.findReplaceBar.show('replace')
        break
      case 'edit:find-next':
        if (this.findReplaceBar.isVisible()) {
          this.findReplaceBar.findNext()
        } else {
          this.editorManager.runAction('editor.action.nextMatchFindAction')
        }
        break
      case 'edit:find-previous':
        if (this.findReplaceBar.isVisible()) {
          this.findReplaceBar.findPrevious()
        } else {
          this.editorManager.runAction('editor.action.previousMatchFindAction')
        }
        break
      case 'edit:format-document':
        await this.formatDocument()
        break
      case 'edit:format-selection':
        await this.formatSelection()
        break
      case 'search:goto-line':
        await this.gotoLine()
        break
      case 'view:toggle-line-numbers':
        await this.settingsStore.toggleLineNumbers()
        break
      case 'view:language-json':
        this.setLanguageMode('json')
        break
      case 'view:language-markdown':
        this.setLanguageMode('markdown')
        break
      case 'view:language-plaintext':
        this.setLanguageMode('plaintext')
        break
      case 'view:language-set':
        if (payload) this.setLanguageMode(payload)
        break
      case 'view:fold':
        this.editorManager.runAction('editor.fold')
        break
      case 'view:unfold':
        this.editorManager.runAction('editor.unfold')
        break
      case 'view:fold-all':
        this.editorManager.runAction('editor.foldAll')
        break
      case 'view:unfold-all':
        this.editorManager.runAction('editor.unfoldAll')
        break
      case 'view:indent-2':
        await this.settingsStore.setJsonIndentSize(2)
        break
      case 'view:indent-4':
        await this.settingsStore.setJsonIndentSize(4)
        break
      case 'view:toggle-json-preview':
      case 'view:toggle-markdown-preview':
        this.toggleContentPreview()
        break
      case 'view:toggle-sidebar':
        await this.settingsStore.toggleSidebar()
        break
      case 'settings:ui-language-system':
        await this.settingsStore.setUiLanguage('system')
        break
      case 'settings:ui-language-zh':
        await this.settingsStore.setUiLanguage('zh')
        break
      case 'settings:ui-language-en':
        await this.settingsStore.setUiLanguage('en')
        break
      case 'settings:sql-dialect':
        if (payload) await this.settingsStore.setSqlDialect(payload as SqlDialect)
        break
      case 'settings:sql-keyword-case':
        if (payload) await this.settingsStore.setSqlKeywordCase(payload as SqlKeywordCase)
        break
      case 'settings:sql-indent-2':
        await this.settingsStore.setSqlIndentSize(2)
        break
      case 'settings:sql-indent-4':
        await this.settingsStore.setSqlIndentSize(4)
        break
      case 'window:next-document':
        this.switchToAdjacentTab(1)
        break
      case 'window:prev-document':
        this.switchToAdjacentTab(-1)
        break
      case 'help:about': {
        const version = await window.finmind.getAppVersion()
        await window.finmind.showMessageBox({
          type: 'info',
          title: this.settingsStore.translate('helpAbout'),
          message: this.settingsStore.getAppName(),
          detail: `A free & open-source lightweight text editor.\nVersion ${version}\nApache License 2.0\n\nElectron + TypeScript + Monaco Editor`,
        })
        break
      }
    }
  }

  private async saveAllTabs(): Promise<void> {
    for (const tab of this.store.getTabs()) {
      if (!this.store.isDirty(tab)) continue
      this.store.switchTab(tab.id)
      this.editorManager.setModel(tab.model)
      const saved = await this.saveTab(tab.id)
      if (!saved) break
    }
  }

  private async closeAllTabs(): Promise<void> {
    const tabs = [...this.store.getTabs()]
    for (const tab of tabs) {
      this.store.switchTab(tab.id)
      this.editorManager.setModel(tab.model)
      const canClose = await this.confirmDiscardIfDirty(tab.id)
      if (!canClose) return
      this.store.closeTab(tab.id)
    }
    if (!this.store.hasOpenTabs()) {
      this.newTab()
    } else {
      const active = this.store.getActiveTab()
      if (active) this.editorManager.setModel(active.model)
    }
  }

  private async gotoLine(): Promise<void> {
    const input = await PromptDialog.show(
      this.settingsStore.translate('gotoLinePrompt'),
      this.settingsStore.translate('gotoLineMessage'),
      '1',
    )
    if (!input) return
    const line = Number.parseInt(input, 10)
    if (!Number.isFinite(line) || line < 1) return
    const editor = this.editorManager.getEditor()
    const model = editor.getModel()
    if (!model) return
    const targetLine = Math.min(line, model.getLineCount())
    editor.setPosition({ lineNumber: targetLine, column: 1 })
    editor.revealLineInCenter(targetLine)
    editor.focus()
  }

  private switchToAdjacentTab(direction: 1 | -1): void {
    const tabs = this.store.getTabs()
    if (tabs.length <= 1) return
    const activeId = this.store.getActiveTabId()
    const index = tabs.findIndex((t) => t.id === activeId)
    if (index < 0) return
    const nextIndex = (index + direction + tabs.length) % tabs.length
    const next = tabs[nextIndex]
    this.store.switchTab(next.id)
    this.editorManager.setModel(next.model)
    this.editorManager.focus()
  }

  private setLanguageMode(language: string): void {
    const tab = this.store.getActiveTab()
    if (!tab) return
    const updated = this.store.setLanguage(tab.id, language)
    if (updated) {
      this.editorManager.applyLanguageOptions(updated.language)
      this.editorManager.focus()
      this.updatePreviewLayout()
      this.syncEditorContext()
      this.updateStatusBar()
    }
  }

  private async formatDocument(): Promise<void> {
    const result = await this.editorManager.formatDocument(this.settingsStore.getFormatSettings())
    if (!result.ok) {
      await window.finmind.showMessageBox({
        type: 'error',
        title: this.settingsStore.translate('editFormatDocument'),
        message: this.settingsStore.translate('formatFailed'),
        detail: result.error,
      })
    }
  }

  private async formatSelection(): Promise<void> {
    const result = await this.editorManager.formatSelection(this.settingsStore.getFormatSettings())
    if (!result.ok) {
      await window.finmind.showMessageBox({
        type: 'error',
        title: this.settingsStore.translate('editFormatSelection'),
        message: this.settingsStore.translate('formatFailed'),
        detail: result.error,
      })
    }
  }

  private async showError(title: string, err: unknown): Promise<void> {
    const detail = err instanceof Error ? err.message : String(err)
    await window.finmind.showMessageBox({
      type: 'error',
      title,
      message: title,
      detail,
    })
  }
}
