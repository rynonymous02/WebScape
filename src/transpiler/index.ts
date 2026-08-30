import type { CanvasNode, TranspilerOutput } from '../types/canvas';
import { generateRawCSS } from './cssGenerator';
import { generateTailwind } from './tailwindMapper';
import { generateBootstrap } from './bootstrapMapper';
import { generateFlutter } from './flutterMapper';

export function runAllTranspilers(
  nodes: Record<string, CanvasNode>,
  rootNodeIds: string[]
): TranspilerOutput {
  const htmlCss = generateRawCSS(nodes, rootNodeIds);
  const tailwind = generateTailwind(nodes, rootNodeIds);
  const bootstrap = generateBootstrap(nodes, rootNodeIds);
  const flutter = generateFlutter(nodes, rootNodeIds);

  return {
    htmlCss,
    tailwind,
    bootstrap,
    flutter,
  };
}

export function generateSVGExport(
  nodes: Record<string, CanvasNode>,
  rootNodeIds: string[]
): string {
  // Calculate bounding box containing all root nodes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  rootNodeIds.forEach(id => {
    const node = nodes[id];
    if (node) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 800; maxY = 600;
  }

  const width = Math.max(100, maxX - minX + 40);
  const height = Math.max(100, maxY - minY + 40);

  function renderSvgNode(nodeId: string, offsetX: number = 0, offsetY: number = 0): string {
    const node = nodes[nodeId];
    if (!node || node.hidden) return '';

    const rx = node.x - minX + 20 + offsetX;
    const ry = node.y - minY + 20 + offsetY;

    if (node.type === 'frame' || node.type === 'rectangle') {
      const rectSvg = `<rect x="${rx}" y="${ry}" width="${node.width}" height="${node.height}" rx="${node.style.borderRadius}" fill="${node.style.fill}" stroke="${node.style.stroke}" stroke-width="${node.style.strokeWidth}" opacity="${node.style.opacity}" />`;
      const childrenSvg = node.children.map(cid => renderSvgNode(cid, 0, 0)).join('\n');
      return `${rectSvg}\n${childrenSvg}`;
    }

    if (node.type === 'ellipse') {
      const cx = rx + node.width / 2;
      const cy = ry + node.height / 2;
      const rxRad = node.width / 2;
      const ryRad = node.height / 2;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rxRad}" ry="${ryRad}" fill="${node.style.fill}" stroke="${node.style.stroke}" stroke-width="${node.style.strokeWidth}" opacity="${node.style.opacity}" />`;
    }

    if (node.type === 'text') {
      return `<text x="${rx}" y="${ry + node.style.fontSize}" font-family="${node.style.fontFamily}" font-size="${node.style.fontSize}" font-weight="${node.style.fontWeight}" fill="${node.style.textColor}" opacity="${node.style.opacity}">${node.text || ''}</text>`;
    }

    if (node.type === 'path' && node.pathPoints) {
      const d = node.pathPoints.reduce((acc, pt, i) => {
        const px = rx + pt.x;
        const py = ry + pt.y;
        if (i === 0) return `M ${px} ${py}`;
        if (pt.handleIn || pt.handleOut) {
          const cp1x = pt.handleIn ? rx + pt.handleIn.x : px;
          const cp1y = pt.handleIn ? ry + pt.handleIn.y : py;
          return `${acc} Q ${cp1x} ${cp1y}, ${px} ${py}`;
        }
        return `${acc} L ${px} ${py}`;
      }, '');

      return `<path d="${d}" fill="${node.style.fill}" stroke="${node.style.stroke}" stroke-width="${node.style.strokeWidth}" opacity="${node.style.opacity}" />`;
    }

    return '';
  }

  const bodySvg = rootNodeIds.map(id => renderSvgNode(id)).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${bodySvg}
</svg>`;
}
