import JSZip from 'jszip';
import type { CanvasNode, TranspilerOutput } from '../types/canvas';
import { extractFontsFromNodes, getOfflineFontAsset } from './offlineFonts';
import { buildGoogleFontsUrl } from './fontLoader';

export interface ExtractedImage {
  nodeId: string;
  originalDataUrl: string;
  filename: string;
  relativePath: string;
  base64Content: string;
  mimeType: string;
}

/**
 * Extracts base64 images from nodes, returning clean node definitions pointing to `images/filename`
 * and a list of binary image files to bundle.
 */
export function extractImagesFromNodes(
  nodes: Record<string, CanvasNode>,
  rootIds: string[]
): {
  cleanNodes: Record<string, CanvasNode>;
  extractedImages: ExtractedImage[];
} {
  const cleanNodes: Record<string, CanvasNode> = {};
  const extractedImages: ExtractedImage[] = [];
  const processedNodeIds = new Set<string>();

  // Deep clone nodes
  Object.keys(nodes).forEach((key) => {
    cleanNodes[key] = {
      ...nodes[key],
      style: { ...nodes[key].style },
      children: [...(nodes[key].children || [])],
    };
  });

  function collectNodes(id: string) {
    if (processedNodeIds.has(id)) return;
    processedNodeIds.add(id);

    const node = cleanNodes[id];
    if (!node) return;

    // 1. Extract raster image URL (e.g. uploaded photo / avatar)
    const imgUrl = node.style.imageUrl;
    if (imgUrl && imgUrl.startsWith('data:')) {
      const match = imgUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Content = match[2];
        let ext = 'png';
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('svg')) ext = 'svg';
        else if (mimeType.includes('gif')) ext = 'gif';

        const safeName = (node.name || 'image')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_');
        const shortId = (node.id || '').replace('node_', '').slice(0, 6);
        const filename = `${safeName}_${shortId}.${ext}`;
        const relativePath = `images/${filename}`;

        extractedImages.push({
          nodeId: node.id,
          originalDataUrl: imgUrl,
          filename,
          relativePath,
          base64Content,
          mimeType,
        });

        // Replace inline base64 with clean relative path
        node.style.imageUrl = relativePath;
      }
    }

    // 2. Extract background image
    const bgImage = node.style.backgroundImage;
    if (bgImage && bgImage.startsWith('data:')) {
      const match = bgImage.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Content = match[2];
        let ext = 'jpg';
        if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('svg')) ext = 'svg';
        else if (mimeType.includes('gif')) ext = 'gif';

        const safeName = (node.name || 'bg_image')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_');
        const shortId = (node.id || '').replace('node_', '').slice(0, 6);
        const filename = `${safeName}_${shortId}.${ext}`;
        const relativePath = `images/${filename}`;

        extractedImages.push({
          nodeId: node.id,
          originalDataUrl: bgImage,
          filename,
          relativePath,
          base64Content,
          mimeType,
        });

        // Replace inline base64 with clean relative path
        node.style.backgroundImage = relativePath;
      }
    }

    // 3. Extract SVG vector assets into standalone .svg files in images/ directory
    if (node.type === 'image' && node.style.imageType === 'vector' && node.style.svgContent) {
      const safeName = (node.name || 'vector_icon')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      const shortId = (node.id || '').replace('node_', '').slice(0, 6);
      const filename = `${safeName}_${shortId}.svg`;
      const relativePath = `images/${filename}`;

      // Encode SVG string to base64 for JSZip
      const utf8Bytes = new TextEncoder().encode(node.style.svgContent);
      let binaryStr = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryStr += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binaryStr);

      extractedImages.push({
        nodeId: node.id,
        originalDataUrl: node.style.svgContent,
        filename,
        relativePath,
        base64Content,
        mimeType: 'image/svg+xml',
      });
    }

    if (node.children) {
      node.children.forEach(collectNodes);
    }
  }

  (rootIds || []).forEach(collectNodes);

  return { cleanNodes, extractedImages };
}

export interface ZipExportOptions {
  projectName: string;
  activeTab: 'flutter_widget' | 'flutter_full' | 'tailwind_jsx' | 'tailwind_html' | 'bootstrap_jsx' | 'bootstrap_html' | 'css_html' | 'css_raw';
  cleanTranspilerOutput: TranspilerOutput;
  extractedImages: ExtractedImage[];
  nodes?: Record<string, CanvasNode>;
}

/**
 * Generates a ready-to-use .ZIP project archive containing clean source files, `images/` directory, and offline `fonts/` directory.
 */
