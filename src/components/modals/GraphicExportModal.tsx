import React, { useState } from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { generateSVGExport } from '../../transpiler';
import { fileSystemService } from '../../services/fileSystem';

export const GraphicExportModal: React.FC = () => {
  const { isGraphicExportOpen, setGraphicExportOpen, project } = useProjectStore();
  const [scale, setScale] = useState<number>(2);

  if (!isGraphicExportOpen) return null;

  const svgContent = generateSVGExport(project.nodes, project.rootNodeIds);

  const handleDownloadSVG = () => {
    fileSystemService.downloadTextFile(
      svgContent,
      `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`,
      'image/svg+xml'
    );
  };

  const handleDownloadPNG = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}@${scale}x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-600/20 text-pink-400 rounded-lg border border-pink-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Export Graphic Image</h2>
              <p className="text-slate-400 text-xs">Export vector layout as SVG or PNG image</p>
            </div>
          </div>

          <button
            onClick={() => setGraphicExportOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview & Settings */}
        <div className="p-6 flex flex-col gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 flex items-center justify-center min-h-[220px] overflow-auto">
            <div
              className="max-h-[300px] overflow-hidden"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-slate-300 text-xs font-semibold">PNG Export Resolution Scale:</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-md outline-none"
              >
                <option value={1}>1x Standard Resolution</option>
                <option value={2}>2x High DPI Retina</option>
                <option value={3}>3x Ultra HD 4K</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadSVG}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-pink-400" />
                <span>Export Vector (.SVG)</span>
              </button>

              <button
                onClick={handleDownloadPNG}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Image (.PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
