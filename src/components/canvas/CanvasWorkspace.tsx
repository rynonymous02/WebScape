import React from 'react';
import { SVGCanvas } from './SVGCanvas';
import { RulersOverlay } from './RulersOverlay';
import { useProjectStore } from '../../store/useProjectStore';
import { ZoomIn, ZoomOut, Maximize2, MousePointer } from 'lucide-react';

export const CanvasWorkspace: React.FC = () => {
  const { canvasTransform, zoomIn, zoomOut, resetZoom, showRulers, selectedIds, project, theme } = useProjectStore();

  const selectedCount = selectedIds.length;
  const selectedNode = selectedCount === 1 ? project.nodes[selectedIds[0]] : null;
  const isDark = theme === 'dark';

  return (
    <main className={`relative flex-1 h-full flex flex-col overflow-hidden transition-colors ${
      isDark ? 'bg-slate-950' : 'bg-slate-100'
    }`}>
      {/* Upper Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        {showRulers && (
          <RulersOverlay
            zoom={canvasTransform.zoom}
            panX={canvasTransform.panX}
            panY={canvasTransform.panY}
          />
        )}

        <SVGCanvas />

        {/* Zoom & Viewport Floating Badge */}
        <div className={`absolute bottom-4 right-4 backdrop-blur-sm rounded-lg shadow-xl px-3 py-1.5 flex items-center gap-2 text-xs z-20 border ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-200 text-slate-700 shadow-md'
        }`}>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className={`p-1 rounded transition ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono font-medium text-indigo-500 min-w-12 text-center">
            {Math.round(canvasTransform.zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className={`p-1 rounded transition ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className={`h-3 w-px my-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <button
            onClick={resetZoom}
            title="Reset Zoom to 100%"
            className={`p-1 rounded transition ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className={`h-7 border-t flex items-center justify-between px-3 text-[11px] font-mono select-none z-20 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <MousePointer className="w-3 h-3 text-indigo-500" />
            {selectedCount === 0 && <span>No element selected</span>}
            {selectedCount === 1 && selectedNode && (
              <span>
                Selected: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedNode.name}</strong> ({selectedNode.type}) — {selectedNode.width}×{selectedNode.height}px at ({selectedNode.x}, {selectedNode.y})
              </span>
            )}
            {selectedCount > 1 && <span>{selectedCount} elements selected</span>}
          </div>
        </div>

        <div className={`flex items-center gap-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>Pan: ({Math.round(canvasTransform.panX)}, {Math.round(canvasTransform.panY)})</span>
          <span>Nodes: {Object.keys(project.nodes).length}</span>
          <span className="text-indigo-500">IndexedDB Autosave Active</span>
        </div>
      </div>
    </main>
  );
};
