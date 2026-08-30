import { useEffect } from 'react';
import { HeaderMenu } from './components/ui/HeaderMenu';
import { Toolbar } from './components/ui/Toolbar';
import { LayerPanel } from './components/ui/LayerPanel';
import { CanvasWorkspace } from './components/canvas/CanvasWorkspace';
import { PropertyInspector } from './components/ui/PropertyInspector';
import { CodeExportModal } from './components/modals/CodeExportModal';
import { GraphicExportModal } from './components/modals/GraphicExportModal';
import { LivePreviewModal } from './components/modals/LivePreviewModal';
import { useProjectStore } from './store/useProjectStore';

export function App() {
  const {
    loadDraftFromStorage,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    groupSelected,
    ungroupSelected,
    setActiveTool,
    setCodeExportOpen,
    toggleInspector,
    nudgeSelected,
  } = useProjectStore();

  // Load IndexedDB saved project draft on mount
  useEffect(() => {
    loadDraftFromStorage();
  }, [loadDraftFromStorage]);

  // Global Keyboard Shortcuts (Inkscape CAD style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside an input/textarea/select or contentEditable
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;

      // Arrow Key Nudge (1px default, 10px with Shift)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        else if (e.key === 'ArrowDown') dy = step;
        else if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowRight') dx = step;

        nudgeSelected(dx, dy);
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (ctrlCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (ctrlCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (ctrlCmd && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) ungroupSelected();
        else groupSelected();
      } else if (ctrlCmd && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setCodeExportOpen(true);
      } else if (ctrlCmd && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleInspector();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('hand');
      } else if (e.key.toLowerCase() === 'f') {
        setActiveTool('frame');
      } else if (e.key.toLowerCase() === 'r') {
        setActiveTool('rectangle');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('ellipse');
      } else if (e.key.toLowerCase() === 'p') {
        setActiveTool('path');
      } else if (e.key.toLowerCase() === 't') {
        setActiveTool('text');
      } else if (e.key.toLowerCase() === 'z') {
        setActiveTool('zoom');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected, duplicateSelected, groupSelected, ungroupSelected, setActiveTool, setCodeExportOpen, toggleInspector, nudgeSelected]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header Menu Bar */}
      <HeaderMenu />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Floating Toolbar */}
        <Toolbar />

        {/* Left Layers Panel Tree */}
        <LayerPanel />

        {/* Center Canvas Studio */}
        <CanvasWorkspace />

        {/* Right Property Inspector Sidebar */}
        <PropertyInspector />
      </div>

      {/* Modals */}
      <CodeExportModal />
      <GraphicExportModal />
      <LivePreviewModal />
    </div>
  );
}

export default App;
