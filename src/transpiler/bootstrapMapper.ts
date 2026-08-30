import type { CanvasNode, NodeStyle } from '../types/canvas';

function pxToBootstrapSpacing(px: number): number {
  if (px <= 0) return 0;
  if (px <= 4) return 1;
  if (px <= 8) return 2;
  if (px <= 16) return 3;
  if (px <= 24) return 4;
  return 5;
}

function hexToBootstrapColor(hex: string, prefix: string): string {
  if (!hex || hex === 'transparent') return '';
  const lower = hex.toLowerCase();

  const colorMap: Record<string, string> = {
    '#ffffff': `${prefix}-white`,
    '#000000': `${prefix}-dark`,
    '#3b82f6': `${prefix}-primary`,
    '#1d4ed8': `${prefix}-primary`,
    '#6366f1': `${prefix}-primary`,
    '#10b981': `${prefix}-success`,
    '#f59e0b': `${prefix}-warning`,
    '#ef4444': `${prefix}-danger`,
    '#0f172a': `${prefix}-dark`,
    '#1e293b': `${prefix}-dark`,
    '#f8fafc': `${prefix}-light`,
  };

  return colorMap[lower] || `${prefix}-primary`;
}

export function styleToBootstrapClasses(style: NodeStyle, node: CanvasNode): string[] {
  const classes: string[] = [];

  // Position
  const isRoot = !node.parentId;
  if (!isRoot) {
    const pos = style.position || 'static';
    if (pos === 'sticky') {
      classes.push('sticky-top', 'z-3');
    } else if (pos === 'fixed') {
      classes.push('fixed-top');
    } else if (pos === 'relative') {
      classes.push('position-relative');
    } else if (pos === 'absolute') {
      classes.push('position-absolute');
    }
  } else {
    classes.push('position-relative');
  }

  // Display & Flex
  if (style.display === 'flex') {
    classes.push('d-flex');
    if (style.flexDirection === 'column') classes.push('flex-column');

    // Justify
    if (style.justifyContent === 'center') classes.push('justify-content-center');
    else if (style.justifyContent === 'flex-end') classes.push('justify-content-end');
    else if (style.justifyContent === 'space-between') classes.push('justify-content-between');
    else if (style.justifyContent === 'space-around') classes.push('justify-content-around');
    else if (style.justifyContent === 'space-evenly') classes.push('justify-content-evenly');

    // Align
    if (style.alignItems === 'center') classes.push('align-items-center');
    else if (style.alignItems === 'flex-end') classes.push('align-items-end');
    else if (style.alignItems === 'stretch') classes.push('align-items-stretch');

    // Gap
    if (style.gap > 0) {
      classes.push(`gap-${pxToBootstrapSpacing(style.gap)}`);
    }
  }

  // Align Self
  if (!isRoot && style.alignSelf && style.alignSelf !== 'auto') {
    if (style.alignSelf === 'flex-start') classes.push('align-self-start');
    else if (style.alignSelf === 'center') classes.push('align-self-center');
    else if (style.alignSelf === 'flex-end') classes.push('align-self-end');
    else if (style.alignSelf === 'stretch') classes.push('align-self-stretch');
    else if (style.alignSelf === 'baseline') classes.push('align-self-baseline');
  }

  // Padding
  if (style.paddingTop > 0 || style.paddingRight > 0 || style.paddingBottom > 0 || style.paddingLeft > 0) {
    if (style.paddingTop === style.paddingRight && style.paddingRight === style.paddingBottom && style.paddingBottom === style.paddingLeft) {
      classes.push(`p-${pxToBootstrapSpacing(style.paddingTop)}`);
    } else {
      if (style.paddingTop > 0) classes.push(`pt-${pxToBootstrapSpacing(style.paddingTop)}`);
      if (style.paddingRight > 0) classes.push(`pe-${pxToBootstrapSpacing(style.paddingRight)}`);
      if (style.paddingBottom > 0) classes.push(`pb-${pxToBootstrapSpacing(style.paddingBottom)}`);
      if (style.paddingLeft > 0) classes.push(`ps-${pxToBootstrapSpacing(style.paddingLeft)}`);
    }
  }

  // Background
  if (style.fill && style.fill !== 'transparent') {
    const bgClass = hexToBootstrapColor(style.fill, 'bg');
    if (bgClass) classes.push(bgClass);
  }

  // Radius & Border
  if (style.borderRadius > 0) {
    if (style.borderRadius >= 999) classes.push('rounded-circle');
    else if (style.borderRadius >= 16) classes.push('rounded-4');
    else if (style.borderRadius >= 12) classes.push('rounded-3');
    else if (style.borderRadius >= 8) classes.push('rounded-2');
    else classes.push('rounded-1');
  }
  if (style.strokeWidth > 0 && style.stroke !== 'transparent') {
    classes.push('border');
    const borderClass = hexToBootstrapColor(style.stroke, 'border');
    if (borderClass) classes.push(borderClass);
  }

  // Shadow
  if (style.boxShadow && style.boxShadow !== 'none') {
    classes.push('shadow');
  }

  // Sizing
  if (style.sizingPreset === 'hero') {
    classes.push('w-100', 'min-vh-100');
  } else if (style.sizingPreset === 'banner') {
    classes.push('w-100');
  } else if (style.sizingPreset === 'contained') {
    classes.push('container');
  } else {
    if (style.widthUnit === '%') classes.push('w-100');
    if (style.heightUnit === 'vh' || style.heightUnit === 'min-vh') classes.push('min-vh-100');
  }

  // Typography
  if (node.type === 'text') {
    if (style.fontSize >= 32) classes.push('display-5');
    else if (style.fontSize >= 24) classes.push('h3');
    else if (style.fontSize >= 20) classes.push('h5');
    else if (style.fontSize <= 14) classes.push('small');

    if (Number(style.fontWeight) >= 600) classes.push('fw-bold');

    if (style.textColor) {
      const textClass = hexToBootstrapColor(style.textColor, 'text');
      if (textClass) classes.push(textClass);
    }

    if (style.textAlign === 'center') classes.push('text-center');
    else if (style.textAlign === 'right') classes.push('text-end');
  }

  return classes;
}

