import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Maximize2, Minimize2, ExternalLink, Monitor, Tablet, Smartphone, 
  RotateCw, RefreshCw, ZoomIn, ZoomOut, Layers
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { runAllTranspilers } from '../../transpiler';

interface DevicePreset {
  id: string;
  name: string;
  width: number | '100%';
  height: number | '100%';
  icon: React.ComponentType<{ className?: string }>;
  category: 'responsive' | 'desktop' | 'tablet' | 'mobile';
}

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'responsive', name: 'Responsive (Full 100%)', width: '100%', height: '100%', icon: Monitor, category: 'responsive' },
  { id: 'desktop-hd', name: 'Desktop HD (1440 × 900)', width: 1440, height: 900, icon: Monitor, category: 'desktop' },
  { id: 'desktop-fhd', name: 'Desktop Full HD (1920 × 1080)', width: 1920, height: 1080, icon: Monitor, category: 'desktop' },
  { id: 'laptop', name: 'Laptop Standard (1280 × 800)', width: 1280, height: 800, icon: Monitor, category: 'desktop' },
  { id: 'ipad', name: 'iPad / Tablet (768 × 1024)', width: 768, height: 1024, icon: Tablet, category: 'tablet' },
  { id: 'ipad-pro', name: 'iPad Pro 11" (834 × 1194)', width: 834, height: 1194, icon: Tablet, category: 'tablet' },
  { id: 'iphone-15', name: 'iPhone 15 / 14 (390 × 844)', width: 390, height: 844, icon: Smartphone, category: 'mobile' },
  { id: 'iphone-max', name: 'iPhone 15 Pro Max (430 × 932)', width: 430, height: 932, icon: Smartphone, category: 'mobile' },
  { id: 'android', name: 'Android Standard (360 × 800)', width: 360, height: 800, icon: Smartphone, category: 'mobile' },
];

