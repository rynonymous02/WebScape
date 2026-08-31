import type { CanvasNode, NodeStyle } from '../types/canvas';
import { createDefaultStyle } from '../utils/defaults';

export const generateTailwind = (
  nodes: Record<string, CanvasNode> = {},
  rootNodeIds: string[] = []
): { html: string; jsx: string } => {
  const primaryRootNode = rootNodeIds.length > 0 ? nodes[rootNodeIds[0]] : null;
  const primaryBg = (primaryRootNode?.style?.fill && primaryRootNode.style.fill !== 'transparent')
    ? primaryRootNode.style.fill
    : '#0f172a';

  const mapNodeToTailwind = (node: CanvasNode): string[] => {
    const classes: string[] = [];
    const s: NodeStyle = node.style || createDefaultStyle();
    const isRoot = !node.parentId;

    // Position handling
    if (!isRoot) {
      const pos = s.position || 'absolute';
      if (pos && pos !== 'static') {
        classes.push(pos);
        if (pos === 'sticky') {
          classes.push(s.top !== undefined ? `top-[${s.top}px]` : 'top-0');
          if (s.left !== undefined) classes.push(`left-[${s.left}px]`);
          if (s.right !== undefined) classes.push(`right-[${s.right}px]`);
          if (s.bottom !== undefined) classes.push(`bottom-[${s.bottom}px]`);
          classes.push('z-50');
        } else if (pos === 'absolute' || pos === 'fixed') {
          classes.push(`left-[${s.left !== undefined ? s.left : node.x}px]`);
          classes.push(`top-[${s.top !== undefined ? s.top : node.y}px]`);
          if (s.right !== undefined) classes.push(`right-[${s.right}px]`);
          if (s.bottom !== undefined) classes.push(`bottom-[${s.bottom}px]`);
        } else if (pos === 'relative') {
          if (s.left !== undefined) classes.push(`left-[${s.left}px]`);
          if (s.top !== undefined) classes.push(`top-[${s.top}px]`);
          if (s.right !== undefined) classes.push(`right-[${s.right}px]`);
          if (s.bottom !== undefined) classes.push(`bottom-[${s.bottom}px]`);
        }
        if (pos !== 'sticky' && s.zIndex && s.zIndex > 1) {
          classes.push(`z-[${s.zIndex}]`);
        }
      }
    } else {
      classes.push('relative');
      if (s.zIndex && s.zIndex > 1) {
        classes.push(`z-[${s.zIndex}]`);
      }
    }

    // Display & Flexbox
    if (node.type === 'frame') {
      if (s.display === 'flex') {
        classes.push('flex');
        if (s.flexDirection === 'column') classes.push('flex-col');
        else if (s.flexDirection === 'row-reverse') classes.push('flex-row-reverse');
        else if (s.flexDirection === 'column-reverse') classes.push('flex-col-reverse');
        else classes.push('flex-row');

        if (s.justifyContent === 'center') classes.push('justify-center');
        else if (s.justifyContent === 'flex-end') classes.push('justify-end');
        else if (s.justifyContent === 'space-between') classes.push('justify-between');
        else if (s.justifyContent === 'space-around') classes.push('justify-around');
        else if (s.justifyContent === 'space-evenly') classes.push('justify-evenly');
        else classes.push('justify-start');

        if (s.alignItems === 'center') classes.push('items-center');
        else if (s.alignItems === 'flex-end') classes.push('items-end');
        else if (s.alignItems === 'stretch') classes.push('items-stretch');
        else if (s.alignItems === 'baseline') classes.push('items-baseline');
        else classes.push('items-start');

        if (s.gap && s.gap > 0) classes.push(`gap-[${s.gap}px]`);
      } else {
        classes.push('block');
      }
    } else {
      classes.push('block');
    }

    // Align Self
    if (!isRoot && s.alignSelf && s.alignSelf !== 'auto') {
      if (s.alignSelf === 'flex-start') classes.push('self-start');
      else if (s.alignSelf === 'center') classes.push('self-center');
      else if (s.alignSelf === 'flex-end') classes.push('self-end');
      else if (s.alignSelf === 'stretch') classes.push('self-stretch');
      else if (s.alignSelf === 'baseline') classes.push('self-baseline');
    }

    // Padding
    if (s.paddingTop || s.paddingRight || s.paddingBottom || s.paddingLeft) {
      if (s.paddingTop === s.paddingBottom && s.paddingLeft === s.paddingRight && s.paddingTop === s.paddingLeft) {
        classes.push(`p-[${s.paddingTop}px]`);
      } else {
        if (s.paddingTop === s.paddingBottom && s.paddingTop) classes.push(`py-[${s.paddingTop}px]`);
        else {
          if (s.paddingTop) classes.push(`pt-[${s.paddingTop}px]`);
          if (s.paddingBottom) classes.push(`pb-[${s.paddingBottom}px]`);
        }
        if (s.paddingLeft === s.paddingRight && s.paddingLeft) classes.push(`px-[${s.paddingLeft}px]`);
        else {
          if (s.paddingLeft) classes.push(`pl-[${s.paddingLeft}px]`);
          if (s.paddingRight) classes.push(`pr-[${s.paddingRight}px]`);
        }
      }
    }

    // Width & Height
    if (isRoot) {
      classes.push(`w-full max-w-[${node.width}px] min-h-[${node.height}px] mx-auto`);
    } else {
      if (s.sizingPreset === 'hero') {
        classes.push('w-full', 'min-h-screen');
      } else if (s.sizingPreset === 'banner') {
        classes.push('w-full', 'h-auto');
      } else if (s.sizingPreset === 'contained') {
        classes.push('w-full', 'mx-auto');
        if (node.width > 0) classes.push(`max-w-[${node.width}px]`);
        if (node.height > 0) classes.push(`min-h-[${node.height}px]`);
      } else if (s.sizingPreset === 'fit-content') {
        classes.push('w-fit');
        if (node.height > 0) classes.push(`h-[${node.height}px]`);
      } else {
        const wUnit = s.widthUnit || 'px';
        const hUnit = s.heightUnit || 'px';
        const wVal = s.customWidthVal !== undefined ? s.customWidthVal : node.width;
        const hVal = s.customHeightVal !== undefined ? s.customHeightVal : node.height;

        if (wUnit === 'auto') classes.push('w-auto');
        else if (wUnit === '%' && wVal === 100) classes.push('w-full');
        else if (wUnit === '%') classes.push(`w-[${wVal}%]`);
        else if (wUnit === 'vw' && wVal === 100) classes.push('w-screen');
        else if (wUnit === 'vw') classes.push(`w-[${wVal}vw]`);
        else if (wVal > 0) classes.push(`w-[${wVal}px]`);

        if (hUnit === 'auto') classes.push('h-auto');
        else if (hUnit === '%' && hVal === 100) classes.push('h-full');
        else if (hUnit === '%') classes.push(`h-[${hVal}%]`);
        else if (hUnit === 'vh' && hVal === 100) classes.push('h-screen');
        else if (hUnit === 'vh') classes.push(`h-[${hVal}vh]`);
        else if (hUnit === 'min-vh' && hVal === 100) classes.push('min-h-screen');
        else if (hUnit === 'min-vh') classes.push(`min-h-[${hVal}vh]`);
        else if (hVal > 0) classes.push(`h-[${hVal}px]`);
      }

      if (s.maxWidth) classes.push(`max-w-[${typeof s.maxWidth === 'number' ? `${s.maxWidth}px` : s.maxWidth}]`);
      if (s.minHeight && s.sizingPreset !== 'hero') classes.push(`min-h-[${typeof s.minHeight === 'number' ? `${s.minHeight}px` : s.minHeight}]`);
    }

    // Background Color & Image
    if (s.fill && s.fill !== 'transparent') {
      classes.push(`bg-[${s.fill}]`);
    }
    if (s.backgroundImage) {
      classes.push(`bg-cover bg-center bg-no-repeat`);
    }

    // Borders & Shadows
    const tl = s.borderTopLeftRadius ?? s.borderRadius ?? 0;
    const tr = s.borderTopRightRadius ?? s.borderRadius ?? 0;
    const br = s.borderBottomRightRadius ?? s.borderRadius ?? 0;
    const bl = s.borderBottomLeftRadius ?? s.borderRadius ?? 0;
    if (tl > 0 || tr > 0 || br > 0 || bl > 0) {
      if (tl >= 9999) {
        classes.push('rounded-full');
      } else if (tl === tr && tr === br && br === bl) {
        classes.push(`rounded-[${tl}px]`);
      } else {
        if (tl > 0) classes.push(`rounded-tl-[${tl}px]`);
        if (tr > 0) classes.push(`rounded-tr-[${tr}px]`);
        if (br > 0) classes.push(`rounded-br-[${br}px]`);
        if (bl > 0) classes.push(`rounded-bl-[${bl}px]`);
      }
    }
    if (s.strokeWidth && s.strokeWidth > 0 && s.stroke && s.stroke !== 'transparent') {
      classes.push(`border-[${s.strokeWidth}px]`);
      classes.push(`border-[${s.stroke}]`);
    }
    if (s.boxShadow && s.boxShadow !== 'none') {
      classes.push('shadow-lg');
    }
    if (s.backdropBlur && s.backdropBlur > 0) {
      classes.push(`backdrop-blur-[${s.backdropBlur}px]`);
    }
    if (s.opacity !== undefined && s.opacity < 1) {
      classes.push(`opacity-[${s.opacity}]`);
    }
    if (s.overflow) {
      classes.push(`overflow-${s.overflow}`);
    } else if (node.type === 'frame') {
      classes.push(node.frameRole === 'wrapper' ? 'overflow-visible' : 'overflow-hidden');
    } else if (node.type === 'rectangle' || node.type === 'ellipse') {
      classes.push('overflow-hidden');
    }

    // Typography
    if (node.type === 'text') {
      classes.push(`text-[${s.fontSize || 16}px]`);
      if (Number(s.fontWeight) >= 700) classes.push('font-bold');
      else if (Number(s.fontWeight) >= 600) classes.push('font-semibold');
      else if (Number(s.fontWeight) >= 500) classes.push('font-medium');
      else classes.push('font-normal');

      classes.push(`text-[${s.textColor || '#ffffff'}]`);
      if (s.textAlign === 'center') classes.push('text-center');
      else if (s.textAlign === 'right') classes.push('text-right');
      else classes.push('text-left');

      if (s.textTransform === 'uppercase') classes.push('uppercase');
      else if (s.textTransform === 'capitalize') classes.push('capitalize');
      else if (s.textTransform === 'lowercase') classes.push('lowercase');
    }

    // Image & Vector
    if (node.type === 'image') {
      if (s.objectFit) classes.push(`object-${s.objectFit}`);
      if (s.blendMode && s.blendMode !== 'normal') classes.push(`mix-blend-${s.blendMode}`);
      if (s.imageType === 'vector') {
        classes.push('flex items-center justify-center [&>svg]:w-full [&>svg]:h-full');
        if (s.vectorColor) classes.push(`text-[${s.vectorColor}] fill-[${s.vectorColor}]`);
      }
    }

    return classes;
  };

  const renderTailwindHTML = (nodeId: string, indent: number = 2): string => {
    const node = nodes[nodeId];
    if (!node || node.hidden) return '';

    const spaces = ' '.repeat(indent);
    const classList = mapNodeToTailwind(node).join(' ');
    const bgStyle = node.style.backgroundImage ? ` style="background-image: url('${node.style.backgroundImage}');"` : '';

    if (node.type === 'text') {
      const Tag = (node.style?.fontSize || 16) >= 20 ? 'h2' : 'p';
      return `${spaces}<${Tag} class="${classList}">${node.text || ''}</${Tag}>`;
    }

    if (node.type === 'image') {
      if (node.style.imageType === 'vector' && node.style.svgContent) {
        const cleanSvg = node.style.svgContent.replace(/<svg\b([^>]*)>/i, (_match, p1) => {
          let attr = p1;
          if (!attr.includes('width=')) attr += ' width="100%"';
          else attr = attr.replace(/width="[^"]*"/, 'width="100%"');
          if (!attr.includes('height=')) attr += ' height="100%"';
          else attr = attr.replace(/height="[^"]*"/, 'height="100%"');
          if (!attr.includes('preserveAspectRatio=')) attr += ' preserveAspectRatio="xMidYMid meet"';
          return `<svg ${attr}>`;
        });
        return `${spaces}<div class="${classList}">\n${spaces}  ${cleanSvg}\n${spaces}</div>`;
      }
      return `${spaces}<img class="${classList}" src="${node.style.imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'}" alt="${node.name}" />`;
    }

    if (node.type === 'frame' || node.type === 'rectangle' || node.type === 'ellipse') {
      let Tag = 'div';
      if (node.type === 'frame') {
        if (node.frameRole === 'section') Tag = 'section';
        else if (node.frameRole === 'wrapper' && !node.parentId) Tag = 'main';
      }

      if (node.children && node.children.length > 0) {
        const inner = node.children
          .map((cid) => renderTailwindHTML(cid, indent + 2))
          .filter(Boolean)
          .join('\n');
        return `${spaces}<${Tag} class="${classList}"${bgStyle}>\n${inner}\n${spaces}</${Tag}>`;
      }
      return `${spaces}<${Tag} class="${classList}"${bgStyle}></${Tag}>`;
    }

    return '';
  };

  const renderTailwindJSX = (nodeId: string, indent: number = 4): string => {
    const node = nodes[nodeId];
    if (!node || node.hidden) return '';

    const spaces = ' '.repeat(indent);
    const classList = mapNodeToTailwind(node).join(' ');
    const bgStyle = node.style.backgroundImage ? ` style={{ backgroundImage: "url('${node.style.backgroundImage}')" }}` : '';

    if (node.type === 'text') {
      const Tag = (node.style?.fontSize || 16) >= 20 ? 'h2' : 'p';
      return `${spaces}<${Tag} className="${classList}">{\`${node.text || ''}\`}</${Tag}>`;
    }

    if (node.type === 'image') {
      if (node.style.imageType === 'vector' && node.style.svgContent) {
        return `${spaces}<div className="${classList}">\n${spaces}  ${node.style.svgContent}\n${spaces}</div>`;
      }
      return `${spaces}<img className="${classList}" src="${node.style.imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'}" alt="${node.name}" />`;
    }

    if (node.type === 'frame' || node.type === 'rectangle' || node.type === 'ellipse') {
      let Tag = 'div';
      if (node.type === 'frame') {
        if (node.frameRole === 'section') Tag = 'section';
        else if (node.frameRole === 'wrapper' && !node.parentId) Tag = 'main';
      }

      if (node.children && node.children.length > 0) {
        const inner = node.children
          .map((cid) => renderTailwindJSX(cid, indent + 2))
          .filter(Boolean)
          .join('\n');
        return `${spaces}<${Tag} className="${classList}"${bgStyle}>\n${inner}\n${spaces}</${Tag}>`;
      }
      return `${spaces}<${Tag} className="${classList}"${bgStyle} />`;
    }

    return '';
  };

  const html = (rootNodeIds || []).map((rid) => renderTailwindHTML(rid, 0)).join('\n');
  const jsxInner = (rootNodeIds || []).map((rid) => renderTailwindJSX(rid, 4)).join('\n');
  const jsx = `import React from 'react';

export const ExportedComponent: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[${primaryBg}] flex flex-col justify-center items-center p-4">
${jsxInner}
    </div>
  );
};`;

  return { html, jsx };
};
