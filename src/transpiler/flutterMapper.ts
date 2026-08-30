import type { CanvasNode, NodeStyle } from '../types/canvas';
import { createDefaultStyle } from '../utils/defaults';

function hexToFlutterColor(hex?: string, opacity: number = 1): string {
  if (!hex || hex === 'transparent') {
    return 'Colors.transparent';
  }
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  if (clean.length === 6) {
    const alphaHex = Math.round(Math.min(1, Math.max(0, opacity)) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
    return `const Color(0x${alphaHex}${clean.toUpperCase()})`;
  }
  if (clean.length === 8) {
    return `const Color(0x${clean.toUpperCase()})`;
  }
  return 'const Color(0xFF000000)';
}

function mapMainAxisAlignment(justify?: string): string {
  switch (justify) {
    case 'center': return 'MainAxisAlignment.center';
    case 'flex-end': return 'MainAxisAlignment.end';
    case 'space-between': return 'MainAxisAlignment.spaceBetween';
    case 'space-around': return 'MainAxisAlignment.spaceAround';
    case 'space-evenly': return 'MainAxisAlignment.spaceEvenly';
    case 'flex-start':
    default:
      return 'MainAxisAlignment.start';
  }
}

function mapCrossAxisAlignment(align?: string): string {
  switch (align) {
    case 'center': return 'CrossAxisAlignment.center';
    case 'flex-end': return 'CrossAxisAlignment.end';
    case 'stretch': return 'CrossAxisAlignment.stretch';
    case 'baseline': return 'CrossAxisAlignment.baseline';
    case 'flex-start':
    default:
      return 'CrossAxisAlignment.start';
  }
}

function mapFontWeight(weight?: string | number): string {
  const w = String(weight || '400');
  switch (w) {
    case '100': return 'FontWeight.w100';
    case '200': return 'FontWeight.w200';
    case '300': return 'FontWeight.w300';
    case '400': case 'normal': return 'FontWeight.w400';
    case '500': return 'FontWeight.w500';
    case '600': return 'FontWeight.w600';
    case '700': case 'bold': return 'FontWeight.w700';
    case '800': return 'FontWeight.w800';
    case '900': return 'FontWeight.w900';
    default: return 'FontWeight.w400';
  }
}

function mapTextAlign(align?: string): string {
  switch (align) {
    case 'center': return 'TextAlign.center';
    case 'right': return 'TextAlign.right';
    case 'justify': return 'TextAlign.justify';
    case 'left':
    default:
      return 'TextAlign.left';
  }
}

export const generateFlutter = (
  nodes: Record<string, CanvasNode> = {},
  rootNodeIds: string[] = []
): { widget: string; fullFile: string } => {
  function renderNode(nodeId: string, indentLevel: number = 2): string {
    const node = nodes[nodeId];
    if (!node || node.hidden) return '';

    const s: NodeStyle = node.style || createDefaultStyle();
    const indent = '  '.repeat(indentLevel);
    const innerIndent = '  '.repeat(indentLevel + 1);

    // 1. TEXT NODE
    if (node.type === 'text') {
      const textContent = (node.text || 'Text')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n');

      const styleProps: string[] = [];
      if (s.fontFamily && s.fontFamily !== 'sans-serif' && s.fontFamily !== 'Inter') {
        styleProps.push(`fontFamily: '${s.fontFamily}'`);
      }
      if (s.fontSize) {
        styleProps.push(`fontSize: ${s.fontSize}`);
      }
      if (s.fontWeight) {
        styleProps.push(`fontWeight: ${mapFontWeight(s.fontWeight)}`);
      }
      if (s.textColor && s.textColor !== 'transparent') {
        styleProps.push(`color: ${hexToFlutterColor(s.textColor, s.opacity ?? 1)}`);
      }
      if (s.lineHeight) {
        styleProps.push(`height: ${s.lineHeight}`);
      }
      if (s.letterSpacing) {
        styleProps.push(`letterSpacing: ${s.letterSpacing}`);
      }
      if (s.fontStyle === 'italic') {
        styleProps.push(`fontStyle: FontStyle.italic`);
      }

      const styleStr = styleProps.length > 0 
        ? `,\n${innerIndent}style: TextStyle(\n${innerIndent}  ${styleProps.join(`,\n${innerIndent}  `)},\n${innerIndent})`
        : '';

      const alignStr = s.textAlign && s.textAlign !== 'left'
        ? `,\n${innerIndent}textAlign: ${mapTextAlign(s.textAlign)}`
        : '';

      return `${indent}Text(\n${innerIndent}'${textContent}'${alignStr}${styleStr},\n${indent})`;
    }

    // 2. ELLIPSE / CIRCLE
    if (node.type === 'ellipse') {
      const decorProps: string[] = ['shape: BoxShape.circle'];
      if (s.fill && s.fill !== 'transparent') {
        decorProps.push(`color: ${hexToFlutterColor(s.fill, s.opacity ?? 1)}`);
      }
      if (s.stroke && s.stroke !== 'transparent' && (s.strokeWidth ?? 0) > 0) {
        decorProps.push(`border: Border.all(color: ${hexToFlutterColor(s.stroke)}, width: ${s.strokeWidth})`);
      }

      return `${indent}Container(\n${innerIndent}width: ${node.width},\n${innerIndent}height: ${node.height},\n${innerIndent}decoration: BoxDecoration(\n${innerIndent}  ${decorProps.join(`,\n${innerIndent}  `)},\n${innerIndent}),\n${indent})`;
    }

    // 3. FRAME / RECTANGLE CONTAINER
    const children = (node.children || []).map(cid => nodes[cid]).filter(Boolean);
    const hasChildren = children.length > 0;
    const isFlex = s.display === 'flex';
    const isCol = s.flexDirection === 'column' || s.flexDirection === 'column-reverse';

    // Build BoxDecoration
    const decorProps: string[] = [];

    // Background color / Gradient
    if (s.backgroundType === 'gradient' && s.gradientColor1 && s.gradientColor2) {
      const c1 = hexToFlutterColor(s.gradientColor1, s.gradientOpacity ?? 1);
      const c2 = hexToFlutterColor(s.gradientColor2, s.gradientOpacity ?? 1);
      if (s.gradientType === 'radial') {
        decorProps.push(`gradient: RadialGradient(colors: [${c1}, ${c2}])`);
      } else {
        decorProps.push(`gradient: LinearGradient(\n${innerIndent}    begin: Alignment.topLeft,\n${innerIndent}    end: Alignment.bottomRight,\n${innerIndent}    colors: [${c1}, ${c2}],\n${innerIndent}  )`);
      }
    } else if (s.fill && s.fill !== 'transparent') {
      decorProps.push(`color: ${hexToFlutterColor(s.fill, s.opacity ?? 1)}`);
    }

    // Border radius
    const tl = s.borderTopLeftRadius ?? s.borderRadius ?? 0;
    const tr = s.borderTopRightRadius ?? s.borderRadius ?? 0;
    const br = s.borderBottomRightRadius ?? s.borderRadius ?? 0;
    const bl = s.borderBottomLeftRadius ?? s.borderRadius ?? 0;
    if (tl > 0 || tr > 0 || br > 0 || bl > 0) {
      if (tl === tr && tr === br && br === bl) {
        decorProps.push(`borderRadius: BorderRadius.circular(${tl})`);
      } else {
        decorProps.push(`borderRadius: const BorderRadius.only(\n${innerIndent}    topLeft: Radius.circular(${tl}),\n${innerIndent}    topRight: Radius.circular(${tr}),\n${innerIndent}    bottomRight: Radius.circular(${br}),\n${innerIndent}    bottomLeft: Radius.circular(${bl}),\n${innerIndent}  )`);
      }
    }

    // Border stroke
    if (s.stroke && s.stroke !== 'transparent' && (s.strokeWidth ?? 0) > 0) {
      decorProps.push(`border: Border.all(color: ${hexToFlutterColor(s.stroke)}, width: ${s.strokeWidth})`);
    }

    // Box Shadow
    if (s.boxShadow && s.boxShadow !== 'none') {
      decorProps.push(`boxShadow: const [\n${innerIndent}    BoxShadow(\n${innerIndent}      color: Color(0x33000000),\n${innerIndent}      blurRadius: 12,\n${innerIndent}      offset: Offset(0, 4),\n${innerIndent}    ),\n${innerIndent}  ]`);
    }

    // Container properties
    const containerProps: string[] = [];

    if (!node.parentId) {
      // Root element sizing
      containerProps.push(`width: double.infinity`);
      containerProps.push(`constraints: const BoxConstraints(maxWidth: ${node.width}, minHeight: ${node.height})`);
    } else {
      if (node.width > 0) containerProps.push(`width: ${node.width}`);
      if (node.height > 0) containerProps.push(`height: ${node.height}`);
    }

    // Padding
    const pt = s.paddingTop || 0;
    const pr = s.paddingRight || 0;
    const pb = s.paddingBottom || 0;
    const pl = s.paddingLeft || 0;
    if (pt > 0 || pr > 0 || pb > 0 || pl > 0) {
      if (pt === pr && pr === pb && pb === pl) {
        containerProps.push(`padding: const EdgeInsets.all(${pt})`);
      } else if (pt === pb && pl === pr) {
        containerProps.push(`padding: const EdgeInsets.symmetric(vertical: ${pt}, horizontal: ${pl})`);
      } else {
        containerProps.push(`padding: const EdgeInsets.only(top: ${pt}, right: ${pr}, bottom: ${pb}, left: ${pl})`);
      }
    }

    if (decorProps.length > 0) {
      containerProps.push(`decoration: BoxDecoration(\n${innerIndent}  ${decorProps.join(`,\n${innerIndent}  `)},\n${innerIndent})`);
    }

    // Child Content
    if (hasChildren) {
      if (isFlex) {
        const layoutWidget = isCol ? 'Column' : 'Row';
        const mainAlign = mapMainAxisAlignment(s.justifyContent);
        const crossAlign = mapCrossAxisAlignment(s.alignItems);
        const gap = s.gap || 0;

        const renderedChildren: string[] = [];
        children.forEach((child, idx) => {
          if (idx > 0 && gap > 0) {
            renderedChildren.push(
              isCol 
                ? `${innerIndent}  const SizedBox(height: ${gap}),` 
                : `${innerIndent}  const SizedBox(width: ${gap}),`
            );
          }
          renderedChildren.push(renderNode(child.id, indentLevel + 2) + ',');
        });

        const flexContent = [
          `mainAxisAlignment: ${mainAlign},`,
          `crossAxisAlignment: ${crossAlign},`,
          `children: [\n${renderedChildren.join('\n')}\n${innerIndent}],`
        ].join(`\n${innerIndent}`);

        containerProps.push(`child: ${layoutWidget}(\n${innerIndent}${flexContent}\n${innerIndent})`);
      } else {
        // Absolute / Stack layout
        const renderedChildren = children.map(child => {
          const childWidget = renderNode(child.id, indentLevel + 3);
          return `${innerIndent}  Positioned(\n${innerIndent}    left: ${child.x},\n${innerIndent}    top: ${child.y},\n${innerIndent}    child: ${childWidget.trimStart()},\n${innerIndent}  ),`;
        });

        containerProps.push(`child: Stack(\n${innerIndent}  clipBehavior: Clip.none,\n${innerIndent}  children: [\n${renderedChildren.join('\n')}\n${innerIndent}  ],\n${innerIndent})`);
      }
    }

    return `${indent}Container(\n${innerIndent}${containerProps.join(`,\n${innerIndent}`)},\n${indent})`;
  }

  const renderedRoots = rootNodeIds
    .map(id => renderNode(id, 3))
    .filter(Boolean);

  const rootWidgetBody = renderedRoots.length === 1 
    ? renderedRoots[0].trimStart()
    : `Column(\n      mainAxisSize: MainAxisSize.min,\n      children: [\n${renderedRoots.map(r => r + ',').join('\n')}\n      ],\n    )`;

  const widget = `import 'package:flutter/material.dart';

class WebScapeDesign extends StatelessWidget {
  const WebScapeDesign({super.key});

  @override
  Widget build(BuildContext context) {
    return ${rootWidgetBody};
  }
}`;

  const fullFile = `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WebScape Flutter Export',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      home: const Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16.0),
              child: WebScapeDesign(),
            ),
          ),
        ),
      ),
    );
  }
}

class WebScapeDesign extends StatelessWidget {
  const WebScapeDesign({super.key});

  @override
  Widget build(BuildContext context) {
    return ${rootWidgetBody};
  }
}
`;

  return { widget, fullFile };
};
