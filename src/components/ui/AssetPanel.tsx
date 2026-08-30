import React, { useState, useRef, useMemo } from 'react';
import { 
  Image as ImageIcon, Sparkles, Upload, Search, Plus, Trash2, 
  GripVertical, Check, X, Info
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import type { ProjectAsset } from '../../types/canvas';

// Default Curated Pixel Presets
const PRESET_PIXEL_ASSETS: ProjectAsset[] = [
  {
    id: 'preset_pixel_1',
    name: 'Modern 3D Abstract',
    type: 'pixel',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    width: 260,
    height: 180,
    category: 'preset',
  },
  {
    id: 'preset_pixel_2',
    name: 'Neon Cyberpunk City',
    type: 'pixel',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    width: 280,
    height: 180,
    category: 'preset',
  },
  {
    id: 'preset_pixel_3',
    name: 'Dark Violet Aura',
    type: 'pixel',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    width: 260,
    height: 180,
    category: 'preset',
  },
  {
    id: 'preset_pixel_4',
    name: 'Minimal Studio Portrait',
    type: 'pixel',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    width: 260,
    height: 180,
    category: 'preset',
  },
  {
    id: 'preset_pixel_5',
    name: 'Glassmorphism Fluid',
    type: 'pixel',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    width: 280,
    height: 180,
    category: 'preset',
  },
  {
    id: 'preset_pixel_6',
    name: 'Futuristic Cyber Glow',
    type: 'pixel',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    width: 280,
    height: 180,
    category: 'preset',
  },
];

// Default Curated Vector SVG Presets
const PRESET_VECTOR_ASSETS: ProjectAsset[] = [
  {
    id: 'preset_vec_star',
    name: 'Star Rating',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_sparkles',
    name: 'AI Sparkles',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_rocket',
    name: 'Rocket Launch',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_shield',
    name: 'Security Shield',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_heart',
    name: 'Heart Like',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_flame',
    name: 'Flame Trending',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_trophy',
    name: 'Trophy Award',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_code',
    name: 'Code Developer',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_globe',
    name: 'Globe Network',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_bag',
    name: 'Shopping Bag',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_lightning',
    name: 'Lightning Bolt',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
  {
    id: 'preset_vec_bell',
    name: 'Notification Bell',
    type: 'vector',
    svgContent: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zm-4.27 13a2 2 0 0 1-3.46 0"/></svg>',
    width: 140,
    height: 140,
    category: 'vector',
  },
];

export const AssetPanel: React.FC = () => {
  const {
    project,
    theme,
    customAssets,
    addCustomAsset,
    removeCustomAsset,
    insertAssetToCanvas,
  } = useProjectStore();

  const isDark = theme === 'dark';
  const fileImageInputRef = useRef<HTMLInputElement>(null);
  const fileSvgInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pixel' | 'vector' | 'my' | 'canvas'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract assets currently used in project canvas
  const canvasUsedAssets = useMemo(() => {
    const list: ProjectAsset[] = [];
    const seen = new Set<string>();

    Object.values(project.nodes).forEach((n) => {
      if (n.type === 'image') {
        if (n.style.imageType === 'vector' && n.style.svgContent) {
          const key = `svg_${n.style.svgContent.slice(0, 40)}`;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({
              id: `canvas_${n.id}`,
              name: n.name || 'Vector Object',
              type: 'vector',
              svgContent: n.style.svgContent,
              width: n.width,
              height: n.height,
              category: 'vector',
            });
          }
        } else if (n.style.imageUrl) {
          const key = `img_${n.style.imageUrl}`;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({
              id: `canvas_${n.id}`,
              name: n.name || 'Image Object',
              type: 'pixel',
              url: n.style.imageUrl,
              width: n.width,
              height: n.height,
              category: 'preset',
            });
          }
        }
      }
    });

    return list;
  }, [project.nodes]);

  // Combine all available assets
  const allAssets = useMemo(() => {
    return [
      ...customAssets,
      ...canvasUsedAssets.filter((ca) => !customAssets.some((ma) => ma.url === ca.url || ma.svgContent === ca.svgContent)),
      ...PRESET_PIXEL_ASSETS,
      ...PRESET_VECTOR_ASSETS,
    ];
  }, [customAssets, canvasUsedAssets]);

  // Filtered Assets based on query & filter tabs
  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(q);
        const matchType = asset.type.toLowerCase().includes(q);
        if (!matchName && !matchType) return false;
      }

      // Tab filter
      if (filterType === 'pixel') return asset.type === 'pixel';
      if (filterType === 'vector') return asset.type === 'vector';
      if (filterType === 'my') return customAssets.some((c) => c.id === asset.id);
      if (filterType === 'canvas') return canvasUsedAssets.some((c) => c.id === asset.id);

      return true;
    });
  }, [allAssets, searchQuery, filterType, customAssets, canvasUsedAssets]);

  // Handle Local Image Upload (Raster)
  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        addCustomAsset({
          name: file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Image',
          type: 'pixel',
          url: dataUrl,
          width: 260,
          height: 180,
          category: 'uploaded',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Local SVG Upload (Vector)
  const handleUploadSvgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        addCustomAsset({
          name: file.name.replace(/\.[^/.]+$/, '') || 'Uploaded SVG Vector',
          type: 'vector',
          svgContent: text,
          width: 140,
          height: 140,
          category: 'uploaded',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Drag Start from Asset Panel
  const handleDragStart = (e: React.DragEvent, asset: ProjectAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'asset',
      assetType: asset.type,
      name: asset.name,
      imageUrl: asset.url,
      svgContent: asset.svgContent,
      width: asset.width || (asset.type === 'vector' ? 140 : 240),
      height: asset.height || (asset.type === 'vector' ? 140 : 180),
      objectFit: 'cover',
      vectorColor: '#6366f1',
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle Click to insert
  const handleInsert = (asset: ProjectAsset) => {
    insertAssetToCanvas(asset);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Upload Action Bar */}
      <div className={`p-2.5 border-b flex flex-col gap-2 ${
        isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/80'
      }`}>
        <input 
          type="file" 
          ref={fileImageInputRef} 
          onChange={handleUploadImageFile} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={fileSvgInputRef} 
          onChange={handleUploadSvgFile} 
          accept=".svg,image/svg+xml" 
          className="hidden" 
        />

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => fileImageInputRef.current?.click()}
            className={`py-1.5 px-2 rounded border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-indigo-300 border-slate-700 hover:border-indigo-500'
                : 'bg-white hover:bg-slate-50 text-indigo-700 border-slate-300 hover:border-indigo-500'
            }`}
            title="Upload gambar PNG / JPG / WebP dari perangkat"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            + Upload Foto
          </button>

          <button
            type="button"
            onClick={() => fileSvgInputRef.current?.click()}
            className={`py-1.5 px-2 rounded border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-slate-700 hover:border-amber-500'
                : 'bg-white hover:bg-slate-50 text-amber-700 border-slate-300 hover:border-amber-500'
            }`}
            title="Upload file vector SVG dari perangkat"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            + Upload SVG
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari aset gambar atau SVG..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-7 py-1 text-xs rounded border outline-none font-medium transition ${
              isDark
                ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pixel', label: 'Foto' },
            { id: 'vector', label: 'Vector' },
            { id: 'my', label: 'Aset Saya' },
            { id: 'canvas', label: 'Di Kanvas' },
          ].map((tab) => {
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2 py-0.5 rounded-full border whitespace-nowrap transition-all ${
                  active
                    ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-sm'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Instruction Hint */}
      <div className={`px-3 py-1.5 border-b text-[10px] flex items-center gap-1.5 shrink-0 ${
        isDark ? 'bg-indigo-950/30 border-slate-800/80 text-indigo-300' : 'bg-indigo-50 border-slate-200 text-indigo-800'
      }`}>
        <Info className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
        <span className="truncate">Klik atau <b>Drag & Drop</b> aset langsung ke kanvas!</span>
      </div>

      {/* Asset Grid List */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2 mt-4">
            <ImageIcon className="w-8 h-8 opacity-30 text-indigo-400" />
            <p className="text-xs font-medium">Tidak ada aset ditemukan</p>
            <p className="text-[10px] opacity-75">Upload gambar atau SVG baru untuk menambahkan ke pustaka aset</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => {
              const isCustom = customAssets.some((c) => c.id === asset.id);
              const isCopied = copiedId === asset.id;

              return (
                <div
                  key={asset.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, asset)}
                  onClick={() => handleInsert(asset)}
                  className={`group relative rounded-lg border p-1.5 flex flex-col gap-1.5 transition-all cursor-grab active:cursor-grabbing hover:scale-[1.02] shadow-sm ${
                    isDark 
                      ? 'bg-slate-800/60 border-slate-700/80 hover:border-indigo-500 hover:bg-slate-800' 
                      : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md'
                  }`}
                  title={`${asset.name} - Klik atau Tarik ke kanvas`}
                >
                  {/* Thumbnail Container */}
                  <div className={`w-full h-24 rounded-md overflow-hidden flex items-center justify-center relative ${
                    isDark ? 'bg-slate-900/90' : 'bg-slate-100'
                  }`}>
                    {asset.type === 'pixel' ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover rounded-md pointer-events-none select-none transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 flex items-center justify-center text-indigo-400 pointer-events-none select-none [&>svg]:w-full [&>svg]:h-full transition-transform group-hover:scale-110"
                        dangerouslySetInnerHTML={{ __html: asset.svgContent || '' }}
                      />
                    )}

                    {/* Tag Badge */}
                    <div className="absolute top-1 left-1">
                      <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold backdrop-blur shadow-sm ${
                        asset.type === 'vector'
                          ? 'bg-amber-500/80 text-amber-950 font-bold'
                          : 'bg-indigo-600/80 text-white font-bold'
                      }`}>
                        {asset.type === 'vector' ? 'SVG' : 'PIXEL'}
                      </span>
                    </div>

                    {/* Hover Drag Action Overlay */}
                    <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1">
                      <div className="flex items-center gap-1 bg-indigo-600/90 text-[10px] px-2 py-0.5 rounded-full font-semibold shadow">
                        <Plus className="w-3 h-3" />
                        <span>Sisipkan</span>
                      </div>
                      <span className="text-[8px] text-slate-300 flex items-center gap-0.5">
                        <GripVertical className="w-2.5 h-2.5" />
                        Tarik ke Kanvas
                      </span>
                    </div>

                    {/* Copied/Added feedback */}
                    {isCopied && (
                      <div className="absolute inset-0 bg-emerald-600/90 text-white flex flex-col items-center justify-center gap-1 text-xs font-bold animate-in fade-in">
                        <Check className="w-4 h-4" />
                        <span className="text-[10px]">Ditambahkan!</span>
                      </div>
                    )}
                  </div>

                  {/* Asset Info & Controls */}
                  <div className="flex items-center justify-between gap-1 px-0.5">
                    <span className={`text-[10px] font-medium truncate flex-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {asset.name}
                    </span>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomAsset(asset.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100"
                        title="Hapus aset ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
