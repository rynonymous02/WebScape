import React, { useState, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { X, Copy, Check, Code2, Sparkles, FolderArchive, Image, FileCode } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { runAllTranspilers } from '../../transpiler';
import { fileSystemService } from '../../services/fileSystem';
import { extractImagesFromNodes, createZipProjectPackage } from '../../utils/assetPacker';

export const CodeExportModal: React.FC = () => {
  const { isCodeExportOpen, setCodeExportOpen, project, selectedIds } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'flutter_widget' | 'flutter_full' | 'tailwind_jsx' | 'tailwind_html' | 'bootstrap_jsx' | 'bootstrap_html' | 'css_html' | 'css_raw'>('flutter_widget');
  const [copied, setCopied] = useState(false);
  const [targetFrameId, setTargetFrameId] = useState<string>('auto');
  const [assetMode, setAssetMode] = useState<'folder' | 'base64'>('folder');
  const [isZipping, setIsZipping] = useState(false);

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

  // Extract images to separate folder mode
  const { cleanNodes, extractedImages } = useMemo(() => {
    return extractImagesFromNodes(project.nodes, effectiveExportRootIds);
  }, [project.nodes, effectiveExportRootIds]);

  const transpilerOutput = useMemo(() => {
    const nodesToUse = assetMode === 'folder' ? cleanNodes : project.nodes;
    return runAllTranspilers(nodesToUse, effectiveExportRootIds);
  }, [project.nodes, cleanNodes, assetMode, effectiveExportRootIds]);

  if (!isCodeExportOpen) return null;

  let currentCode = '';
  let currentLang = htmlLang();
  let fileExtension = 'html';

  if (activeTab === 'flutter_widget') {
    currentCode = transpilerOutput.flutter.widget;
    currentLang = jsLang({ typescript: true });
    fileExtension = 'dart';
  } else if (activeTab === 'flutter_full') {
    currentCode = transpilerOutput.flutter.fullFile;
    currentLang = jsLang({ typescript: true });
    fileExtension = 'dart';
  } else if (activeTab === 'css_html') {
    currentCode = transpilerOutput.htmlCss.fullDocument;
    currentLang = htmlLang();
    fileExtension = 'html';
  } else if (activeTab === 'css_raw') {
    currentCode = transpilerOutput.htmlCss.css;
    currentLang = cssLang();
    fileExtension = 'css';
  } else if (activeTab === 'tailwind_html') {
    currentCode = transpilerOutput.tailwind.html;
    currentLang = htmlLang();
    fileExtension = 'html';
  } else if (activeTab === 'tailwind_jsx') {
    currentCode = transpilerOutput.tailwind.jsx;
    currentLang = jsLang({ jsx: true, typescript: true });
    fileExtension = 'tsx';
  } else if (activeTab === 'bootstrap_html') {
    currentCode = transpilerOutput.bootstrap.html;
    currentLang = htmlLang();
    fileExtension = 'html';
  } else if (activeTab === 'bootstrap_jsx') {
    currentCode = transpilerOutput.bootstrap.jsx;
    currentLang = jsLang({ jsx: true, typescript: true });
    fileExtension = 'tsx';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    fileSystemService.downloadTextFile(
      currentCode,
      `WebScape_${activeTab}_component.${fileExtension}`,
      fileExtension === 'html' ? 'text/html' : 'text/plain'
    );
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await createZipProjectPackage({
        projectName: project.name || 'WebScape_Design',
        activeTab,
        cleanTranspilerOutput: transpilerOutput,
        extractedImages,
        nodes: cleanNodes,
      });

      const fileName = `${(project.name || 'webscape_project').toLowerCase().replace(/[^a-z0-9]/g, '_')}_package.zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip bundle:', err);
      alert('Gagal membuat file ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 border-b border-slate-800 px-5 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>Code Generator Transpiler</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" /> Live Transpiled
                </span>
              </h2>
              <p className="text-slate-400 text-xs">Transpiled to Flutter (Dart), Tailwind CSS, React & Bootstrap 5</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Image Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setAssetMode('folder')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                  assetMode === 'folder' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Simpan gambar di folder images/ terpisah (Code bersih tanpa Base64)"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Folder images/ {extractedImages.length > 0 && `(${extractedImages.length})`}</span>
              </button>
              <button
                onClick={() => setAssetMode('base64')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                  assetMode === 'base64' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Embed gambar langsung dalam kode (Base64)"
              >
                <Image className="w-3.5 h-3.5" />
                <span>Base64</span>
              </button>
            </div>

            {/* Target Frame Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Target:</span>
              <select
                value={targetFrameId}
                onChange={(e) => setTargetFrameId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition max-w-[170px] truncate font-medium"
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

            <button
              onClick={() => setCodeExportOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between overflow-x-auto text-xs shrink-0 gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-mono mr-2">FRAMEWORK:</span>
            
            {/* Flutter Tabs */}
            <button
              onClick={() => setActiveTab('flutter_widget')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'flutter_widget' ? 'bg-sky-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Flutter (Widget)
            </button>
            <button
              onClick={() => setActiveTab('flutter_full')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'flutter_full' ? 'bg-sky-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Flutter (main.dart)
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Tailwind Tabs */}
            <button
              onClick={() => setActiveTab('tailwind_jsx')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'tailwind_jsx' ? 'bg-teal-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tailwind (React TSX)
            </button>
            <button
              onClick={() => setActiveTab('tailwind_html')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'tailwind_html' ? 'bg-teal-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tailwind (HTML)
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Bootstrap Tabs */}
            <button
              onClick={() => setActiveTab('bootstrap_jsx')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'bootstrap_jsx' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Bootstrap 5 (React TSX)
            </button>
            <button
              onClick={() => setActiveTab('bootstrap_html')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'bootstrap_html' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Bootstrap 5 (HTML)
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Raw CSS Tabs */}
            <button
              onClick={() => setActiveTab('css_html')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'css_html' ? 'bg-slate-700 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              HTML + CSS Page
            </button>
            <button
              onClick={() => setActiveTab('css_raw')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === 'css_raw' ? 'bg-slate-700 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw CSS Rules
            </button>
          </div>

          {/* Copy / Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
              title="Copy Code ke Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            {/* ZIP Download (Bundled with images/ directory) */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-lg shadow-md transition"
              title="Download File ZIP lengkap dengan folder images/ & code"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Bundling...' : 'Download ZIP (+ images/)'}</span>
            </button>

            {/* Single File Download */}
            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-lg border border-slate-700 transition"
              title={`Download single file .${fileExtension}`}
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">.{fileExtension}</span>
            </button>
          </div>
        </div>

        {/* Code Mirror Viewer */}
        <div className="flex-1 overflow-auto bg-slate-950 font-mono text-sm">
          <CodeMirror
            value={currentCode}
            extensions={[currentLang]}
            theme="dark"
            editable={false}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};
