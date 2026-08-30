import React, { useState } from 'react';
import { 
  FileText, FolderOpen, Save, Undo, Redo, Trash2, Layers, 
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Code, Image as ImageIcon, Grid, Eye, Compass, LayoutGrid, RotateCcw,
  ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Sliders, Play
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { fileSystemService } from '../../services/fileSystem';

export const HeaderMenu: React.FC = () => {
  const {
    project,
    fileHandle,
    setProject,
    renameProject,
    undo,
    redo,
    undoStack,
    redoStack,
    deleteSelected,
    groupSelected,
    selectedIds,
    alignSelected,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    showGrid,
    snapToGrid,
    showRulers,
    showInspector,
    toggleGrid,
    toggleSnap,
    toggleRulers,
    toggleInspector,
    setCodeExportOpen,
    setGraphicExportOpen,
    setLivePreviewOpen,
    resetToInitialDemo,
    theme,
  } = useProjectStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);

  const handleNewProject = () => {
    if (confirm('Create new project? Unsaved changes will be replaced.')) {
      resetToInitialDemo();
    }
  };

  const handleOpenProject = async () => {
    const res = await fileSystemService.openProjectFile();
    if (res) {
      setProject(res.project, res.handle);
    }
  };

  const handleSaveProject = async () => {
    const handle = await fileSystemService.saveProjectFile(project, fileHandle);
    if (handle) {
      setProject(project, handle);
    }
  };

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      renameProject(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const primarySelectedId = selectedIds.length > 0 ? selectedIds[0] : null;
  const isDark = theme === 'dark';

  return (
    <header className={`h-12 border-b flex items-center justify-between px-3 select-none z-30 transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/30">
          <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow" />
          <span className={`font-bold tracking-wide text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>WebScape</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded font-mono">Inkscape Core</span>
        </div>

        <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />

        {/* Project Name Input */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className={`text-xs px-2 py-1 rounded outline-none w-48 border border-indigo-500 ${
              isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
            }`}
          />
        ) : (
          <button
            onClick={() => {
              setTitleInput(project.name);
              setIsEditingTitle(true);
            }}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            {project.name}
          </button>
        )}
      </div>

      {/* Center Actions Toolbar (File, Edit, Layer Z-Index, Align, View) */}
      <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
        isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        {/* File Actions */}
        <button
          onClick={handleNewProject}
          title="New Project"
          className={`flex items-center gap-1 px-2 py-1 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
        <button
          onClick={handleOpenProject}
          title="Open Project (.webscape)"
          className={`flex items-center gap-1 px-2 py-1 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>Open</span>
        </button>
        <button
          onClick={handleSaveProject}
          title="Save Project (File System Access API)"
          className={`flex items-center gap-1 px-2 py-1 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Save className="w-3.5 h-3.5 text-emerald-500" />
          <span>Save</span>
        </button>
        <button
          onClick={resetToInitialDemo}
          title="Reset Demo Layout"
          className={`p-1.5 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className={`h-3.5 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* History Actions */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Y)"
          className={`p-1.5 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <div className={`h-3.5 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* Layer Z-Index Stacking Controls */}
        <button
          onClick={() => primarySelectedId && bringToFront(primarySelectedId)}
          disabled={!primarySelectedId}
          title="Bring to Front (Paling Depan)"
          className={`p-1 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-indigo-400' : 'hover:bg-slate-200 text-slate-700 hover:text-indigo-600'
          }`}
        >
          <ArrowUpToLine className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => primarySelectedId && moveUp(primarySelectedId)}
          disabled={!primarySelectedId}
          title="Bring Forward (1 Step Up)"
          className={`p-1 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-indigo-400' : 'hover:bg-slate-200 text-slate-700 hover:text-indigo-600'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => primarySelectedId && moveDown(primarySelectedId)}
          disabled={!primarySelectedId}
          title="Send Backward (1 Step Down)"
          className={`p-1 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-indigo-400' : 'hover:bg-slate-200 text-slate-700 hover:text-indigo-600'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => primarySelectedId && sendToBack(primarySelectedId)}
          disabled={!primarySelectedId}
          title="Send to Back (Paling Belakang)"
          className={`p-1 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-indigo-400' : 'hover:bg-slate-200 text-slate-700 hover:text-indigo-600'
          }`}
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
        </button>

        <div className={`h-3.5 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* Group / Delete */}
        <button
          onClick={groupSelected}
          disabled={selectedIds.length < 2}
          title="Group Selected (Ctrl+G)"
          className={`p-1.5 disabled:opacity-30 rounded transition ${
            isDark ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          title="Delete Selected (Del)"
          className="p-1.5 hover:bg-red-500/20 text-red-500 disabled:opacity-30 rounded transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className={`h-3.5 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* Alignment controls */}
        <button
          onClick={() => alignSelected('left')}
          disabled={selectedIds.length < 2}
          title="Align Left"
          className={`p-1 disabled:opacity-30 rounded ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => alignSelected('center')}
          disabled={selectedIds.length < 2}
          title="Align Center Horizontal"
          className={`p-1 disabled:opacity-30 rounded ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => alignSelected('right')}
          disabled={selectedIds.length < 2}
          title="Align Right"
          className={`p-1 disabled:opacity-30 rounded ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => alignSelected('top')}
          disabled={selectedIds.length < 2}
          title="Align Top"
          className={`p-1 disabled:opacity-30 rounded ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignStartVertical className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => alignSelected('middle')}
          disabled={selectedIds.length < 2}
          title="Align Middle Vertical"
          className={`p-1 disabled:opacity-30 rounded ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignCenterVertical className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => alignSelected('bottom')}
          disabled={selectedIds.length < 2}
          title="Align Bottom"
          className={`p-1 disabled:opacity-30 rounded ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlignEndVertical className="w-3.5 h-3.5" />
        </button>

        <div className={`h-3.5 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

        {/* View toggles */}
        <button
          onClick={toggleGrid}
          title="Toggle Grid"
          className={`p-1.5 rounded transition ${showGrid ? 'bg-indigo-600 text-white' : isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleSnap}
          title="Toggle Snap to Grid"
          className={`p-1.5 rounded transition ${snapToGrid ? 'bg-indigo-600 text-white' : isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleRulers}
          title="Toggle Rulers"
          className={`p-1.5 rounded transition ${showRulers ? 'bg-indigo-600 text-white' : isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleInspector}
          title={showInspector ? "Sembunyikan Panel Properti Kanan" : "Tampilkan Panel Properti Kanan"}
          className={`p-1.5 rounded transition ${showInspector ? 'bg-indigo-600 text-white' : isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Export & Live Preview Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLivePreviewOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-md shadow-md shadow-indigo-600/30 transition transform active:scale-95"
          title="Buka Live Preview HTML + CSS yang dirender dari Canvas"
        >
          <Play className="w-3.5 h-3.5 fill-current text-indigo-200" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setCodeExportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md shadow-md shadow-indigo-600/20 transition"
        >
          <Code className="w-3.5 h-3.5 text-indigo-200" />
          <span>Export Code</span>
        </button>

        <button
          onClick={() => setGraphicExportOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
          <span>Export Graphic</span>
        </button>
      </div>
    </header>
  );
};