export async function createZipProjectPackage(options: ZipExportOptions): Promise<Blob> {
  const { projectName, activeTab, cleanTranspilerOutput, extractedImages, nodes } = options;
  const zip = new JSZip();

  const safeProjName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'webscape_project';

  // 1. Extract and pack fonts (both web and offline)
  const { webFonts, offlineFonts } = extractFontsFromNodes(nodes || {});
  const googleFontsUrl = buildGoogleFontsUrl(webFonts.length > 0 ? webFonts : ['Inter']);
  const googleFontLinkTags = googleFontsUrl ? `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="${googleFontsUrl}" rel="stylesheet">` : '';

  // Pack offline fonts into fonts/ directory
  if (offlineFonts.length > 0) {
    const fontsFolder = zip.folder('fonts');
    if (fontsFolder) {
      offlineFonts.forEach((ff) => {
        const fontAsset = getOfflineFontAsset(ff);
        fontsFolder.file(fontAsset.filename, fontAsset.base64Data, { base64: true });
      });
    }
  }

  // 2. Pack all extracted images into images/ folder
  const imagesFolder = zip.folder('images');
  if (imagesFolder) {
    extractedImages.forEach((img) => {
      imagesFolder.file(img.filename, img.base64Content, { base64: true });
    });
  }

  // 3. Package according to target framework
  if (activeTab === 'css_html' || activeTab === 'css_raw') {
    // Clean Separate HTML + CSS Architecture
    const htmlWithLinkedCss = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - WebScape Export</title>
  <link rel="stylesheet" href="style.css">
${googleFontLinkTags ? googleFontLinkTags + '\n' : ''}</head>
<body>
${cleanTranspilerOutput.htmlCss.html}
</body>
</html>`;

    zip.file('index.html', htmlWithLinkedCss);
    zip.file('style.css', cleanTranspilerOutput.htmlCss.css);
    zip.file('README.md', `# ${projectName}\n\nExported from WebScape Vector Canvas.\n\n## Structure\n- \`index.html\` - Webpage layout\n- \`style.css\` - Extracted CSS stylesheet\n- \`images/\` - Extracted image assets\n${offlineFonts.length > 0 ? '- `fonts/` - Extracted offline font assets\n' : ''}\nDouble click \`index.html\` to open in any web browser.`);
  } else if (activeTab === 'tailwind_html') {
    zip.file('index.html', cleanTranspilerOutput.tailwind.html);
    zip.file('README.md', `# ${projectName} (Tailwind CSS)\n\nExported from WebScape.\n\n## Structure\n- \`index.html\` - Complete webpage with Tailwind CSS CDN & local image paths\n- \`images/\` - Extracted image assets\n${offlineFonts.length > 0 ? '- `fonts/` - Extracted offline font assets\n' : ''}\nOpen \`index.html\` in any web browser.`);
  } else if (activeTab === 'tailwind_jsx') {
    const srcFolder = zip.folder('src');
    if (srcFolder) {
      srcFolder.file('App.tsx', cleanTranspilerOutput.tailwind.jsx);
      srcFolder.file('index.css', `@import "tailwindcss";\n\nbody {\n  margin: 0;\n  font-family: Inter, sans-serif;\n}`);
      srcFolder.file('main.tsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`);
    }

    const publicFolder = zip.folder('public');
    if (publicFolder) {
      const publicImages = publicFolder.folder('images');
      if (publicImages) {
        extractedImages.forEach((img) => {
          publicImages.file(img.filename, img.base64Content, { base64: true });
        });
      }
      if (offlineFonts.length > 0) {
        const publicFonts = publicFolder.folder('fonts');
        if (publicFonts) {
          offlineFonts.forEach((ff) => {
            const fontAsset = getOfflineFontAsset(ff);
            publicFonts.file(fontAsset.filename, fontAsset.base64Data, { base64: true });
          });
        }
      }
    }

    zip.file('package.json', JSON.stringify({
      name: safeProjName,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'lucide-react': '^0.475.0'
      },
      devDependencies: {
        '@types/react': '^18.3.5',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.3.1',
        tailwindcss: '^4.0.0',
        typescript: '^5.5.3',
        vite: '^5.4.2'
      }
    }, null, 2));

    zip.file('index.html', `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${projectName}</title>\n${googleFontLinkTags ? googleFontLinkTags + '\n' : ''}</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.tsx"></script>\n</body>\n</html>`);
    zip.file('README.md', `# ${projectName} - React + Tailwind CSS\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``);
  } else if (activeTab === 'bootstrap_html') {
    zip.file('index.html', cleanTranspilerOutput.bootstrap.html);
    zip.file('README.md', `# ${projectName} (Bootstrap 5)\n\n## Structure\n- \`index.html\` - Complete layout with Bootstrap 5 CDN\n- \`images/\` - Extracted image assets\n${offlineFonts.length > 0 ? '- `fonts/` - Extracted offline font assets\n' : ''}`);
  } else if (activeTab === 'bootstrap_jsx') {
    const srcFolder = zip.folder('src');
    if (srcFolder) {
      srcFolder.file('App.tsx', cleanTranspilerOutput.bootstrap.jsx);
    }
    zip.file('README.md', `# ${projectName} (React Bootstrap)\n\nIncludes extracted images in \`images/\`${offlineFonts.length > 0 ? ' and fonts in `fonts/`' : ''}.`);
  } else if (activeTab === 'flutter_widget' || activeTab === 'flutter_full') {
    const libFolder = zip.folder('lib');
    if (libFolder) {
      libFolder.file('main.dart', cleanTranspilerOutput.flutter.fullFile);
      libFolder.file('design_widget.dart', cleanTranspilerOutput.flutter.widget);
    }

    const assetsFolder = zip.folder('assets');
    if (assetsFolder) {
      const assetsImages = assetsFolder.folder('images');
      if (assetsImages) {
        extractedImages.forEach((img) => {
          assetsImages.file(img.filename, img.base64Content, { base64: true });
        });
      }
      if (offlineFonts.length > 0) {
        const assetsFonts = assetsFolder.folder('fonts');
        if (assetsFonts) {
          offlineFonts.forEach((ff) => {
            const fontAsset = getOfflineFontAsset(ff);
            assetsFonts.file(fontAsset.filename, fontAsset.base64Data, { base64: true });
          });
        }
      }
    }

    zip.file('pubspec.yaml', `name: ${safeProjName}
description: Flutter layout exported from WebScape Vector Canvas.
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
flutter:
  uses-material-design: true
  assets:
    - images/
    - assets/images/
${offlineFonts.length > 0 ? '    - assets/fonts/\n' : ''}`);

    zip.file('README.md', `# ${projectName} (Flutter App)\n\n## How to Run\n\`\`\`bash\nflutter pub get\nflutter run\n\`\`\``);
  }

  return await zip.generateAsync({ type: 'blob' });
}
