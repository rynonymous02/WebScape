import type { CanvasNode, NodeStyle } from '../types/canvas';
import { createDefaultStyle } from '../utils/defaults';

export const generateRawCSS = (
  nodes: Record<string, CanvasNode> = {},
  rootNodeIds: string[] = [],
  projectName: string = 'Untitled Vector Design'
): { html: string; css: string; fullDocument: string } => {
  const cssRules: string[] = [];

  // Identify primary root frame for page wrapper styling
  const primaryRootNode = rootNodeIds.length > 0 ? nodes[rootNodeIds[0]] : null;
  const primaryBg = (primaryRootNode?.style?.fill && primaryRootNode.style.fill !== 'transparent')
    ? primaryRootNode.style.fill
    : (primaryRootNode?.style?.gradientColor1 || '#020617');

  // Helper to convert node name to safe CSS class name
  const getClassName = (node: CanvasNode): string => {
    const cleanName = (node.name || 'node').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    return `${cleanName}-${(node.id || '').replace('node_', '')}`;
  };

  const generateNodeCSS = (node: CanvasNode) => {
    if (!node) return;
    const className = getClassName(node);
    const s: NodeStyle = node.style || createDefaultStyle();
    const rules: string[] = [];
    const isRoot = !node.parentId;

    // Position handling
    if (!isRoot) {
      const pos = s.position || 'static';
      if (pos && pos !== 'static') {
        rules.push(`  position: ${pos};`);
        if (pos === 'absolute' || pos === 'fixed') {
          rules.push(`  left: ${node.x}px;`);
          rules.push(`  top: ${node.y}px;`);
        } else if (pos === 'relative' && (node.x !== 0 || node.y !== 0)) {
          rules.push(`  left: ${node.x}px;`);
          rules.push(`  top: ${node.y}px;`);
        } else if (pos === 'sticky') {
          rules.push(`  top: 0px;`);
        }
        if (s.zIndex && s.zIndex > 1) {
          rules.push(`  z-index: ${s.zIndex};`);
        } else if (pos === 'sticky') {
          rules.push(`  z-index: 50;`);
        }
      }
    } else {
      rules.push(`  position: relative;`);
      if (s.zIndex && s.zIndex > 1) {
        rules.push(`  z-index: ${s.zIndex};`);
      }
    }

    // Display & Flexbox
    if (node.type === 'frame') {
      rules.push(`  display: ${s.display || 'flex'};`);
      if (s.display === 'flex') {
        rules.push(`  flex-direction: ${s.flexDirection || 'column'};`);
        rules.push(`  justify-content: ${s.justifyContent || 'flex-start'};`);
        rules.push(`  align-items: ${s.alignItems || 'flex-start'};`);
        if (s.gap && s.gap > 0) rules.push(`  gap: ${s.gap}px;`);
      }
    } else {
      rules.push(`  display: block;`);
    }

    // Align Self (for children inside flex containers)
    if (!isRoot && s.alignSelf && s.alignSelf !== 'auto') {
      rules.push(`  align-self: ${s.alignSelf};`);
    }

    // Padding
    if (s.paddingTop || s.paddingRight || s.paddingBottom || s.paddingLeft) {
      rules.push(`  padding: ${s.paddingTop || 0}px ${s.paddingRight || 0}px ${s.paddingBottom || 0}px ${s.paddingLeft || 0}px;`);
    }

    // Dimensions
    if (isRoot) {
      rules.push(`  width: 100%;`);
      rules.push(`  max-width: ${node.width}px;`);
      rules.push(`  min-height: ${node.height}px;`);
      rules.push(`  margin: 0 auto;`);
      rules.push(`  box-sizing: border-box;`);
    } else {
      if (node.width > 0) rules.push(`  width: ${node.width}px;`);
      if (node.height > 0) rules.push(`  height: ${node.height}px;`);
      rules.push(`  box-sizing: border-box;`);
    }

    // Colors & Background Image
    if (s.fill && s.fill !== 'transparent') {
      rules.push(`  background-color: ${s.fill};`);
    }
    
    const color = s.overlayColor || '#000000';
    const angle = s.overlayAngle ?? 90;
    const startOpacity = s.overlayStartOpacity ?? (s.overlayOpacity || 0);
    const endOpacity = s.overlayEndOpacity ?? 0;
    const startPos = s.overlayStartPos ?? 0;
    const endPos = s.overlayEndPos ?? 100;

    let overlayGrad: string | null = null;
    if (startOpacity > 0 || endOpacity > 0) {
      const hexToRgba = (hex: string, alpha: number) => {
        let clean = (hex || '#000000').replace('#', '');
        if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        if (clean.length !== 6) return `rgba(0, 0, 0, ${alpha})`;
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      overlayGrad = `linear-gradient(${angle}deg, ${hexToRgba(color, startOpacity)} ${startPos}%, ${hexToRgba(color, endOpacity)} ${endPos}%)`;
    }

    let baseBgStr: string | undefined = undefined;
    if (s.backgroundType === 'gradient' && s.gradientFill) {
      baseBgStr = s.gradientFill;
    } else if (s.backgroundType === 'mesh' && s.meshGradient) {
      baseBgStr = s.meshGradient;
    } else if (s.backgroundImage) {
      baseBgStr = `url('${s.backgroundImage}')`;
    }

    const finalBgImage = (overlayGrad && baseBgStr) ? `${overlayGrad}, ${baseBgStr}` : (overlayGrad || baseBgStr);
    if (finalBgImage) {
      rules.push(`  background-image: ${finalBgImage};`);
      if (s.backgroundImage) {
        rules.push(`  background-size: ${s.backgroundSize || 'cover'};`);
        rules.push(`  background-position: ${s.backgroundPosition || 'center'};`);
        rules.push(`  background-repeat: ${s.backgroundRepeat || 'no-repeat'};`);
      }
    }

    // Borders & Shadow
    const tl = s.borderTopLeftRadius ?? s.borderRadius ?? 0;
    const tr = s.borderTopRightRadius ?? s.borderRadius ?? 0;
    const br = s.borderBottomRightRadius ?? s.borderRadius ?? 0;
    const bl = s.borderBottomLeftRadius ?? s.borderRadius ?? 0;
    if (tl > 0 || tr > 0 || br > 0 || bl > 0) {
      if (tl === tr && tr === br && br === bl) {
        rules.push(`  border-radius: ${tl}px;`);
      } else {
        rules.push(`  border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`);
      }
    }
    if (s.strokeWidth && s.strokeWidth > 0 && s.stroke && s.stroke !== 'transparent') {
      rules.push(`  border: ${s.strokeWidth}px ${s.borderStyle || 'solid'} ${s.stroke};`);
    }
    if (s.boxShadow && s.boxShadow !== 'none') {
      rules.push(`  box-shadow: ${s.boxShadow};`);
    }
    if (s.opacity !== undefined && s.opacity < 1) {
      rules.push(`  opacity: ${s.opacity};`);
    }

    // Typography
    if (node.type === 'text') {
      rules.push(`  font-family: ${s.fontFamily || 'Inter, sans-serif'};`);
      rules.push(`  font-size: ${s.fontSize || 16}px;`);
      rules.push(`  font-weight: ${s.fontWeight || 400};`);
      rules.push(`  color: ${s.textColor || '#ffffff'};`);
      rules.push(`  line-height: ${s.lineHeight || 1.5};`);
      if (s.letterSpacing !== undefined && s.letterSpacing !== 0) {
        rules.push(`  letter-spacing: ${s.letterSpacing}px;`);
      }
      rules.push(`  text-align: ${s.textAlign || 'left'};`);
    }

    cssRules.push(`.${className} {\n${rules.join('\n')}\n}`);

    if (node.children) {
      node.children.forEach((childId) => {
        if (nodes[childId]) {
          generateNodeCSS(nodes[childId]);
        }
      });
    }
  };

  const generateNodeHTML = (nodeId: string, indent: number = 2): string => {
    const node = nodes[nodeId];
    if (!node || node.hidden) return '';

    const spaces = ' '.repeat(indent);
    const className = getClassName(node);

    if (node.type === 'text') {
      const Tag = (node.style?.fontSize || 16) >= 20 ? 'h2' : 'p';
      return `${spaces}<${Tag} class="${className}">${node.text || ''}</${Tag}>`;
    }

    if (node.type === 'frame' || node.type === 'rectangle' || node.type === 'ellipse') {
      let Tag = 'div';
      if (node.type === 'frame') {
        if (node.frameRole === 'section') Tag = 'section';
        else if (node.frameRole === 'wrapper' && !node.parentId) Tag = 'main';
      }

      if (node.children && node.children.length > 0) {
        const innerHTML = node.children
          .map((cid) => generateNodeHTML(cid, indent + 2))
          .filter(Boolean)
          .join('\n');
        return `${spaces}<${Tag} class="${className}">\n${innerHTML}\n${spaces}</${Tag}>`;
      }
      return `${spaces}<${Tag} class="${className}"></${Tag}>`;
    }

    if (node.type === 'path' && node.pathPoints) {
      const d = node.pathPoints.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`;
        if (pt.handleIn || pt.handleOut) {
          const cp1x = pt.handleIn ? pt.handleIn.x : pt.x;
          const cp1y = pt.handleIn ? pt.handleIn.y : pt.y;
          return `${acc} Q ${cp1x} ${cp1y}, ${pt.x} ${pt.y}`;
        }
        return `${acc} L ${pt.x} ${pt.y}`;
      }, '');
      return `${spaces}<svg class="${className}" width="${node.width}" height="${node.height}" viewBox="0 0 ${node.width} ${node.height}"><path d="${d}" fill="${node.style.fill}" stroke="${node.style.stroke}" stroke-width="${node.style.strokeWidth}" /></svg>`;
    }

    return '';
  };

  // Generate CSS rules and HTML body
  (rootNodeIds || []).forEach((rid) => {
    if (nodes[rid]) {
      generateNodeCSS(nodes[rid]);
    }
  });

  const htmlBody = (rootNodeIds || [])
    .map((rid) => generateNodeHTML(rid, 4))
    .filter(Boolean)
    .join('\n');

  const css = cssRules.join('\n\n');

  const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - WebScape Export</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html {
      scroll-behavior: smooth;
    }
    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background-color: ${primaryBg};
      color: #f8fafc;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      overflow-x: clip;
      position: relative;
    }
${css.split('\n').map(line => '    ' + line).join('\n')}
  </style>
</head>
<body>
${htmlBody}
</body>
</html>`;

  return {
    html: htmlBody,
    css,
    fullDocument,
  };
};
