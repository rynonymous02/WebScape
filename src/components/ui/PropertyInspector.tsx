import React, { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { 
  Sliders, Layout, Palette, Type as TypeIcon, Box, AlignLeft, AlignCenter, AlignRight,
  ArrowRight, ArrowDown, ArrowUpToLine, ArrowDownToLine, ArrowUp, Move, Image as ImageIcon,
  Upload, Layers, Sparkles, Monitor, Tablet, Smartphone, ChevronDown, ChevronRight,
  ChevronLeft, PanelRightClose, Wand2, Zap, Shield, RefreshCw, Globe, HardDrive
} from 'lucide-react';
import type { PositionMode, FrameRole } from '../../types/canvas';
import { POPULAR_FONTS, loadWebFont, extractCleanFontName } from '../../utils/fontLoader';

const PRESET_BACKGROUND_IMAGES = [
  { label: 'Dark Violet Gradient', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Neon Cyber Grid', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Minimal Dark Mountains', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80' },
];

const DEVICE_SIZE_PRESETS = [
  { label: 'Desktop HD (1440 × 900)', width: 1440, height: 900 },
  { label: 'Desktop Full HD (1920 × 1080)', width: 1920, height: 1080 },
  { label: 'Laptop Standard (1280 × 800)', width: 1280, height: 800 },
  { label: 'MacBook Pro 16" (1728 × 1117)', width: 1728, height: 1117 },
  { label: 'iPad / Tablet (768 × 1024)', width: 768, height: 1024 },
  { label: 'iPad Pro 11" (834 × 1194)', width: 834, height: 1194 },
  { label: 'iPad Pro 12.9" (1024 × 1366)', width: 1024, height: 1366 },
  { label: 'iPhone 14 / 15 (390 × 844)', width: 390, height: 844 },
  { label: 'iPhone 15 Pro Max (430 × 932)', width: 430, height: 932 },
  { label: 'iPhone SE / X (375 × 812)', width: 375, height: 812 },
  { label: 'Android Standard (360 × 800)', width: 360, height: 800 },
  { label: 'Android Large (412 × 915)', width: 412, height: 915 },
];

const GRADIENT_PRESETS = [
  { label: 'Dark Cyber', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311b92 100%)' },
  { label: 'Neon Sunset', value: 'linear-gradient(135deg, #4c1d95 0%, #c026d3 50%, #f43f5e 100%)' },
  { label: 'Oceanic Teal', value: 'linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #0284c7 100%)' },
  { label: 'Midnight Slate', value: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' },
  { label: 'Emerald Glow', value: 'linear-gradient(135deg, #022c22 0%, #059669 50%, #34d399 100%)' },
  { label: 'Royal Amber', value: 'linear-gradient(135deg, #451a03 0%, #d97706 50%, #fbbf24 100%)' },
];

const MESH_GRADIENT_PRESETS = [
  { 
    label: 'Aurora Glow', 
    value: 'radial-gradient(at 0% 0%, #4c1d95 0px, transparent 50%), radial-gradient(at 100% 0%, #0284c7 0px, transparent 50%), radial-gradient(at 100% 100%, #c026d3 0px, transparent 50%), radial-gradient(at 0% 100%, #059669 0px, transparent 50%) #0f172a' 
  },
  { 
    label: 'Cyberpunk Neon', 
    value: 'radial-gradient(at 15% 15%, #c026d3 0px, transparent 45%), radial-gradient(at 85% 20%, #3b82f6 0px, transparent 50%), radial-gradient(at 50% 80%, #f43f5e 0px, transparent 50%) #090d16' 
  },
  { 
    label: 'Vibrant Sunset', 
    value: 'radial-gradient(at 20% 20%, #f97316 0px, transparent 50%), radial-gradient(at 80% 30%, #e11d48 0px, transparent 50%), radial-gradient(at 40% 90%, #9333ea 0px, transparent 50%) #111827' 
  },
  { 
    label: 'Deep Space Mesh', 
    value: 'radial-gradient(at 90% 10%, #6366f1 0px, transparent 50%), radial-gradient(at 10% 90%, #a855f7 0px, transparent 50%), radial-gradient(at 50% 50%, #06b6d4 0px, transparent 50%) #030712' 
  },
];

const BLEND_MODES = [
  { label: 'Normal', value: 'normal' },
  { label: 'Multiply (Gelap)', value: 'multiply' },
  { label: 'Screen (Terang)', value: 'screen' },
  { label: 'Overlay (Kontras)', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Difference', value: 'difference' },
  { label: 'Exclusion', value: 'exclusion' },
  { label: 'Hue', value: 'hue' },
  { label: 'Saturation', value: 'saturation' },
  { label: 'Color', value: 'color' },
  { label: 'Luminosity', value: 'luminosity' },
];

interface AnglePickerWheelProps {
  angle: number;
  onChange: (newAngle: number) => void;
  size?: number;
  label?: string;
  isDark?: boolean;
}

export const AnglePickerWheel: React.FC<AnglePickerWheelProps> = ({
  angle,
  onChange,
  size = 56,
  label = 'Sudut Rotasi',
  isDark = true,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI + 90);
    if (deg < 0) deg += 360;
    if (deg === 360) deg = 0;
    onChange(deg);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    calculateAngleFromPointer(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerMove = (e: PointerEvent) => {
      calculateAngleFromPointer(e.clientX, e.clientY);
    };
    const handlePointerUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const rad = ((angle - 90) * Math.PI) / 180;
  const radiusOffset = size / 2 - 8;
  const dotX = size / 2 + radiusOffset * Math.cos(rad);
  const dotY = size / 2 + radiusOffset * Math.sin(rad);

  return (
    <div className="flex flex-col items-center justify-center gap-1 select-none">
      {label && <span className="text-[10px] text-slate-400 font-medium">{label}</span>}
      <div
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        style={{ width: size, height: size }}
        className={`relative rounded-full border cursor-grab active:cursor-grabbing shadow-sm transition-colors ${
          isDark 
            ? 'bg-slate-800/90 border-slate-700 hover:border-indigo-500' 
            : 'bg-slate-100 border-slate-300 hover:border-indigo-500'
        }`}
        title={`Geser untuk memutar sudut (${angle}°)`}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
        </div>
        <svg className="w-full h-full pointer-events-none">
          <line
            x1={size / 2}
            y1={size / 2}
            x2={dotX}
            y2={dotY}
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>
        <div
          className="absolute w-3.5 h-3.5 bg-slate-900 rounded-full shadow-md border-2 border-white pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${dotX}px`,
            top: `${dotY}px`,
          }}
        />
      </div>
    </div>
  );
};

export const PropertyInspector: React.FC = () => {
  const { 
    selectedIds, 
    project, 
    updateNodeGeometry, 
    updateNodeStyle, 
    updateNode,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    showInspector,
    toggleInspector,
    theme,
  } = useProjectStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const isDark = theme === 'dark';

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSectionHeader = (
    key: string,
    title: string,
    IconComponent: any,
    iconColorClass: string = 'text-indigo-500',
    extraBadge?: React.ReactNode
  ) => {
    const isExpanded = !!expandedSections[key];
    return (
      <button
        type="button"
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between font-semibold text-slate-400 uppercase text-[10px] tracking-wider py-1 hover:text-slate-200 transition select-none group"
      >
        <div className="flex items-center gap-1.5">
          <IconComponent className={`w-3.5 h-3.5 ${iconColorClass}`} />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {extraBadge}
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform" />
          )}
        </div>
      </button>
    );
  };

  const selectedNode = selectedIds.length === 1 ? project.nodes[selectedIds[0]] : null;
  const [activeEffectTab, setActiveEffectTab] = useState<'glass' | 'shadow' | 'glow' | 'neo'>('glass');
  const style = selectedNode?.style || ({} as any);
  const posMode = style.position || (selectedNode?.parentId ? 'static' : 'relative');
  const isStatic = Boolean(selectedNode?.parentId && posMode === 'static');

  const handlePositionModeChange = (newMode: PositionMode) => {
    if (!selectedNode) return;
    updateNodeStyle(selectedNode.id, { position: newMode });
    if (newMode === 'static' || newMode === 'sticky') {
      updateNodeGeometry(selectedNode.id, 0, 0, selectedNode.width, selectedNode.height);
      if (newMode === 'sticky' && (!style.zIndex || style.zIndex <= 1)) {
        updateNodeStyle(selectedNode.id, { zIndex: 50 });
      }
    }
  };

  const hexToRgba = (hex: string, alpha: number) => {
    let clean = (hex || '#000000').replace('#', '');
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    if (clean.length !== 6) return hex;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const applyGradientUpdates = (updates: Partial<typeof style>) => {
    if (!selectedNode) return;
    const nextStyle = { ...style, ...updates };
    const gType = nextStyle.gradientType || 'linear';
    const angle = nextStyle.gradientAngle ?? 135;
    const pos = nextStyle.gradientPosition || 'center';
    const c1 = nextStyle.gradientColor1 || '#6366f1';
    const c2 = nextStyle.gradientColor2 || '#a855f7';
    const opacity = nextStyle.gradientOpacity ?? 1;

    const rgba1 = hexToRgba(c1, opacity);
    const rgba2 = hexToRgba(c2, opacity);

    let gradientStr = '';
    if (gType === 'radial') {
      gradientStr = `radial-gradient(at ${pos}, ${rgba1} 0%, ${rgba2} 100%)`;
    } else {
      gradientStr = `linear-gradient(${angle}deg, ${rgba1} 0%, ${rgba2} 100%)`;
    }

    updateNodeStyle(selectedNode.id, {
      ...updates,
      gradientFill: gradientStr,
    });
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          updateNodeStyle(selectedNode.id, { 
            backgroundImage: result,
            backgroundSize: style.backgroundSize || 'cover',
            backgroundPosition: style.backgroundPosition || 'center',
            backgroundRepeat: style.backgroundRepeat || 'no-repeat',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = `w-full border rounded px-2 py-1 outline-none font-mono text-xs ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
  }`;

  const selectClass = `w-full border rounded px-2 py-1 outline-none text-xs ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
  }`;

  const renderPanelContent = () => {
    if (selectedIds.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center select-none relative h-full">
          <button
            onClick={toggleInspector}
            title="Sembunyikan Panel"
            className={`absolute top-2.5 right-2.5 p-1 rounded transition ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
          <Sliders className="w-8 h-8 mb-2 animate-pulse text-indigo-500" />
          <p className="text-xs font-medium text-slate-500">Pilih elemen pada kanvas atau layer tree untuk mengedit properti</p>
        </div>
      );
    }

    if (!selectedNode) {
      return (
        <div className="p-4 text-xs select-none relative">
          <div className="flex items-center justify-between mb-2">
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedIds.length} Elemen Terpilih</p>
            <button
              onClick={toggleInspector}
              title="Sembunyikan Panel"
              className={`p-1 rounded transition ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-500">Multi-selection properties editing aktif.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {/* Inspector Header */}
        <div className={`h-10 border-b px-3 flex items-center justify-between font-semibold shrink-0 sticky top-0 z-10 ${
          isDark ? 'border-slate-800 text-white bg-slate-900/90 backdrop-blur' : 'border-slate-200 text-slate-900 bg-slate-50/90 backdrop-blur'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <Box className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{selectedNode.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
            }`}>
              {selectedNode.type === 'frame' ? (selectedNode.frameRole || 'frame') : selectedNode.type}
            </span>
            <button
              onClick={toggleInspector}
              title="Sembunyikan Panel Properti (Hide Inspector)"
              className={`p-1 rounded transition ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              }`}
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-4">
        {/* FRAME SEMANTIC ROLE (WRAPPER / SECTION / CONTAINER) */}
        {selectedNode.type === 'frame' && (
          <section className={`flex flex-col gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {renderSectionHeader('role', 'Opsi Peran Frame', Layers, 'text-indigo-500')}

            {expandedSections['role'] && (
              <div className="flex flex-col gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Tipe / Peran Elemen</label>
                  <select
                    value={selectedNode.frameRole || (selectedNode.parentId ? 'container' : 'wrapper')}
                    onChange={(e) => updateNode(selectedNode.id, { frameRole: e.target.value as FrameRole })}
                    className={selectClass}
                  >
                    <option value="wrapper">Wrapper Utama / Page Wrapper (&lt;main&gt; / &lt;div&gt;)</option>
                    <option value="section">Section Konten (&lt;section&gt;)</option>
                    <option value="container">Container Biasa / Card Box (&lt;div&gt;)</option>
                  </select>
                </div>

                {/* PRESET BEHAVIOR / SIZING */}
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Preset Sizing / Behavior</label>
                  <select
                    value={style.sizingPreset || 'custom'}
                    onChange={(e) => {
                      const preset = e.target.value as any;
                      if (preset === 'hero') {
                        updateNodeStyle(selectedNode.id, {
                          sizingPreset: 'hero',
                          widthUnit: '%',
                          heightUnit: 'min-vh',
                          customWidthVal: 100,
                          customHeightVal: 100,
                        });
                        updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, selectedNode.width, Math.max(selectedNode.height, 650));
                      } else if (preset === 'banner') {
                        updateNodeStyle(selectedNode.id, {
                          sizingPreset: 'banner',
                          widthUnit: '%',
                          heightUnit: 'auto',
                          customWidthVal: 100,
                        });
                      } else if (preset === 'contained') {
                        updateNodeStyle(selectedNode.id, {
                          sizingPreset: 'contained',
                          widthUnit: '%',
                          maxWidth: 1200,
                        });
                      } else if (preset === 'fit-content') {
                        updateNodeStyle(selectedNode.id, {
                          sizingPreset: 'fit-content',
                          widthUnit: 'auto',
                        });
                      } else {
                        updateNodeStyle(selectedNode.id, {
                          sizingPreset: 'custom',
                          widthUnit: 'px',
                          heightUnit: 'px',
                        });
                      }
                    }}
                    className={selectClass}
                  >
                    <option value="custom">Default (Fixed / Custom)</option>
                    <option value="hero">Full Screen Hero (100% × 100vh)</option>
                    <option value="banner">Full Width Banner (100% × Auto)</option>
                    <option value="contained">Contained Section (100% Max-Width)</option>
                    <option value="fit-content">Fit Content (Otomatis Isi)</option>
                  </select>
                </div>

                {/* DEVICE SIZE TEMPLATES FOR WRAPPER UTAMA */}
                {(selectedNode.frameRole === 'wrapper' || (!selectedNode.frameRole && !selectedNode.parentId)) && (
                  <div className={`mt-2 pt-2 border-t flex flex-col gap-1.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <label className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Monitor className="w-3 h-3 text-indigo-400" />
                        Template Ukuran Device / Viewport
                      </span>
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const found = DEVICE_SIZE_PRESETS.find(p => `${p.width}x${p.height}` === e.target.value);
                        if (found) {
                          updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, found.width, found.height);
                        }
                      }}
                      className={selectClass}
                    >
                      <option value="" disabled>-- Pilih Ukuran Template Device --</option>
                      {DEVICE_SIZE_PRESETS.map((p, idx) => (
                        <option key={idx} value={`${p.width}x${p.height}`}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        onClick={() => updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, 1440, 900)}
                        className={`text-[9px] py-1 rounded transition flex items-center justify-center gap-1 ${
                          isDark ? 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white'
                        }`}
                        title="Desktop 1440 × 900"
                      >
                        <Monitor className="w-2.5 h-2.5" /> Desktop
                      </button>
                      <button
                        onClick={() => updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, 768, 1024)}
                        className={`text-[9px] py-1 rounded transition flex items-center justify-center gap-1 ${
                          isDark ? 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white'
                        }`}
                        title="Tablet 768 × 1024"
                      >
                        <Tablet className="w-2.5 h-2.5" /> Tablet
                      </button>
                      <button
                        onClick={() => updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, 390, 844)}
                        className={`text-[9px] py-1 rounded transition flex items-center justify-center gap-1 ${
                          isDark ? 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white'
                        }`}
                        title="iPhone 390 × 844"
                      >
                        <Smartphone className="w-2.5 h-2.5 text-sky-400" /> iPhone
                      </button>
                      <button
                        onClick={() => updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, 360, 800)}
                        className={`text-[9px] py-1 rounded transition flex items-center justify-center gap-1 ${
                          isDark ? 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white'
                        }`}
                        title="Android 360 × 800"
                      >
                        <Smartphone className="w-2.5 h-2.5 text-emerald-400" /> Android
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 1. POSITIONING & COORDINATE PLACEMENT */}
        <section className={`flex flex-col gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {renderSectionHeader('position', 'Position & Koordinat', Move, 'text-indigo-500', isStatic ? (
            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">
              Alur Flexbox
            </span>
          ) : null)}

          {expandedSections['position'] && (
            <div className="flex flex-col gap-2 pt-1">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Position Mode</label>
                <select
                  value={posMode}
                  onChange={(e) => handlePositionModeChange(e.target.value as PositionMode)}
                  className={selectClass}
                >
                  <option value="static">Static (Normal Flow / Otomatis Flexbox)</option>
                  <option value="relative">Relative (Normal flow + bebas geser offset)</option>
                  <option value="absolute">Absolute (Bebas di dalam wadah induk)</option>
                  <option value="fixed">Fixed (Menempel pada viewport layar)</option>
                  <option value="sticky">Sticky (Menempel saat di-scroll)</option>
                </select>
              </div>

              {/* OVERFLOW / CONTENT CLIPPING CONTROL */}
              {(selectedNode.type === 'frame' || selectedNode.type === 'rectangle' || selectedNode.type === 'ellipse') && (
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Overflow (Pemotongan Konten Luar)</label>
                  <select
                    value={style.overflow || (selectedNode.frameRole === 'wrapper' ? 'visible' : 'hidden')}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { overflow: e.target.value as any })}
                    className={selectClass}
                  >
                    <option value="hidden">Hidden (Potong konten yang keluar / offset)</option>
                    <option value="visible">Visible (Tampilkan konten yang offset / menonjol)</option>
                    <option value="auto">Auto (Scroll jika melebihi batas)</option>
                    <option value="clip">Clip (Pangkas tepi tanpa scroll)</option>
                  </select>
                </div>
              )}

              {!isStatic && (
                <div className="mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-500 font-medium">
                      {posMode === 'sticky' ? 'Sticky Threshold & Offset' : 'Position Offsets (T, R, B, L)'} (px)
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <div>
                      <input
                        type="number"
                        placeholder="Top"
                        title={posMode === 'sticky' ? 'Sticky Top (Batas Menempel Atas)' : 'Top Offset'}
                        value={style.top !== undefined ? style.top : (posMode === 'sticky' ? 0 : (posMode === 'relative' || posMode === 'absolute' || posMode === 'fixed' ? selectedNode.y : ''))}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          updateNodeStyle(selectedNode.id, { top: val });
                          if (val !== undefined && (posMode === 'relative' || posMode === 'absolute')) {
                            updateNodeGeometry(selectedNode.id, selectedNode.x, val, selectedNode.width, selectedNode.height);
                          }
                        }}
                        className={inputClass}
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-0.5">Top</span>
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Right"
                        title="Right Offset"
                        value={style.right !== undefined ? style.right : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          updateNodeStyle(selectedNode.id, { right: val });
                        }}
                        className={inputClass}
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-0.5">Right</span>
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Bottom"
                        title={posMode === 'sticky' ? 'Sticky Bottom (Batas Menempel Bawah)' : 'Bottom Offset'}
                        value={style.bottom !== undefined ? style.bottom : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          updateNodeStyle(selectedNode.id, { bottom: val });
                        }}
                        className={inputClass}
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-0.5">Bottom</span>
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="Left"
                        title="Left Offset"
                        value={style.left !== undefined ? style.left : (posMode === 'sticky' ? '' : (posMode === 'relative' || posMode === 'absolute' || posMode === 'fixed' ? selectedNode.x : ''))}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          updateNodeStyle(selectedNode.id, { left: val });
                          if (val !== undefined && (posMode === 'relative' || posMode === 'absolute')) {
                            updateNodeGeometry(selectedNode.id, val, selectedNode.y, selectedNode.width, selectedNode.height);
                          }
                        }}
                        className={inputClass}
                      />
                      <span className="text-[9px] text-slate-500 block text-center mt-0.5">Left</span>
                    </div>
                  </div>

                  {posMode === 'sticky' && (
                    <div className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-md p-2 flex items-center gap-1.5 mt-1.5">
                      <span>📌</span>
                      <span>
                        <strong>Sticky Offset</strong>: Menentukan batas jarak menempel elemen dari tepi layar saat di-scroll (misal: <code>Top: 0px</code> atau <code>Top: 30px</code>).
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* WIDTH & HEIGHT WITH RESPONSIVE UNITS */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Width (W)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      disabled={style.widthUnit === 'auto'}
                      value={style.widthUnit === '%' || style.widthUnit === 'vw' ? (style.customWidthVal ?? 100) : selectedNode.width}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (style.widthUnit === '%' || style.widthUnit === 'vw') {
                          updateNodeStyle(selectedNode.id, { customWidthVal: val });
                        } else {
                          updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, val, selectedNode.height);
                        }
                      }}
                      className={`${inputClass} flex-1 ${style.widthUnit === 'auto' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                    <select
                      value={style.widthUnit || 'px'}
                      onChange={(e) => {
                        const u = e.target.value as any;
                        updateNodeStyle(selectedNode.id, {
                          widthUnit: u,
                          customWidthVal: u === '%' || u === 'vw' ? (style.customWidthVal ?? 100) : undefined,
                        });
                      }}
                      className={`w-16 text-xs p-1.5 rounded border font-mono outline-none text-center cursor-pointer ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="px">px</option>
                      <option value="%">%</option>
                      <option value="vw">vw</option>
                      <option value="auto">auto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Height (H)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      disabled={style.heightUnit === 'auto'}
                      value={style.heightUnit === 'vh' || style.heightUnit === 'min-vh' || style.heightUnit === '%' ? (style.customHeightVal ?? 100) : selectedNode.height}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (style.heightUnit === 'vh' || style.heightUnit === 'min-vh' || style.heightUnit === '%') {
                          updateNodeStyle(selectedNode.id, { customHeightVal: val });
                        } else {
                          updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, selectedNode.width, val);
                        }
                      }}
                      className={`${inputClass} flex-1 ${style.heightUnit === 'auto' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                    <select
                      value={style.heightUnit || 'px'}
                      onChange={(e) => {
                        const u = e.target.value as any;
                        updateNodeStyle(selectedNode.id, {
                          heightUnit: u,
                          customHeightVal: u === 'vh' || u === 'min-vh' || u === '%' ? (style.customHeightVal ?? 100) : undefined,
                        });
                      }}
                      className={`w-16 text-xs p-1.5 rounded border font-mono outline-none text-center cursor-pointer ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="px">px</option>
                      <option value="vh">vh</option>
                      <option value="min-vh">min-vh</option>
                      <option value="%">%</option>
                      <option value="auto">auto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* QUICK RESPONSIVE SIZING PRESETS */}
              <div className="grid grid-cols-3 gap-1 mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    updateNodeStyle(selectedNode.id, {
                      widthUnit: '%',
                      customWidthVal: 100,
                    });
                  }}
                  className={`text-[9px] py-1 px-1 rounded border text-center transition flex items-center justify-center gap-1 ${
                    style.widthUnit === '%' && style.customWidthVal === 100
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Fit Width 100% Penuh Kontainer"
                >
                  <span>↔</span> Fit Width
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateNodeStyle(selectedNode.id, {
                      heightUnit: 'min-vh',
                      customHeightVal: 100,
                    });
                    updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, selectedNode.width, Math.max(selectedNode.height, 650));
                  }}
                  className={`text-[9px] py-1 px-1 rounded border text-center transition flex items-center justify-center gap-1 ${
                    (style.heightUnit === 'min-vh' || style.heightUnit === 'vh') && style.customHeightVal === 100
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Full Screen Hero 100vh"
                >
                  <span>↕</span> 100vh Hero
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateNodeStyle(selectedNode.id, {
                      sizingPreset: 'hero',
                      widthUnit: '%',
                      heightUnit: 'min-vh',
                      customWidthVal: 100,
                      customHeightVal: 100,
                    });
                    updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, selectedNode.width, Math.max(selectedNode.height, 650));
                  }}
                  className={`text-[9px] py-1 px-1 rounded border text-center transition flex items-center justify-center gap-1 ${
                    style.sizingPreset === 'hero' || (style.widthUnit === '%' && style.heightUnit === 'min-vh')
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Full Screen Hero (100% × 100vh)"
                >
                  <span>⤢</span> Full Hero
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Z-Index</label>
                  <input
                    type="number"
                    value={style.zIndex || 1}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { zIndex: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Rotation (°)</label>
                  <input
                    type="number"
                    value={selectedNode.rotation}
                    onChange={(e) => updateNodeGeometry(selectedNode.id, selectedNode.x, selectedNode.y, selectedNode.width, selectedNode.height, Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Quick Z-Index Layer Stacking Buttons */}
              <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <label className="text-[10px] text-slate-500 block mb-1">Layer Stacking Order</label>
                <div className={`flex items-center gap-1 p-1 rounded border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    onClick={() => bringToFront(selectedNode.id)}
                    title="Bring to Front (Paling Depan)"
                    className="flex-1 py-1 rounded hover:bg-indigo-600 hover:text-white transition flex justify-center items-center"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveUp(selectedNode.id)}
                    title="Bring Forward (1 Step Up)"
                    className="flex-1 py-1 rounded hover:bg-indigo-600 hover:text-white transition flex justify-center items-center"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(selectedNode.id)}
                    title="Send Backward (1 Step Down)"
                    className="flex-1 py-1 rounded hover:bg-indigo-600 hover:text-white transition flex justify-center items-center"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => sendToBack(selectedNode.id)}
                    title="Send to Back (Paling Belakang)"
                    className="flex-1 py-1 rounded hover:bg-indigo-600 hover:text-white transition flex justify-center items-center"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. BACKGROUND & VISUAL MEDIA (SOLID, GRADIENT, MESH, IMAGE, OPACITY, OVERLAY) */}
        {(selectedNode.type === 'frame' || selectedNode.type === 'rectangle') && (
          <section className={`flex flex-col gap-2.5 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {renderSectionHeader('background', 'Background & Media', ImageIcon, 'text-sky-400', selectedNode.frameRole === 'section' ? (
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono border border-indigo-500/20">
                Section Active
              </span>
            ) : null)}

            {expandedSections['background'] && (
              <div className="flex flex-col gap-2.5 pt-1">
                {/* Mode Background Switcher */}
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Tipe Background</label>
                  <div className={`grid grid-cols-4 gap-1 p-1 rounded border text-[10px] font-medium ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {(['solid', 'gradient', 'mesh', 'image'] as const).map((mode) => {
                      const currentMode = style.backgroundType || (style.backgroundImage ? 'image' : 'solid');
                      const active = currentMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => updateNodeStyle(selectedNode.id, { backgroundType: mode })}
                          className={`py-1 rounded capitalize transition text-center ${
                            active
                              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GRADIENT MODE CONTROLS (TYPE, ANGLE, POSITION, COLORS, OPACITY) */}
                {(style.backgroundType === 'gradient') && (
                  <div className="flex flex-col gap-2.5">
                    {/* Type: Linear vs Radial */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Tipe Gradient</label>
                        <select
                          value={style.gradientType || 'linear'}
                          onChange={(e) => applyGradientUpdates({ gradientType: e.target.value as any })}
                          className={selectClass}
                        >
                          <option value="linear">Linear Gradient</option>
                          <option value="radial">Radial Gradient</option>
                        </select>
                      </div>

                      {(style.gradientType || 'linear') === 'linear' ? (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Angle / Sudut (°)</label>
                          <input
                            type="number"
                            min="0"
                            max="360"
                            value={style.gradientAngle ?? 135}
                            onChange={(e) => applyGradientUpdates({ gradientAngle: Number(e.target.value) })}
                            className={inputClass}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Posisi Center</label>
                          <select
                            value={style.gradientPosition || 'center'}
                            onChange={(e) => applyGradientUpdates({ gradientPosition: e.target.value as any })}
                            className={selectClass}
                          >
                            <option value="center">Center</option>
                            <option value="top left">Top Left</option>
                            <option value="top right">Top Right</option>
                            <option value="bottom left">Bottom Left</option>
                            <option value="bottom right">Bottom Right</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Angle Slider & Quick Angle Presets for Linear Gradient */}
                    {(style.gradientType || 'linear') === 'linear' && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-500">Rotate Angle</label>
                          <span className="text-[10px] font-mono text-indigo-400">{style.gradientAngle ?? 135}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={style.gradientAngle ?? 135}
                          onChange={(e) => applyGradientUpdates({ gradientAngle: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="grid grid-cols-6 gap-1 mt-0.5">
                          {[0, 45, 90, 135, 180, 270].map((ang) => (
                            <button
                              key={ang}
                              onClick={() => applyGradientUpdates({ gradientAngle: ang })}
                              className={`text-[9px] py-0.5 rounded border text-center transition ${
                                (style.gradientAngle ?? 135) === ang
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {ang}°
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Stop 1 & Color Stop 2 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Warna Awal (Color 1)</label>
                        <div className={`flex items-center gap-1.5 border rounded p-1 ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                        }`}>
                          <input
                            type="color"
                            value={style.gradientColor1 || '#6366f1'}
                            onChange={(e) => applyGradientUpdates({ gradientColor1: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={style.gradientColor1 || '#6366f1'}
                            onChange={(e) => applyGradientUpdates({ gradientColor1: e.target.value })}
                            className="w-full bg-transparent font-mono outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Warna Akhir (Color 2)</label>
                        <div className={`flex items-center gap-1.5 border rounded p-1 ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                        }`}>
                          <input
                            type="color"
                            value={style.gradientColor2 || '#a855f7'}
                            onChange={(e) => applyGradientUpdates({ gradientColor2: e.target.value })}
                            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={style.gradientColor2 || '#a855f7'}
                            onChange={(e) => applyGradientUpdates({ gradientColor2: e.target.value })}
                            className="w-full bg-transparent font-mono outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Opacity Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] text-slate-500">Gradient Opacity / Transparansi Warna</label>
                        <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.gradientOpacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={style.gradientOpacity ?? 1}
                        onChange={(e) => applyGradientUpdates({ gradientOpacity: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Preset Gradients */}
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[9px] text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Preset Gradient Theme
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {GRADIENT_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateNodeStyle(selectedNode.id, { gradientFill: preset.value })}
                            className={`text-[10px] p-1.5 rounded border flex items-center gap-1.5 transition text-left ${
                              style.gradientFill === preset.value
                                ? 'border-indigo-500 ring-1 ring-indigo-500'
                                : isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <div className="w-4 h-4 rounded shrink-0 shadow-sm" style={{ background: preset.value }} />
                            <span className="truncate text-[10px]">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* MESH GRADIENT MODE PRESETS */}
                {(style.backgroundType === 'mesh') && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      Modern Mesh Gradient Presets
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {MESH_GRADIENT_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => updateNodeStyle(selectedNode.id, { meshGradient: preset.value })}
                          className={`text-[10px] p-2 rounded border flex flex-col gap-1 transition ${
                            style.meshGradient === preset.value
                              ? 'border-indigo-500 ring-1 ring-indigo-500'
                              : isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <div className="w-full h-7 rounded border border-white/10 shadow-sm" style={{ background: preset.value }} />
                          <span className="truncate text-[10px] font-medium">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* IMAGE MODE */}
                {(style.backgroundType === 'image' || (!style.backgroundType && style.backgroundImage)) && (
                  <div className="flex flex-col gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileUpload}
                    />

                    {/* Upload Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-1.5 px-3 rounded flex items-center justify-center gap-2 font-medium text-xs border transition ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Upload Gambar dari Perangkat</span>
                    </button>

                    {/* URL Input */}
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">URL Gambar</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={style.backgroundImage || ''}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundImage: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    {/* Preset Wallpapers */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Preset Wallpaper
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_BACKGROUND_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateNodeStyle(selectedNode.id, { backgroundImage: preset.url })}
                            className={`text-[10px] px-2 py-0.5 rounded border transition truncate ${
                              style.backgroundImage === preset.url
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Size & Position */}
                    {style.backgroundImage && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Image Size</label>
                          <select
                            value={style.backgroundSize || 'cover'}
                            onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundSize: e.target.value as any })}
                            className={selectClass}
                          >
                            <option value="cover">Cover (Penuh)</option>
                            <option value="contain">Contain (Muat)</option>
                            <option value="auto">Auto (Asli)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Position</label>
                          <select
                            value={style.backgroundPosition || 'center'}
                            onChange={(e) => updateNodeStyle(selectedNode.id, { backgroundPosition: e.target.value as any })}
                            className={selectClass}
                          >
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* OPACITY & GRADIENT OVERLAY CONTROLS */}
                <div className={`mt-1 pt-2 border-t flex flex-col gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  {/* Layer Opacity */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-slate-500">Layer / Elemen Opacity</label>
                      <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={style.opacity ?? 1}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { opacity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Gradient / Solid Overlay Header & Toggle */}
                  <div className={`pt-2 border-t flex flex-col gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        Pengaturan Overlay {style.overlayGradient ? 'Gradient' : 'Solid'}
                      </span>
                      {/* Mode Switch Toggle */}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-medium transition ${
                          style.overlayGradient ? 'text-indigo-400 font-semibold' : 'text-slate-400'
                        }`}>
                          {style.overlayGradient ? 'Gradient' : 'Solid'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!style.overlayGradient}
                          onClick={() => updateNodeStyle(selectedNode.id, { 
                            overlayGradient: !style.overlayGradient,
                            // When turning on gradient, if start/end are 0, set useful defaults
                            ...(!style.overlayGradient && (style.overlayStartOpacity === undefined && style.overlayEndOpacity === undefined) ? {
                              overlayStartOpacity: 0,
                              overlayEndOpacity: style.overlayOpacity || 0.8
                            } : {})
                          })}
                          className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            style.overlayGradient ? 'bg-indigo-600' : 'bg-slate-600'
                          }`}
                          title={style.overlayGradient ? 'Mode Gradient aktif (Klik untuk beralih ke Solid)' : 'Mode Solid aktif (Klik untuk beralih ke Gradient)'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              style.overlayGradient ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* SOLID OVERLAY CONTROLS (WHEN SWITCH IS OFF) */}
                    {!style.overlayGradient ? (
                      <div className="flex flex-col gap-2">
                        {/* Warna Tint Overlay */}
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Warna Overlay Tint</label>
                          <div className={`flex items-center gap-1.5 border rounded p-1 ${
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <input
                              type="color"
                              value={style.overlayColor || '#000000'}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <input
                              type="text"
                              value={style.overlayColor || '#000000'}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                              className="w-full bg-transparent font-mono outline-none text-xs"
                            />
                          </div>
                        </div>

                        {/* Visual Solid Preview Bar */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500">Visual Solid Alpha Bar</label>
                          <div
                            className="w-full h-4 rounded border border-white/20 shadow-inner relative overflow-hidden flex items-center justify-center"
                            style={{
                              backgroundColor: style.overlayColor || '#000000',
                              opacity: style.overlayOpacity ?? 0,
                            }}
                          />
                        </div>

                        {/* Solid Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] text-slate-500">Overlay Opacity (Solid)</label>
                            <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.overlayOpacity ?? 0) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={style.overlayOpacity ?? 0}
                            onChange={(e) => updateNodeStyle(selectedNode.id, { overlayOpacity: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>

                        {/* Quick Opacity Presets */}
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label: '0% Clear', val: 0 },
                            { label: '30% Light', val: 0.3 },
                            { label: '60% Med', val: 0.6 },
                            { label: '90% Dark', val: 0.9 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => updateNodeStyle(selectedNode.id, { overlayOpacity: preset.val })}
                              className={`text-[9px] py-1 rounded border text-center transition ${
                                Math.abs((style.overlayOpacity ?? 0) - preset.val) < 0.01
                                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 font-semibold'
                                  : isDark
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* GRADIENT OVERLAY CONTROLS (WHEN SWITCH IS ON) */
                      <div className="flex flex-col gap-2">
                        {/* Quick Fade Presets */}
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => updateNodeStyle(selectedNode.id, { overlayAngle: 90, overlayStartOpacity: 0, overlayEndOpacity: 0.95, overlayStartPos: 0, overlayEndPos: 100 })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            Fade Kanan →
                          </button>
                          <button
                            onClick={() => updateNodeStyle(selectedNode.id, { overlayAngle: 270, overlayStartOpacity: 0, overlayEndOpacity: 0.95, overlayStartPos: 0, overlayEndPos: 100 })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            ← Fade Kiri
                          </button>
                          <button
                            onClick={() => updateNodeStyle(selectedNode.id, { overlayAngle: 180, overlayStartOpacity: 0, overlayEndOpacity: 0.95, overlayStartPos: 0, overlayEndPos: 100 })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            Fade Bawah ↓
                          </button>
                        </div>

                        {/* Warna Tint Overlay, Angle Input & Circular Angle Dial Wheel */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-7 flex flex-col gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Warna Overlay Tint</label>
                              <div className={`flex items-center gap-1.5 border rounded p-1 ${
                                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                              }`}>
                                <input
                                  type="color"
                                  value={style.overlayColor || '#000000'}
                                  onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <input
                                  type="text"
                                  value={style.overlayColor || '#000000'}
                                  onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                                  className="w-full bg-transparent font-mono outline-none text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Arah Overlay Angle (°)</label>
                              <input
                                type="number"
                                min="0"
                                max="360"
                                value={style.overlayAngle ?? 90}
                                onChange={(e) => updateNodeStyle(selectedNode.id, { overlayAngle: Number(e.target.value) })}
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="col-span-5 flex justify-center pt-2">
                            <AnglePickerWheel
                              angle={style.overlayAngle ?? 90}
                              onChange={(newAngle) => updateNodeStyle(selectedNode.id, { overlayAngle: newAngle })}
                              label="Sudut Rotasi"
                              isDark={isDark}
                              size={64}
                            />
                          </div>
                        </div>

                        {/* Inkscape style Visual Gradient Bar Preview */}
                        <div className="flex flex-col gap-1 mt-1">
                          <label className="text-[10px] text-slate-500">Visual Gradient Alpha Bar</label>
                          <div
                            className="w-full h-4 rounded border border-white/20 shadow-inner relative overflow-hidden"
                            style={{
                              background: `linear-gradient(to right, transparent, rgba(255,255,255,0.2)), linear-gradient(${style.overlayAngle ?? 90}deg, ${style.overlayColor || '#000000'}${Math.round((style.overlayStartOpacity ?? 0) * 255).toString(16).padStart(2, '0')} ${style.overlayStartPos ?? 0}%, ${style.overlayColor || '#000000'}${Math.round((style.overlayEndOpacity ?? 0.8) * 255).toString(16).padStart(2, '0')} ${style.overlayEndPos ?? 100}%)`,
                            }}
                          />
                        </div>

                        {/* Titik Awal (Start Stop Opacity & Position) */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Opacity Awal (Start)</label>
                              <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.overlayStartOpacity ?? 0) * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={style.overlayStartOpacity ?? 0}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayStartOpacity: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Posisi Start Offset</label>
                              <span className="text-[10px] font-mono text-indigo-400">{style.overlayStartPos ?? 0}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={style.overlayStartPos ?? 0}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayStartPos: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Titik Akhir (End Stop Opacity & Position) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Opacity Akhir (End)</label>
                              <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.overlayEndOpacity ?? 0.8) * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={style.overlayEndOpacity ?? 0.8}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayEndOpacity: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Posisi End Offset</label>
                              <span className="text-[10px] font-mono text-indigo-400">{style.overlayEndPos ?? 100}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={style.overlayEndPos ?? 100}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayEndPos: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 2B. DYNAMIC IMAGE & VECTOR OBJECT SECTION */}
        {selectedNode.type === 'image' && (
          <section className={`flex flex-col gap-2.5 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {renderSectionHeader(
              'imageObject', 
              style.imageType === 'vector' ? 'Pengaturan Objek Vektor' : 'Pengaturan Objek Gambar', 
              style.imageType === 'vector' ? Sparkles : ImageIcon, 
              style.imageType === 'vector' ? 'text-amber-400' : 'text-pink-400', 
              (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold border ${
                  style.imageType === 'vector' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                }`}>
                  {style.imageType === 'vector' ? 'Vector SVG' : 'Pixel Image'}
                </span>
              )
            )}

            {expandedSections['imageObject'] !== false && (
              <div className="flex flex-col gap-2.5 pt-1">
                {/* ===== DYNAMIC PIXEL IMAGE CONTROLS ===== */}
                {style.imageType !== 'vector' && (
                  <div className="flex flex-col gap-2.5">
                    {/* Object Fit & Blend Mode */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Object Fit</label>
                        <select
                          value={style.objectFit || 'cover'}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { objectFit: e.target.value as any })}
                          className={selectClass}
                        >
                          <option value="cover">Cover (Penuh)</option>
                          <option value="contain">Contain (Muat)</option>
                          <option value="fill">Fill (Regang)</option>
                          <option value="scale-down">Scale Down</option>
                        </select>
                      </div>

                      {/* BLEND MODE SELECTOR */}
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-medium flex items-center justify-between">
                          <span>Blend Mode</span>
                          {style.blendMode && style.blendMode !== 'normal' && (
                            <span className="text-[9px] text-pink-400 font-mono font-semibold uppercase">{style.blendMode}</span>
                          )}
                        </label>
                        <select
                          value={style.blendMode || 'normal'}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { blendMode: e.target.value })}
                          className={`${selectClass} ${style.blendMode && style.blendMode !== 'normal' ? 'border-pink-500 text-pink-300' : ''}`}
                        >
                          {BLEND_MODES.map((bm) => (
                            <option key={bm.value} value={bm.value}>
                              {bm.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Blend Mode Badges */}
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Preset Blend Mode</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: 'Normal', value: 'normal' },
                          { label: 'Multiply', value: 'multiply' },
                          { label: 'Screen', value: 'screen' },
                          { label: 'Overlay', value: 'overlay' },
                        ].map((b) => (
                          <button
                            key={b.value}
                            type="button"
                            onClick={() => updateNodeStyle(selectedNode.id, { blendMode: b.value })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              (style.blendMode || 'normal') === b.value
                                ? 'bg-pink-600/30 text-pink-300 border-pink-500 font-semibold'
                                : isDark
                                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-pink-500'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== DYNAMIC VECTOR (SVG) CONTROLS ===== */}
                {style.imageType === 'vector' && (
                  <div className="flex flex-col gap-2.5">
                    {/* CUSTOM VECTOR COLOR */}
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Custom Warna Vektor (Fill / Tint)</label>
                      <div className={`flex items-center gap-1.5 border rounded p-1 ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                      }`}>
                        <input
                          type="color"
                          value={style.vectorColor || '#6366f1'}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { vectorColor: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={style.vectorColor || '#6366f1'}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { vectorColor: e.target.value })}
                          className="w-full bg-transparent font-mono outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Vector Quick Palette */}
                    <div className="flex items-center gap-1.5">
                      {['#6366f1', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#ffffff', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateNodeStyle(selectedNode.id, { vectorColor: c })}
                          style={{ backgroundColor: c }}
                          className={`w-4 h-4 rounded-full border ${style.vectorColor === c ? 'ring-2 ring-indigo-400 scale-110' : 'border-white/20'} transition-transform`}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== OVERLAY GRADIENT & OPACITY CONTROLS ===== */}
                <div className={`pt-2 border-t flex flex-col gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  {/* Layer Opacity */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-slate-500">Elemen / Objek Opacity</label>
                      <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={style.opacity ?? 1}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { opacity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Master Enable/Disable Overlay Toggle */}
                  <div className={`pt-2 border-t flex flex-col gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        Overlay Tint (Solid / Gradient)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-medium transition ${
                          style.overlayEnabled ? 'text-indigo-400 font-semibold' : 'text-slate-400'
                        }`}>
                          {style.overlayEnabled ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!style.overlayEnabled}
                          onClick={() => {
                            const next = !style.overlayEnabled;
                            updateNodeStyle(selectedNode.id, { 
                              overlayEnabled: next,
                              ...(next && (style.overlayOpacity === undefined || style.overlayOpacity === 0) ? { overlayOpacity: 0.4 } : {})
                            });
                          }}
                          className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            style.overlayEnabled ? 'bg-indigo-600' : 'bg-slate-600'
                          }`}
                          title={style.overlayEnabled ? 'Nonaktifkan Overlay Tint' : 'Aktifkan Overlay Tint'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              style.overlayEnabled ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {!style.overlayEnabled ? (
                      <div className={`text-[10px] p-2 rounded border flex items-center gap-1.5 ${
                        isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>💡</span>
                        <span>Overlay nonaktif — Blend Mode dapat menyatu langsung (blend) dengan objek atau kanvas di bawahnya.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Sub-Switch: Solid vs Gradient */}
                        <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                          <span className="text-[10px] text-slate-400">Tipe Overlay:</span>
                          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded border border-slate-700">
                            <button
                              type="button"
                              onClick={() => updateNodeStyle(selectedNode.id, { overlayGradient: false })}
                              className={`text-[9px] px-2 py-0.5 rounded transition ${
                                !style.overlayGradient ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Solid
                            </button>
                            <button
                              type="button"
                              onClick={() => updateNodeStyle(selectedNode.id, { 
                                overlayGradient: true,
                                ...(style.overlayStartOpacity === undefined && style.overlayEndOpacity === undefined ? {
                                  overlayStartOpacity: 0,
                                  overlayEndOpacity: style.overlayOpacity || 0.8
                                } : {})
                              })}
                              className={`text-[9px] px-2 py-0.5 rounded transition ${
                                style.overlayGradient ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Gradient
                            </button>
                          </div>
                        </div>

                    {/* SOLID OVERLAY CONTROLS */}
                    {!style.overlayGradient ? (
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Warna Overlay Tint</label>
                          <div className={`flex items-center gap-1.5 border rounded p-1 ${
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <input
                              type="color"
                              value={style.overlayColor || '#000000'}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                            />
                            <input
                              type="text"
                              value={style.overlayColor || '#000000'}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                              className="w-full bg-transparent font-mono outline-none text-xs"
                            />
                          </div>
                        </div>

                        {/* Solid Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[10px] text-slate-500">Overlay Opacity (Solid)</label>
                            <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.overlayOpacity ?? 0) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={style.overlayOpacity ?? 0}
                            onChange={(e) => updateNodeStyle(selectedNode.id, { overlayOpacity: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label: '0% Clear', val: 0 },
                            { label: '30% Light', val: 0.3 },
                            { label: '60% Med', val: 0.6 },
                            { label: '90% Dark', val: 0.9 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => updateNodeStyle(selectedNode.id, { overlayOpacity: preset.val })}
                              className={`text-[9px] py-1 rounded border text-center transition ${
                                Math.abs((style.overlayOpacity ?? 0) - preset.val) < 0.01
                                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 font-semibold'
                                  : isDark
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* GRADIENT OVERLAY CONTROLS */
                      <div className="flex flex-col gap-2">
                        {/* Quick Fade Presets */}
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => updateNodeStyle(selectedNode.id, { overlayAngle: 90, overlayStartOpacity: 0, overlayEndOpacity: 0.95, overlayStartPos: 0, overlayEndPos: 100 })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            Fade Kanan →
                          </button>
                          <button
                            type="button"
                            onClick={() => updateNodeStyle(selectedNode.id, { overlayAngle: 270, overlayStartOpacity: 0, overlayEndOpacity: 0.95, overlayStartPos: 0, overlayEndPos: 100 })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            ← Fade Kiri
                          </button>
                          <button
                            type="button"
                            onClick={() => updateNodeStyle(selectedNode.id, { overlayAngle: 180, overlayStartOpacity: 0, overlayEndOpacity: 0.95, overlayStartPos: 0, overlayEndPos: 100 })}
                            className={`text-[9px] py-1 rounded border text-center transition ${
                              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            Fade Bawah ↓
                          </button>
                        </div>

                        {/* Warna Tint, Angle & Angle Dial Wheel */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-7 flex flex-col gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Warna Overlay Tint</label>
                              <div className={`flex items-center gap-1.5 border rounded p-1 ${
                                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                              }`}>
                                <input
                                  type="color"
                                  value={style.overlayColor || '#000000'}
                                  onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <input
                                  type="text"
                                  value={style.overlayColor || '#000000'}
                                  onChange={(e) => updateNodeStyle(selectedNode.id, { overlayColor: e.target.value })}
                                  className="w-full bg-transparent font-mono outline-none text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Arah Overlay Angle (°)</label>
                              <input
                                type="number"
                                min="0"
                                max="360"
                                value={style.overlayAngle ?? 90}
                                onChange={(e) => updateNodeStyle(selectedNode.id, { overlayAngle: Number(e.target.value) })}
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="col-span-5 flex justify-center pt-2">
                            <AnglePickerWheel
                              angle={style.overlayAngle ?? 90}
                              onChange={(newAngle) => updateNodeStyle(selectedNode.id, { overlayAngle: newAngle })}
                              label="Sudut Rotasi"
                              isDark={isDark}
                              size={64}
                            />
                          </div>
                        </div>

                        {/* Visual Gradient Alpha Bar */}
                        <div className="flex flex-col gap-1 mt-1">
                          <label className="text-[10px] text-slate-500">Visual Gradient Alpha Bar</label>
                          <div
                            className="w-full h-4 rounded border border-white/20 shadow-inner relative overflow-hidden"
                            style={{
                              background: `linear-gradient(to right, transparent, rgba(255,255,255,0.2)), linear-gradient(${style.overlayAngle ?? 90}deg, ${style.overlayColor || '#000000'}${Math.round((style.overlayStartOpacity ?? 0) * 255).toString(16).padStart(2, '0')} ${style.overlayStartPos ?? 0}%, ${style.overlayColor || '#000000'}${Math.round((style.overlayEndOpacity ?? 0.8) * 255).toString(16).padStart(2, '0')} ${style.overlayEndPos ?? 100}%)`,
                            }}
                          />
                        </div>

                        {/* Start Stop Opacity & Pos */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Opacity Awal</label>
                              <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.overlayStartOpacity ?? 0) * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={style.overlayStartOpacity ?? 0}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayStartOpacity: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Posisi Start Offset</label>
                              <span className="text-[10px] font-mono text-indigo-400">{style.overlayStartPos ?? 0}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={style.overlayStartPos ?? 0}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayStartPos: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>

                        {/* End Stop Opacity & Pos */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Opacity Akhir</label>
                              <span className="text-[10px] font-mono text-indigo-400">{Math.round((style.overlayEndOpacity ?? 0.8) * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={style.overlayEndOpacity ?? 0.8}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayEndOpacity: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-slate-500">Posisi End Offset</label>
                              <span className="text-[10px] font-mono text-indigo-400">{style.overlayEndPos ?? 100}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={style.overlayEndPos ?? 100}
                              onChange={(e) => updateNodeStyle(selectedNode.id, { overlayEndPos: Number(e.target.value) })}
                              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. LAYOUT & FLEXBOX SECTION */}
        <section className={`flex flex-col gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {renderSectionHeader('layout', 'Flexbox Container Layout', Layout, 'text-indigo-500')}

          {expandedSections['layout'] && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Display</label>
                  <select
                    value={style.display}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { display: e.target.value as any })}
                    className={selectClass}
                  >
                    <option value="flex">Flexbox</option>
                    <option value="block">Block / Free</option>
                  </select>
                </div>

                {style.display === 'flex' && (
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Direction</label>
                    <div className={`flex p-0.5 rounded border ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { flexDirection: 'row' })}
                        className={`flex-1 py-0.5 rounded flex justify-center items-center ${style.flexDirection === 'row' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { flexDirection: 'column' })}
                        className={`flex-1 py-0.5 rounded flex justify-center items-center ${style.flexDirection === 'column' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {style.display === 'flex' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Justify Content</label>
                      <select
                        value={style.justifyContent}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { justifyContent: e.target.value as any })}
                        className={selectClass}
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space Between</option>
                        <option value="space-around">Space Around</option>
                        <option value="space-evenly">Space Evenly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Align Items</label>
                      <select
                        value={style.alignItems}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { alignItems: e.target.value as any })}
                        className={selectClass}
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Gap (px)</label>
                    <input
                      type="number"
                      value={style.gap}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { gap: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Align Self (For children inside flex container) */}
              {selectedNode.parentId && (
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">
                    Align Self (Penjajaran Mandiri Elemen Ini)
                  </label>
                  <select
                    value={style.alignSelf || 'auto'}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { alignSelf: e.target.value as any })}
                    className={selectClass}
                  >
                    <option value="auto">Auto (Ikuti Induk)</option>
                    <option value="flex-start">Flex Start (Awal / Kiri)</option>
                    <option value="center">Center (Tengah)</option>
                    <option value="flex-end">Flex End (Akhir / Kanan)</option>
                    <option value="stretch">Stretch (Merentang)</option>
                    <option value="baseline">Baseline (Garis Dasar Teks)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Padding Inner Spacing (T, R, B, L)</label>
                <div className="grid grid-cols-4 gap-1">
                  <div>
                    <input
                      type="number"
                      placeholder="T"
                      title="Padding Top"
                      value={style.paddingTop || 0}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { paddingTop: Number(e.target.value) })}
                      className={inputClass}
                    />
                    <span className="text-[9px] text-slate-500 block text-center mt-0.5">Top</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="R"
                      title="Padding Right"
                      value={style.paddingRight || 0}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { paddingRight: Number(e.target.value) })}
                      className={inputClass}
                    />
                    <span className="text-[9px] text-slate-500 block text-center mt-0.5">Right</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="B"
                      title="Padding Bottom"
                      value={style.paddingBottom || 0}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { paddingBottom: Number(e.target.value) })}
                      className={inputClass}
                    />
                    <span className="text-[9px] text-slate-500 block text-center mt-0.5">Bottom</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="L"
                      title="Padding Left"
                      value={style.paddingLeft || 0}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { paddingLeft: Number(e.target.value) })}
                      className={inputClass}
                    />
                    <span className="text-[9px] text-slate-500 block text-center mt-0.5">Left</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. STYLING (FILL & STROKE & BORDER RADIUS) - Hidden for vector objects */}
        {selectedNode.type !== 'text' && !(selectedNode.type === 'image' && (style.imageType === 'vector' || Boolean(style.svgContent))) && (
          <section className={`flex flex-col gap-2 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {renderSectionHeader('fill', 'Fill & Stroke', Palette, 'text-pink-500')}

          {expandedSections['fill'] && (
            <div className="flex flex-col gap-2 pt-1">
              <div className={selectedNode.type === 'image' ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}>
                {selectedNode.type !== 'image' && (
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Fill Color</label>
                    <div className={`flex items-center gap-1.5 border rounded p-1 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <input
                        type="color"
                        value={style.fill === 'transparent' ? '#ffffff' : style.fill}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { fill: e.target.value })}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={style.fill}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { fill: e.target.value })}
                        className="w-full bg-transparent font-mono outline-none text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Stroke Color</label>
                  <div className={`flex items-center gap-1.5 border rounded p-1 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}>
                    <input
                      type="color"
                      value={style.stroke === 'transparent' ? '#000000' : style.stroke}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { stroke: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={style.stroke}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { stroke: e.target.value })}
                      className="w-full bg-transparent font-mono outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Stroke Width (px)</label>
                  <input
                    type="number"
                    value={style.strokeWidth}
                    onChange={(e) => updateNodeStyle(selectedNode.id, { strokeWidth: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-slate-500">Border Radius (All 4)</label>
                    <span className="text-[9px] text-slate-500 font-mono">Max: {Math.round(Math.min(selectedNode.width, selectedNode.height) / 2)}px</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={Math.round(Math.min(selectedNode.width, selectedNode.height) / 2)}
                    value={style.borderRadius || 0}
                    onChange={(e) => {
                      const maxRadius4 = Math.round(Math.min(selectedNode.width, selectedNode.height) / 2);
                      const raw = Number(e.target.value);
                      const val = Math.max(0, Math.min(maxRadius4, raw));
                      updateNodeStyle(selectedNode.id, {
                        borderRadius: val,
                        borderTopLeftRadius: val,
                        borderTopRightRadius: val,
                        borderBottomRightRadius: val,
                        borderBottomLeftRadius: val,
                      });
                    }}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* 4 Individual Corners (TL, TR, BR, BL) */}
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-slate-500">Corner Radius Tiap Sisi (TL, TR, BR, BL)</label>
                  <span className="text-[9px] text-slate-500 font-mono">Max: {Math.round(Math.min(selectedNode.width, selectedNode.height))}px</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {([
                    { key: 'borderTopLeftRadius' as const, label: 'TL', title: 'Top-Left Radius' },
                    { key: 'borderTopRightRadius' as const, label: 'TR', title: 'Top-Right Radius' },
                    { key: 'borderBottomRightRadius' as const, label: 'BR', title: 'Bottom-Right Radius' },
                    { key: 'borderBottomLeftRadius' as const, label: 'BL', title: 'Bottom-Left Radius' },
                  ] as const).map(({ key, label, title }) => {
                    const maxRadius1 = Math.round(Math.min(selectedNode.width, selectedNode.height));
                    return (
                      <div key={key}>
                        <input
                          type="number"
                          min="0"
                          max={maxRadius1}
                          placeholder={label}
                          title={title}
                          value={style[key] ?? style.borderRadius ?? 0}
                          onChange={(e) => {
                            const raw = Number(e.target.value);
                            const val = Math.max(0, Math.min(maxRadius1, raw));
                            updateNodeStyle(selectedNode.id, { [key]: val });
                          }}
                          className="w-full text-center text-xs p-1 rounded border bg-slate-800/80 border-slate-700 font-mono outline-none focus:border-indigo-500"
                        />
                        <span className="text-[9px] text-slate-500 block text-center mt-0.5">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
        )}

        {/* 4B. SPECIAL EFFECTS (GLASSMORPHISM, SHADOW, GLOW, NEO-BRUTALISM) */}
        {(selectedNode.type === 'rectangle' || selectedNode.type === 'ellipse' || selectedNode.type === 'frame') && (
          <section className={`flex flex-col gap-2.5 border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {renderSectionHeader(
              'specialEffects',
              'Special Effects & Styling',
              Wand2,
              'text-amber-400',
              (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {style.effectType && style.effectType !== 'none' ? style.effectType.toUpperCase() : 'EFFECTS'}
                </span>
              )
            )}

            {expandedSections['specialEffects'] !== false && (
              <div className="flex flex-col gap-2.5 pt-1">
                {/* Category Navigation Tabs */}
                <div className={`grid grid-cols-4 p-0.5 rounded border gap-0.5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button
                    type="button"
                    onClick={() => setActiveEffectTab('glass')}
                    className={`text-[9.5px] py-1 rounded font-medium flex items-center justify-center gap-1 transition ${
                      activeEffectTab === 'glass'
                        ? 'bg-indigo-600 text-white shadow font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>❄️</span>
                    <span>Glass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEffectTab('shadow')}
                    className={`text-[9.5px] py-1 rounded font-medium flex items-center justify-center gap-1 transition ${
                      activeEffectTab === 'shadow'
                        ? 'bg-indigo-600 text-white shadow font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>☁️</span>
                    <span>Shadow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEffectTab('glow')}
                    className={`text-[9.5px] py-1 rounded font-medium flex items-center justify-center gap-1 transition ${
                      activeEffectTab === 'glow'
                        ? 'bg-indigo-600 text-white shadow font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Glow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEffectTab('neo')}
                    className={`text-[9.5px] py-1 rounded font-medium flex items-center justify-center gap-1 transition ${
                      activeEffectTab === 'neo'
                        ? 'bg-indigo-600 text-white shadow font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🎨</span>
                    <span>Neo</span>
                  </button>
                </div>

                {/* TAB 1: GLASSMORPHISM */}
                {activeEffectTab === 'glass' && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-sky-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        Glassmorphism Presets
                      </span>
                      {style.backdropBlur && style.backdropBlur > 0 ? (
                        <span className="text-[9px] text-emerald-400 font-mono">Aktif (Blur {style.backdropBlur}px)</span>
                      ) : null}
                    </div>

                    {/* Quick Glass Presets */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        {
                          name: 'Frosted Light',
                          desc: 'Putih Es Modern',
                          props: {
                            effectType: 'glassmorphism' as const,
                            backdropBlur: 16,
                            backdropSaturate: 180,
                            fill: 'rgba(255, 255, 255, 0.2)',
                            stroke: 'rgba(255, 255, 255, 0.35)',
                            strokeWidth: 1,
                            borderStyle: 'solid' as const,
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                          }
                        },
                        {
                          name: 'Obsidian Dark',
                          desc: 'Glass Gelap Elegan',
                          props: {
                            effectType: 'glassmorphism' as const,
                            backdropBlur: 20,
                            backdropSaturate: 180,
                            fill: 'rgba(15, 23, 42, 0.65)',
                            stroke: 'rgba(255, 255, 255, 0.15)',
                            strokeWidth: 1,
                            borderStyle: 'solid' as const,
                            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
                          }
                        },
                        {
                          name: 'Aurora Violet',
                          desc: 'Ungu Cyber Glass',
                          props: {
                            effectType: 'glassmorphism' as const,
                            backdropBlur: 16,
                            backdropSaturate: 200,
                            fill: 'rgba(99, 102, 241, 0.22)',
                            stroke: 'rgba(168, 85, 247, 0.4)',
                            strokeWidth: 1,
                            borderStyle: 'solid' as const,
                            boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.25)',
                          }
                        },
                        {
                          name: 'Ultra Clear',
                          desc: 'Bening Minimalis',
                          props: {
                            effectType: 'glassmorphism' as const,
                            backdropBlur: 10,
                            backdropSaturate: 160,
                            fill: 'rgba(255, 255, 255, 0.08)',
                            stroke: 'rgba(255, 255, 255, 0.2)',
                            strokeWidth: 1,
                            borderStyle: 'solid' as const,
                            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
                          }
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => updateNodeStyle(selectedNode.id, preset.props)}
                          className={`text-left p-2 rounded border flex flex-col gap-0.5 transition ${
                            style.effectType === 'glassmorphism' && style.backdropBlur === preset.props.backdropBlur
                              ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50'
                              : isDark ? 'bg-slate-800/80 border-slate-700 hover:border-sky-500' : 'bg-slate-50 border-slate-200 hover:border-sky-500'
                          }`}
                        >
                          <span className="text-[10px] font-semibold text-slate-200">{preset.name}</span>
                          <span className="text-[9px] text-slate-400">{preset.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Sliders: Backdrop Blur & Saturate */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/40">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[10px] text-slate-500">Backdrop Blur</label>
                          <span className="text-[10px] font-mono text-sky-400">{style.backdropBlur || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="1"
                          value={style.backdropBlur || 0}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { 
                            backdropBlur: Number(e.target.value),
                            effectType: Number(e.target.value) > 0 ? 'glassmorphism' : style.effectType
                          })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[10px] text-slate-500">Backdrop Saturation</label>
                          <span className="text-[10px] font-mono text-sky-400">{style.backdropSaturate || 180}%</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="250"
                          step="5"
                          value={style.backdropSaturate || 180}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { backdropSaturate: Number(e.target.value) })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SHADOW ELEVATION */}
                {activeEffectTab === 'shadow' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Elevation & Drop Shadow Presets
                    </span>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        {
                          name: 'Soft Floating',
                          desc: 'Bayangan Halus Modern',
                          shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.12)',
                        },
                        {
                          name: 'Elevated Card',
                          desc: 'Kartu Mengambang',
                          shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)',
                        },
                        {
                          name: 'Deep 3D Pop',
                          desc: 'Timbul Tegas 3D',
                          shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                        },
                        {
                          name: 'Inner Inset',
                          desc: 'Bayangan Masuk Kedalam',
                          shadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.3)',
                        },
                        {
                          name: 'Ambient Indigo',
                          desc: 'Pendaran Warna Gelap',
                          shadow: '0 15px 30px -5px rgba(99, 102, 241, 0.35)',
                        },
                        {
                          name: 'Subtle Border Shadow',
                          desc: 'Bayangan Tipis Presisi',
                          shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => updateNodeStyle(selectedNode.id, { 
                            boxShadow: preset.shadow,
                            effectType: 'shadow'
                          })}
                          className={`text-left p-2 rounded border flex flex-col gap-0.5 transition ${
                            style.boxShadow === preset.shadow
                              ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                              : isDark ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'
                          }`}
                        >
                          <span className="text-[10px] font-semibold text-slate-200">{preset.name}</span>
                          <span className="text-[9px] text-slate-400">{preset.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Box Shadow Direct Input */}
                    <div className="pt-1 border-t border-slate-800/40">
                      <label className="text-[10px] text-slate-500 block mb-0.5">Custom CSS Box Shadow</label>
                      <input
                        type="text"
                        value={style.boxShadow || ''}
                        placeholder="e.g. 0 10px 25px rgba(0,0,0,0.2)"
                        onChange={(e) => updateNodeStyle(selectedNode.id, { 
                          boxShadow: e.target.value,
                          effectType: 'shadow'
                        })}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: NEON GLOW */}
                {activeEffectTab === 'glow' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-semibold text-pink-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-pink-400" />
                      Outer Neon Glow & Aura
                    </span>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        {
                          name: 'Cyan Cyber Glow',
                          color: '#06b6d4',
                          shadow: '0 0 25px rgba(6, 182, 212, 0.7), 0 0 50px rgba(6, 182, 212, 0.3)',
                        },
                        {
                          name: 'Violet Aura',
                          color: '#8b5cf6',
                          shadow: '0 0 30px rgba(139, 92, 246, 0.7), 0 0 60px rgba(139, 92, 246, 0.3)',
                        },
                        {
                          name: 'Amber Fire Flare',
                          color: '#f59e0b',
                          shadow: '0 0 30px rgba(245, 158, 11, 0.75), 0 0 60px rgba(239, 68, 68, 0.35)',
                        },
                        {
                          name: 'Pink Laser Glow',
                          color: '#ec4899',
                          shadow: '0 0 25px rgba(236, 72, 153, 0.75), 0 0 50px rgba(236, 72, 153, 0.3)',
                        },
                        {
                          name: 'Emerald Neon',
                          color: '#10b981',
                          shadow: '0 0 25px rgba(16, 185, 129, 0.7), 0 0 50px rgba(16, 185, 129, 0.3)',
                        },
                        {
                          name: 'Crimson Plasma',
                          color: '#ef4444',
                          shadow: '0 0 25px rgba(239, 68, 68, 0.75), 0 0 50px rgba(239, 68, 68, 0.35)',
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => updateNodeStyle(selectedNode.id, { 
                            boxShadow: preset.shadow,
                            glowColor: preset.color,
                            effectType: 'glow'
                          })}
                          className={`text-left p-2 rounded border flex items-center gap-2 transition ${
                            style.boxShadow === preset.shadow
                              ? 'bg-pink-950/40 border-pink-500 ring-1 ring-pink-500/50'
                              : isDark ? 'bg-slate-800/80 border-slate-700 hover:border-pink-500' : 'bg-slate-50 border-slate-200 hover:border-pink-500'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow" style={{ backgroundColor: preset.color, boxShadow: `0 0 8px ${preset.color}` }} />
                          <span className="text-[10px] font-semibold text-slate-200">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Glow Builder */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/40">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Warna Neon Glow</label>
                        <div className={`flex items-center gap-1.5 border rounded p-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                          <input
                            type="color"
                            value={style.glowColor || '#06b6d4'}
                            onChange={(e) => {
                              const col = e.target.value;
                              const blur = style.glowBlur || 25;
                              updateNodeStyle(selectedNode.id, {
                                glowColor: col,
                                effectType: 'glow',
                                boxShadow: `0 0 ${blur}px ${col}b3, 0 0 ${blur * 2}px ${col}4d`
                              });
                            }}
                            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={style.glowColor || '#06b6d4'}
                            onChange={(e) => {
                              const col = e.target.value;
                              const blur = style.glowBlur || 25;
                              updateNodeStyle(selectedNode.id, {
                                glowColor: col,
                                effectType: 'glow',
                                boxShadow: `0 0 ${blur}px ${col}b3, 0 0 ${blur * 2}px ${col}4d`
                              });
                            }}
                            className="w-full bg-transparent font-mono outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[10px] text-slate-500">Radius Pendaran Glow</label>
                          <span className="text-[10px] font-mono text-pink-400">{style.glowBlur || 25}px</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="1"
                          value={style.glowBlur || 25}
                          onChange={(e) => {
                            const blur = Number(e.target.value);
                            const col = style.glowColor || '#06b6d4';
                            updateNodeStyle(selectedNode.id, {
                              glowBlur: blur,
                              effectType: 'glow',
                              boxShadow: `0 0 ${blur}px ${col}b3, 0 0 ${blur * 2}px ${col}4d`
                            });
                          }}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: NEO-BRUTALISM */}
                {activeEffectTab === 'neo' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-semibold text-yellow-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-yellow-400" />
                      Neo-Brutalism Retro Presets
                    </span>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        {
                          name: 'Pop Yellow Hard',
                          fill: '#FFE600',
                          stroke: '#000000',
                          strokeWidth: 2.5,
                          borderRadius: 4,
                          boxShadow: '4px 4px 0px #000000',
                        },
                        {
                          name: 'Brutal Red Punch',
                          fill: '#FF5757',
                          stroke: '#000000',
                          strokeWidth: 3,
                          borderRadius: 0,
                          boxShadow: '6px 6px 0px #000000',
                        },
                        {
                          name: 'Cyan Retro Box',
                          fill: '#00F0FF',
                          stroke: '#000000',
                          strokeWidth: 2.5,
                          borderRadius: 6,
                          boxShadow: '5px 5px 0px #000000',
                        },
                        {
                          name: 'Cyber Pink Block',
                          fill: '#FF90E8',
                          stroke: '#000000',
                          strokeWidth: 3,
                          borderRadius: 0,
                          boxShadow: '6px 6px 0px #000000',
                        },
                        {
                          name: 'Lime Energy',
                          fill: '#A3E635',
                          stroke: '#000000',
                          strokeWidth: 2.5,
                          borderRadius: 4,
                          boxShadow: '5px 5px 0px #000000',
                        },
                        {
                          name: 'Monochrome Classic',
                          fill: '#FFFFFF',
                          stroke: '#000000',
                          strokeWidth: 2,
                          borderRadius: 8,
                          boxShadow: '5px 5px 0px #000000',
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => updateNodeStyle(selectedNode.id, {
                            effectType: 'neobrutalism',
                            fill: preset.fill,
                            stroke: preset.stroke,
                            strokeWidth: preset.strokeWidth,
                            borderStyle: 'solid',
                            borderRadius: preset.borderRadius,
                            borderTopLeftRadius: preset.borderRadius,
                            borderTopRightRadius: preset.borderRadius,
                            borderBottomRightRadius: preset.borderRadius,
                            borderBottomLeftRadius: preset.borderRadius,
                            boxShadow: preset.boxShadow,
                            neoShadowOffsetX: 5,
                            neoShadowOffsetY: 5,
                            neoShadowColor: '#000000'
                          })}
                          className={`text-left p-2 rounded border flex items-center gap-2 transition ${
                            style.effectType === 'neobrutalism' && style.fill === preset.fill
                              ? 'bg-yellow-950/40 border-yellow-500 ring-1 ring-yellow-500/50'
                              : isDark ? 'bg-slate-800/80 border-slate-700 hover:border-yellow-500' : 'bg-slate-50 border-slate-200 hover:border-yellow-500'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded shrink-0 border border-black"
                            style={{ backgroundColor: preset.fill, boxShadow: '1.5px 1.5px 0px #000' }}
                          />
                          <span className="text-[10px] font-semibold text-slate-200">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Neo-Brutalism Shadow Offset Sliders */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/40">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Offset X (px)</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={style.neoShadowOffsetX ?? 5}
                            onChange={(e) => {
                              const ox = Number(e.target.value);
                              const oy = style.neoShadowOffsetY ?? 5;
                              const col = style.neoShadowColor || '#000000';
                              updateNodeStyle(selectedNode.id, {
                                neoShadowOffsetX: ox,
                                effectType: 'neobrutalism',
                                boxShadow: `${ox}px ${oy}px 0px ${col}`
                              });
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Offset Y (px)</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={style.neoShadowOffsetY ?? 5}
                            onChange={(e) => {
                              const oy = Number(e.target.value);
                              const ox = style.neoShadowOffsetX ?? 5;
                              const col = style.neoShadowColor || '#000000';
                              updateNodeStyle(selectedNode.id, {
                                neoShadowOffsetY: oy,
                                effectType: 'neobrutalism',
                                boxShadow: `${ox}px ${oy}px 0px ${col}`
                              });
                            }}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Hard Shadow Color</label>
                        <div className={`flex items-center gap-1.5 border rounded p-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                          <input
                            type="color"
                            value={style.neoShadowColor || '#000000'}
                            onChange={(e) => {
                              const col = e.target.value;
                              const ox = style.neoShadowOffsetX ?? 5;
                              const oy = style.neoShadowOffsetY ?? 5;
                              updateNodeStyle(selectedNode.id, {
                                neoShadowColor: col,
                                effectType: 'neobrutalism',
                                boxShadow: `${ox}px ${oy}px 0px ${col}`
                              });
                            }}
                            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={style.neoShadowColor || '#000000'}
                            onChange={(e) => {
                              const col = e.target.value;
                              const ox = style.neoShadowOffsetX ?? 5;
                              const oy = style.neoShadowOffsetY ?? 5;
                              updateNodeStyle(selectedNode.id, {
                                neoShadowColor: col,
                                effectType: 'neobrutalism',
                                boxShadow: `${ox}px ${oy}px 0px ${col}`
                              });
                            }}
                            className="w-full bg-transparent font-mono outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RESET EFFECT BUTTON */}
                <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center">
                  <span className="text-[9px] text-slate-500">Hapus efek & kembalikan ke default</span>
                  <button
                    type="button"
                    onClick={() => updateNodeStyle(selectedNode.id, {
                      effectType: 'none',
                      backdropBlur: 0,
                      backdropSaturate: 100,
                      boxShadow: 'none',
                      glowColor: undefined,
                      glowBlur: undefined,
                      neoShadowOffsetX: undefined,
                      neoShadowOffsetY: undefined,
                      neoShadowColor: undefined,
                    })}
                    className="text-[9px] px-2 py-1 rounded border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/20 transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Reset Special Effects
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. TYPOGRAPHY (for Text Node) */}
        {selectedNode.type === 'text' && (
          <section className="flex flex-col gap-2">
            {renderSectionHeader('typography', 'Typography & Content', TypeIcon, 'text-emerald-500')}

            {expandedSections['typography'] && (
              <div className="flex flex-col gap-2 pt-1">
                {/* Font Source & Family Selection */}
                <div className={`p-2 rounded border flex flex-col gap-2 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Font Family & Source
                    </label>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 ${
                      style.fontSource === 'offline'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {style.fontSource === 'offline' ? <HardDrive className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                      {style.fontSource === 'offline' ? 'Offline Font' : 'Web Font CDN'}
                    </span>
                  </div>

                  {/* Mode Source Selector (By Web vs Offline) */}
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                    <button
                      onClick={() => {
                        updateNodeStyle(selectedNode.id, { fontSource: 'web' });
                        loadWebFont(style.fontFamily || 'Inter, sans-serif');
                      }}
                      className={`text-[10px] py-1 px-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                        (style.fontSource || 'web') === 'web'
                          ? 'bg-indigo-600 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>By Web (CDN)</span>
                    </button>
                    <button
                      onClick={() => updateNodeStyle(selectedNode.id, { fontSource: 'offline' })}
                      className={`text-[10px] py-1 px-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                        style.fontSource === 'offline'
                          ? 'bg-amber-600 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>Offline (Package)</span>
                    </button>
                  </div>

                  {/* Font Preset Dropdown */}
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Preset Font Family</label>
                    <select
                      value={extractCleanFontName(style.fontFamily || 'Inter')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = POPULAR_FONTS.find(f => f.cleanName === val);
                        const newFamily = matched ? matched.family : `'${val}', sans-serif`;
                        updateNodeStyle(selectedNode.id, { fontFamily: newFamily });
                        loadWebFont(newFamily);
                      }}
                      className={selectClass}
                    >
                      <optgroup label="Popular Modern Sans-Serif">
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Outfit">Outfit</option>
                        <option value="Space Grotesk">Space Grotesk</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Syne">Syne</option>
                      </optgroup>
                      <optgroup label="Display & Bold Headline">
                        <option value="Bebas Neue">Bebas Neue</option>
                      </optgroup>
                      <optgroup label="Serif & Editorial">
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cinzel">Cinzel</option>
                      </optgroup>
                      <optgroup label="Handwriting & Signature">
                        <option value="Photograph Signature">Photograph Signature</option>
                        <option value="Caveat">Caveat</option>
                        <option value="Pacifico">Pacifico</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Custom Font Family Input */}
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Font Family Name (CSS format)</label>
                    <input
                      type="text"
                      placeholder="e.g. 'Poppins', sans-serif"
                      value={style.fontFamily || 'Inter, sans-serif'}
                      onChange={(e) => {
                        const newFam = e.target.value;
                        updateNodeStyle(selectedNode.id, { fontFamily: newFam });
                        loadWebFont(newFam);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Text String</label>
                  <textarea
                    rows={2}
                    value={selectedNode.text || ''}
                    onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                    className={`w-full border rounded px-2 py-1 outline-none font-sans ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Font Size (px)</label>
                    <input
                      type="number"
                      value={style.fontSize}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { fontSize: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Font Weight</label>
                    <select
                      value={style.fontWeight}
                      onChange={(e) => updateNodeStyle(selectedNode.id, { fontWeight: Number(e.target.value) })}
                      className={selectClass}
                    >
                      <option value={400}>Normal (400)</option>
                      <option value={500}>Medium (500)</option>
                      <option value={600}>Semibold (600)</option>
                      <option value={700}>Bold (700)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Text Color</label>
                    <div className={`flex items-center gap-1.5 border rounded p-1 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <input
                        type="color"
                        value={style.textColor}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { textColor: e.target.value })}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={style.textColor}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { textColor: e.target.value })}
                        className="w-full bg-transparent font-mono outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Alignment</label>
                    <div className={`flex p-0.5 rounded border ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'left' })}
                        className={`flex-1 py-1 rounded flex justify-center ${style.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <AlignLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'center' })}
                        className={`flex-1 py-1 rounded flex justify-center ${style.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <AlignCenter className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { textAlign: 'right' })}
                        className={`flex-1 py-1 rounded flex justify-center ${style.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        <AlignRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SPACING HORIZONTAL & VERTIKAL */}
                <div className={`pt-2 border-t flex flex-col gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Text Spacing (Horizontal & Vertikal)
                  </span>

                  {/* Horizontal Spacing (Letter Spacing / Tracking) */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-slate-500">Spacing Horizontal / Letter Spacing</label>
                      <span className="text-[10px] font-mono text-indigo-400">{style.letterSpacing ?? 0}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-2"
                        max="15"
                        step="0.5"
                        value={style.letterSpacing ?? 0}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { letterSpacing: Number(e.target.value) })}
                        className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <input
                        type="number"
                        step="0.5"
                        value={style.letterSpacing ?? 0}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { letterSpacing: Number(e.target.value) })}
                        className="w-14 text-xs p-1 rounded border bg-transparent font-mono outline-none text-center"
                      />
                    </div>
                    {/* Quick Presets Letter Spacing */}
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { letterSpacing: -0.5 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          style.letterSpacing === -0.5 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Rapat (-0.5)
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { letterSpacing: 0 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          (style.letterSpacing ?? 0) === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Normal (0)
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { letterSpacing: 1.5 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          style.letterSpacing === 1.5 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Longgar (1.5)
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { letterSpacing: 4 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          style.letterSpacing === 4 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Wide (4)
                      </button>
                    </div>
                  </div>

                  {/* Vertical Spacing (Line Height / Leading) */}
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-slate-500">Spacing Vertikal / Line Height</label>
                      <span className="text-[10px] font-mono text-indigo-400">{style.lineHeight ?? 1.5}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.8"
                        max="3"
                        step="0.1"
                        value={style.lineHeight ?? 1.5}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { lineHeight: Number(e.target.value) })}
                        className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={style.lineHeight ?? 1.5}
                        onChange={(e) => updateNodeStyle(selectedNode.id, { lineHeight: Number(e.target.value) })}
                        className="w-14 text-xs p-1 rounded border bg-transparent font-mono outline-none text-center"
                      />
                    </div>
                    {/* Quick Presets Line Height */}
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { lineHeight: 1.1 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          style.lineHeight === 1.1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Padat (1.1x)
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { lineHeight: 1.5 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          (style.lineHeight ?? 1.5) === 1.5 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Normal (1.5x)
                      </button>
                      <button
                        onClick={() => updateNodeStyle(selectedNode.id, { lineHeight: 1.8 })}
                        className={`text-[9px] py-0.5 rounded border text-center ${
                          style.lineHeight === 1.8 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Renggang (1.8x)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Vertical Edge Tab attached to right screen edge when hidden */}
      {!showInspector && (
        <button
          onClick={toggleInspector}
          title="Tampilkan Panel Properti (Show Inspector)"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-2 py-3 px-1.5 rounded-l-md border-l border-t border-b shadow-xl backdrop-blur-md transition-all duration-200 hover:pr-2.5 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-300 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-slate-800'
              : 'bg-white/95 border-slate-300 text-slate-700 hover:text-slate-950 hover:border-indigo-500 hover:bg-slate-50 shadow-md'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
          <span
            className="text-xs font-semibold tracking-wide select-none py-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Properties
          </span>
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
        </button>
      )}

      {/* Sliding Property Inspector Sidebar */}
      <aside className={`border-l flex flex-col h-full select-none z-20 text-xs transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        showInspector ? 'w-72 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full border-l-0 pointer-events-none'
      } ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
      }`}>
        <div className="w-72 h-full flex flex-col overflow-y-auto">
          {renderPanelContent()}
        </div>
      </aside>
    </>
  );
};