export const LivePreviewModal: React.FC = () => {
  const { isLivePreviewOpen, setLivePreviewOpen, project, selectedIds, theme } = useProjectStore();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('responsive');
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [isCustom, setIsCustom] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [targetFrameId, setTargetFrameId] = useState<string>('auto');

  const isDark = theme === 'dark';
  const viewportRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFitToWindow = () => {
    if (!viewportRef.current || currentPreset.width === '100%') {
      setZoomScale(1);
      return;
    }
    const vpW = viewportRef.current.clientWidth - 64;
    const vpH = viewportRef.current.clientHeight - 64;
    const targetW = typeof displayWidth === 'number' ? displayWidth : parseInt(String(displayWidth)) || 1440;
    const targetH = typeof displayHeight === 'number' ? displayHeight : parseInt(String(displayHeight)) || 900;
    const scale = Math.min(1, Math.max(0.2, Math.min(vpW / targetW, vpH / targetH)));
    setZoomScale(Number(scale.toFixed(2)));
  };

  // Auto-fit on preset change for large desktop screens
  useEffect(() => {
    if (selectedPresetId === 'desktop-fhd' || selectedPresetId === 'desktop-hd') {
      setTimeout(handleFitToWindow, 50);
    } else if (selectedPresetId === 'responsive') {
      setZoomScale(1);
    }
  }, [selectedPresetId, isLandscape]);

  // Find topmost ancestor root frame for selection
  const selectedFrameId = useMemo(() => {
    if (selectedIds.length === 0) return null;
    const findRootAncestor = (id: string): string => {
      const node = project.nodes[id];
      if (!node) return id;
      if (!node.parentId) return node.id;
      return findRootAncestor(node.parentId);
    };
    return findRootAncestor(selectedIds[0]);
  }, [selectedIds, project.nodes]);

  const rootFrames = useMemo(() => {
    return project.rootNodeIds.map(id => project.nodes[id]).filter(Boolean);
  }, [project.rootNodeIds, project.nodes]);

  const effectiveExportRootIds = useMemo(() => {
    if (targetFrameId !== 'auto' && targetFrameId !== 'all') {
      if (project.nodes[targetFrameId]) return [targetFrameId];
    }
    if (targetFrameId === 'auto') {
      if (selectedFrameId && project.nodes[selectedFrameId]) {
        return [selectedFrameId];
      }
      if (project.rootNodeIds.length > 0) {
        return [project.rootNodeIds[0]];
      }
    }
    return project.rootNodeIds;
  }, [targetFrameId, selectedFrameId, project.nodes, project.rootNodeIds]);

  const transpilerOutput = useMemo(() => {
    return runAllTranspilers(project.nodes, effectiveExportRootIds);
  }, [project.nodes, effectiveExportRootIds]);

  const htmlDocument = transpilerOutput.htmlCss.fullDocument;

  // Handle ESC key to exit fullscreen or close modal
  useEffect(() => {
    if (!isLivePreviewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setLivePreviewOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLivePreviewOpen, isFullscreen, setLivePreviewOpen]);

  if (!isLivePreviewOpen) return null;

  const currentPreset = DEVICE_PRESETS.find(p => p.id === selectedPresetId) || DEVICE_PRESETS[0];

  let displayWidth: string | number = '100%';
  let displayHeight: string | number = '100%';

  if (isCustom) {
    displayWidth = `${customWidth}px`;
    displayHeight = `${customHeight}px`;
  } else if (currentPreset.width !== '100%') {
    const rawW = Number(currentPreset.width);
    const rawH = Number(currentPreset.height);
    if (isLandscape && (currentPreset.category === 'tablet' || currentPreset.category === 'mobile')) {
      displayWidth = `${rawH}px`;
      displayHeight = `${rawW}px`;
    } else {
      displayWidth = `${rawW}px`;
      displayHeight = `${rawH}px`;
    }
  }

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const isFrameConstrained = !isCustom && currentPreset.width !== '100%';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col select-none ${
      isFullscreen ? 'bg-slate-950 p-0' : 'bg-slate-950/85 backdrop-blur-md p-3 md:p-6'
    }`}>
      {/* Container Box */}
      <div className={`flex flex-col w-full h-full overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'rounded-0 border-0' : 'bg-slate-900 border border-slate-800 rounded-xl shadow-2xl'
      }`}>
        {/* Top Control Bar (Hidden when in true Fullscreen mode) */}
        {!isFullscreen && (
          <header className={`h-14 px-4 flex items-center justify-between border-b shrink-0 gap-3 overflow-x-auto ${
            isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            {/* Left: Live Preview Badge, Target Frame, & Device Preset Selector */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-indigo-400 font-semibold text-xs shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Preview</span>
                <span className="text-[10px] text-slate-400 font-normal border-l border-indigo-500/30 pl-2">HTML + CSS</span>
              </div>

              {/* Render Target Frame Selector */}
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Target Frame:</span>
                <select
                  value={targetFrameId}
                  onChange={(e) => setTargetFrameId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition max-w-[170px] truncate font-medium"
                >
                  <option value="auto">
                    {selectedFrameId && project.nodes[selectedFrameId] 
                      ? `Selected: ${project.nodes[selectedFrameId].name}`
                      : 'Primary Frame'}
                  </option>
                  <optgroup label="Pilih Frame Tertentu">
                    {rootFrames.map(rf => (
                      <option key={rf.id} value={rf.id}>
                        {rf.name} ({rf.width}×{rf.height})
                      </option>
                    ))}
                  </optgroup>
                  <option value="all">Semua Frame Canvas</option>
                </select>
              </div>

              <div className="h-4 w-px bg-slate-800 my-auto" />

              {/* Ukuran Device Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Ukuran Device:</span>
                <select
                  value={isCustom ? 'custom' : selectedPresetId}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustom(true);
                    } else {
                      setIsCustom(false);
                      setSelectedPresetId(e.target.value);
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition"
                >
                  <optgroup label="Standar Viewport">
                    <option value="responsive">Responsive (Full 100%)</option>
                  </optgroup>
                  <optgroup label="Desktop / Laptop">
                    <option value="desktop-hd">Desktop HD (1440 × 900)</option>
                    <option value="desktop-fhd">Desktop Full HD (1920 × 1080)</option>
                    <option value="laptop">Laptop Standard (1280 × 800)</option>
                  </optgroup>
                  <optgroup label="Tablet">
                    <option value="ipad">iPad / Tablet (768 × 1024)</option>
                    <option value="ipad-pro">iPad Pro 11" (834 × 1194)</option>
                  </optgroup>
                  <optgroup label="Mobile">
                    <option value="iphone-15">iPhone 14 / 15 (390 × 844)</option>
                    <option value="iphone-max">iPhone 15 Pro Max (430 × 932)</option>
                    <option value="android">Android Standard (360 × 800)</option>
                  </optgroup>
                  <optgroup label="Custom">
                    <option value="custom">Ukuran Kustom (W × H px)</option>
                  </optgroup>
                </select>

                {/* Rotate Landscape/Portrait toggle for mobile/tablet */}
                {(currentPreset.category === 'tablet' || currentPreset.category === 'mobile') && !isCustom && (
                  <button
                    onClick={() => setIsLandscape(!isLandscape)}
                    title={`Ubah Orientasi ke ${isLandscape ? 'Portrait' : 'Landscape'}`}
                    className={`p-1.5 rounded-lg border transition flex items-center gap-1 text-xs ${
                      isLandscape
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{isLandscape ? 'Landscape' : 'Portrait'}</span>
                  </button>
                )}

                {/* Custom Width & Height Inputs */}
                {isCustom && (
                  <div className="flex items-center gap-1 ml-1 text-xs">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(200, Number(e.target.value)))}
                      className="w-16 bg-slate-800 border border-slate-700 text-white text-xs px-1.5 py-1 rounded outline-none text-center font-mono"
                      title="Width (px)"
                    />
                    <span className="text-slate-500">×</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Math.max(200, Number(e.target.value)))}
                      className="w-16 bg-slate-800 border border-slate-700 text-white text-xs px-1.5 py-1 rounded outline-none text-center font-mono"
                      title="Height (px)"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls: Zoom, Open in New Tab, Fullscreen, Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Refresh iframe button */}
              <button
                onClick={() => setIframeKey(k => k + 1)}
                title="Reload Preview"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Scale Controls */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-1.5 py-1 text-xs">
                <button
                  onClick={() => setZoomScale(s => Math.max(0.2, Number((s - 0.1).toFixed(2))))}
                  title="Zoom Out Preview"
                  className="p-0.5 hover:text-white text-slate-400 transition"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-indigo-400 min-w-10 text-center font-medium">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale(s => Math.min(2, Number((s + 0.1).toFixed(2))))}
                  title="Zoom In Preview"
                  className="p-0.5 hover:text-white text-slate-400 transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFitToWindow}
                  title="Fit to Window"
                  className="text-[10px] bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white px-1.5 py-0.5 rounded font-medium ml-1 transition"
                >
                  Fit
                </button>
                {zoomScale !== 1 && (
                  <button
                    onClick={() => setZoomScale(1)}
                    className="text-[10px] text-slate-400 hover:text-white underline ml-0.5"
                  >
                    100%
                  </button>
                )}
              </div>

              {/* Open in New Browser Tab */}
              <button
                onClick={handleOpenNewTab}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition shadow-sm"
                title="Buka di Tab Baru Browser"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">New Tab</span>
              </button>

              {/* Full Screen Mode Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
                title="Full Screen Preview Tanpa Tombol"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              {/* Close Modal Button */}
              <button
                onClick={() => setLivePreviewOpen(false)}
                title="Tutup Preview"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>
        )}

        {/* Viewport Canvas Body Area */}
        <div ref={viewportRef} className="relative flex-1 w-full h-full overflow-auto bg-slate-950 flex items-center justify-center p-4">
          {/* Grid pattern background in modal viewport */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Floating Close Button in Fullscreen Mode */}
          {isFullscreen && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-medium shadow-2xl backdrop-blur-md transition-all group"
                title="Keluar Full Screen (ESC)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Exit Fullscreen</span>
                <kbd className="bg-slate-800 text-slate-400 text-[10px] px-1 rounded font-mono">ESC</kbd>
              </button>
              <button
                onClick={() => setLivePreviewOpen(false)}
                className="p-1.5 rounded-full bg-slate-900/90 hover:bg-red-600/80 border border-slate-700/80 text-slate-300 hover:text-white shadow-2xl backdrop-blur-md transition-all"
                title="Tutup Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Render Iframe Frame Container with Responsive Scaling & Scrolling */}
          <div
            style={{
              width: displayWidth,
              height: displayHeight,
              transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
              transformOrigin: 'center center',
            }}
            className={`transition-all duration-300 relative flex flex-col ${
              isFrameConstrained
                ? 'rounded-2xl border-4 border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-900'
                : 'w-full h-full rounded-none border-0'
            }`}
          >
            {/* Device top notch indicator when in mobile preset */}
            {isFrameConstrained && currentPreset.category === 'mobile' && !isLandscape && (
              <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0 border-b border-slate-800/60 select-none">
                <div className="w-16 h-3 bg-slate-950 rounded-full" />
              </div>
            )}

            {/* The actual HTML/CSS rendered iframe */}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={htmlDocument}
              title="Live HTML CSS Canvas Render Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full flex-1 border-0 bg-slate-950"
              style={{
                display: 'block',
              }}
            />

            {/* Dimensions badge indicator */}
            {isFrameConstrained && (
              <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded shadow pointer-events-none select-none backdrop-blur-sm">
                {displayWidth} × {displayHeight}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