export function generateBootstrap(
  nodes: Record<string, CanvasNode>,
  rootNodeIds: string[]
): { html: string; jsx: string } {
  function processNode(nodeId: string, depth: number = 0, isJsx: boolean = false): string {
    const node = nodes[nodeId];
    if (!node || node.hidden) return '';

    const indent = '  '.repeat(depth);
    const classes = styleToBootstrapClasses(node.style, node).join(' ');
    const attrName = isJsx ? 'className' : 'class';

    if (node.type === 'text') {
      const tag = node.style.fontSize >= 20 ? 'h2' : 'p';
      return `${indent}<${tag} ${attrName}="${classes}">${node.text || ''}</${tag}>`;
    }

    if (node.type === 'image') {
      if (node.style.imageType === 'vector' && node.style.svgContent) {
        return `${indent}<div ${attrName}="${classes}">\n${indent}  ${node.style.svgContent}\n${indent}</div>`;
      }
      return `${indent}<img ${attrName}="${classes} img-fluid" src="${node.style.imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'}" alt="${node.name}" />`;
    }

    if (node.type === 'ellipse' || node.type === 'rectangle' || node.type === 'frame') {
      const tag = 'div';
      if (node.children.length === 0) {
        return `${indent}<${tag} ${attrName}="${classes}"></${tag}>`;
      }
      const childrenHtml = node.children
        .map(childId => processNode(childId, depth + 1, isJsx))
        .filter(Boolean)
        .join('\n');
      return `${indent}<${tag} ${attrName}="${classes}">\n${childrenHtml}\n${indent}</${tag}>`;
    }

    return '';
  }

  const html = rootNodeIds.map(id => processNode(id, 0, false)).join('\n\n');
  const jsxBody = rootNodeIds.map(id => processNode(id, 1, true)).join('\n\n');

  const jsx = `import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function WebScapeBootstrapComponent() {
  return (
${jsxBody}
  );
}`;

  return { html, jsx };
}
