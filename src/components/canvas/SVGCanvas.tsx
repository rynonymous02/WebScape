import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/useProjectStore';

interface TransformHandle {
  id: string;
  cursor: string;
  x: number;
  y: number;
}

export const SVGCanvas: React.FC = () => {
  const {
    project,
    selectedIds,
    setSelectedIds,
    activeTool,
    addNode,
    updateNodeGeometry,
    updateNodeStyle,
    canvasTransform,
    setCanvasTransform,
    showGrid,
    snapToGrid,
    gridSize,
    setHoveredId,
    pushHistorySnapshot,
    theme,
  } = useProjectStore();

  const containerRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [, setRenderTrigger] = useState(0);

  // Track window resize and space key for panning
  useEffect(() => {
    const handleResize = () => setRenderTrigger((n) => n + 1);
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Global Window pointer listener for 60fps Panning
  useEffect(() => {
    if (!isPanning) return;

    const handlePanPointerMove = (e: PointerEvent) => {
      setCanvasTransform({
        panX: Math.round(e.clientX - panStart.x),
        panY: Math.round(e.clientY - panStart.y),
      });
    };

    const handlePanPointerUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('pointermove', handlePanPointerMove);
    window.addEventListener('pointerup', handlePanPointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePanPointerMove);
      window.removeEventListener('pointerup', handlePanPointerUp);
    };
  }, [isPanning, panStart, setCanvasTransform]);

  // Transform / Drag state
  const [dragState, setDragState] = useState<{
    mode: 'none' | 'move' | 'resize' | 'rotate' | 'draw' | 'radius';
    handle?: string;
    corner?: 'tl' | 'tr' | 'br' | 'bl';
    startX: number;
    startY: number;
    startRadius?: number;
    nodeStartGeom?: { x: number; y: number; width: number; height: number; rotation: number };
    drawStartPos?: { x: number; y: number };
    drawingNodeId?: string;
  }>({ mode: 'none', startX: 0, startY: 0 });

  // Selection mode: 'transform' (move, resize, rotate) vs 'radius' (corner radius direct manipulation)
  const [selectionMode, setSelectionMode] = useState<'transform' | 'radius'>('transform');
  const [hoveredRadiusCorner, setHoveredRadiusCorner] = useState<string | null>(null);
  const [liveRadiusInfo, setLiveRadiusInfo] = useState<{ text: string; clientX: number; clientY: number } | null>(null);

  const selectedNode = selectedIds.length === 1 ? project.nodes[selectedIds[0]] : null;

  // Convert screen mouse coordinates to canvas relative SVG coordinates
  const screenToCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - canvasTransform.panX) / canvasTransform.zoom;
    const y = (clientY - rect.top - canvasTransform.panY) / canvasTransform.zoom;

    if (snapToGrid) {
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    }
    return { x: Math.round(x), y: Math.round(y) };
  }, [canvasTransform, snapToGrid, gridSize]);

  // Global Window pointer listener for 60fps dragging and resizing
  useEffect(() => {
    if (dragState.mode === 'none') return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (dragState.mode === 'draw' && dragState.drawingNodeId && dragState.drawStartPos) {
        const pos = screenToCanvasCoords(e.clientX, e.clientY);
        const width = Math.max(20, Math.abs(pos.x - dragState.drawStartPos.x));
        const height = Math.max(20, Math.abs(pos.y - dragState.drawStartPos.y));
        const x = Math.min(pos.x, dragState.drawStartPos.x);
        const y = Math.min(pos.y, dragState.drawStartPos.y);
        updateNodeGeometry(dragState.drawingNodeId, x, y, width, height);
        return;
      }

      if (dragState.mode === 'move' && selectedNode && dragState.nodeStartGeom) {
        if (selectedNode.parentId && (selectedNode.style.position === 'static' || selectedNode.style.position === 'sticky')) {
          return;
        }

        const pos = screenToCanvasCoords(e.clientX, e.clientY);
        const dx = pos.x - dragState.startX;
        const dy = pos.y - dragState.startY;

        updateNodeGeometry(
          selectedNode.id,
          dragState.nodeStartGeom.x + dx,
          dragState.nodeStartGeom.y + dy,
          dragState.nodeStartGeom.width,
          dragState.nodeStartGeom.height,
          dragState.nodeStartGeom.rotation
        );
        return;
      }

      if (dragState.mode === 'resize' && selectedNode && dragState.nodeStartGeom && dragState.handle) {
        const pos = screenToCanvasCoords(e.clientX, e.clientY);
        const dx = pos.x - dragState.startX;
        const dy = pos.y - dragState.startY;

        let { x, y, width, height } = dragState.nodeStartGeom;
        const h = dragState.handle;

        if (h.includes('r')) {
          width = Math.max(10, dragState.nodeStartGeom.width + dx);
        }
        if (h.includes('l')) {
          width = Math.max(10, dragState.nodeStartGeom.width - dx);
          x = dragState.nodeStartGeom.x + (dragState.nodeStartGeom.width - width);
        }
        if (h.includes('b')) {
          height = Math.max(10, dragState.nodeStartGeom.height + dy);
        }
        if (h.includes('t')) {
          height = Math.max(10, dragState.nodeStartGeom.height - dy);
          y = dragState.nodeStartGeom.y + (dragState.nodeStartGeom.height - height);
        }

        updateNodeGeometry(selectedNode.id, x, y, width, height, dragState.nodeStartGeom.rotation);
        return;
      }

      if (dragState.mode === 'rotate' && selectedNode && dragState.nodeStartGeom) {
        let absX = selectedNode.x;
        let absY = selectedNode.y;
        if (selectedNode.parentId) {
          const domEl = document.getElementById(selectedNode.id);
          if (domEl && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const elRect = domEl.getBoundingClientRect();
            absX = (elRect.left - containerRect.left - canvasTransform.panX) / canvasTransform.zoom;
            absY = (elRect.top - containerRect.top - canvasTransform.panY) / canvasTransform.zoom;
          }
        }

        const cx = absX + selectedNode.width / 2;
        const cy = absY + selectedNode.height / 2;
        const pos = screenToCanvasCoords(e.clientX, e.clientY);
        const angleRad = Math.atan2(pos.y - cy, pos.x - cx);
        let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
        if (angleDeg < 0) angleDeg += 360;

        updateNodeGeometry(
          selectedNode.id,
          dragState.nodeStartGeom.x,
          dragState.nodeStartGeom.y,
          dragState.nodeStartGeom.width,
          dragState.nodeStartGeom.height,
          angleDeg
        );
        return;
      }

      // 5. DIRECT CORNER RADIUS MANIPULATION (Smooth, Linear, Full-Span Curvature)
      if (dragState.mode === 'radius' && selectedNode && dragState.corner && dragState.nodeStartGeom) {
        const { width, height } = dragState.nodeStartGeom;
        // For single corner (Shift mode), allow full dimension span up to Math.max(width, height)
        const maxRadius = e.shiftKey ? Math.max(width, height) : Math.max(width, height);
        const pos = screenToCanvasCoords(e.clientX, e.clientY);

        const dx = pos.x - dragState.startX;
        const dy = pos.y - dragState.startY;

        let delta = 0;
        if (dragState.corner === 'tl') {
          delta = (dx + dy) / 2;
        } else if (dragState.corner === 'tr') {
          delta = (-dx + dy) / 2;
        } else if (dragState.corner === 'br') {
          delta = (-dx - dy) / 2;
        } else if (dragState.corner === 'bl') {
          delta = (dx - dy) / 2;
        }

        const baseRad = dragState.startRadius ?? 0;
        const newRadius = Math.max(0, Math.min(maxRadius, Math.round(baseRad + delta)));

        if (e.shiftKey) {
          // SHIFT Key held: modify ONLY this specific corner up to full shape height/width
          if (dragState.corner === 'tl') {
            updateNodeStyle(selectedNode.id, { borderTopLeftRadius: newRadius });
          } else if (dragState.corner === 'tr') {
            updateNodeStyle(selectedNode.id, { borderTopRightRadius: newRadius });
          } else if (dragState.corner === 'br') {
            updateNodeStyle(selectedNode.id, { borderBottomRightRadius: newRadius });
          } else if (dragState.corner === 'bl') {
            updateNodeStyle(selectedNode.id, { borderBottomLeftRadius: newRadius });
          }
          setLiveRadiusInfo({
            text: `${dragState.corner.toUpperCase()} Corner: ${newRadius}px [Single Corner]`,
            clientX: e.clientX,
            clientY: e.clientY - 25,
          });
        } else {
          // Normal drag: modify ALL 4 corners equally
          updateNodeStyle(selectedNode.id, {
            borderRadius: newRadius,
            borderTopLeftRadius: newRadius,
            borderTopRightRadius: newRadius,
            borderBottomRightRadius: newRadius,
            borderBottomLeftRadius: newRadius,
          });
          setLiveRadiusInfo({
            text: `All 4 Corners: ${newRadius}px`,
            clientX: e.clientX,
            clientY: e.clientY - 25,
          });
        }
        return;
      }
    };

    const handleWindowPointerUp = () => {
      if (dragState.mode === 'draw' && dragState.drawingNodeId && dragState.drawStartPos) {
        const storeState = useProjectStore.getState();
        const node = storeState.project.nodes[dragState.drawingNodeId];
        if (node && node.width <= 20 && node.height <= 20) {
          const defaultW = node.type === 'ellipse' ? 100 : 120;
          const defaultH = node.type === 'ellipse' ? 100 : 80;
          updateNodeGeometry(node.id, node.x, node.y, defaultW, defaultH);
        }
      }
      setIsPanning(false);
      setLiveRadiusInfo(null);
      setDragState({ mode: 'none', startX: 0, startY: 0 });
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [dragState, selectedNode, screenToCanvasCoords, updateNodeGeometry, updateNodeStyle, canvasTransform]);

  // Non-passive wheel event listener for Ctrl + Scroll Wheel (Scroll forward = Zoom In, Scroll backward = Zoom Out)
  useEffect(() => {
    const svgEl = containerRef.current;
    if (!svgEl) return;

    const handleWheelNative = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || activeTool === 'zoom') {
        e.preventDefault();

        const rect = svgEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Scroll forward (deltaY < 0) -> Zoom In (1.15x), Scroll backward (deltaY > 0) -> Zoom Out (0.85x)
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;

        const storeState = useProjectStore.getState();
        const currentZoom = storeState.canvasTransform.zoom;
        const currentPanX = storeState.canvasTransform.panX;
        const currentPanY = storeState.canvasTransform.panY;

        const newZoom = Math.min(5, Math.max(0.1, currentZoom * zoomFactor));
        const newPanX = mouseX - (mouseX - currentPanX) * (newZoom / currentZoom);
        const newPanY = mouseY - (mouseY - currentPanY) * (newZoom / currentZoom);

        setCanvasTransform({
          zoom: Number(newZoom.toFixed(2)),
          panX: Math.round(newPanX),
          panY: Math.round(newPanY),
        });
      } else if (e.shiftKey) {
        // Shift + Scroll Wheel -> Horizontal Panning
        e.preventDefault();
        const storeState = useProjectStore.getState();
        const currentPanX = storeState.canvasTransform.panX;
        const currentPanY = storeState.canvasTransform.panY;

        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        const step = Math.abs(delta) > 0 ? Math.abs(delta) : 40;

        if (delta < 0) {
          // Scroll depan -> geser ke kanan (panX berkurang)
          setCanvasTransform({
            panX: currentPanX - step,
            panY: currentPanY,
          });
        } else {
          // Scroll belakang -> geser ke kiri (panX bertambah)
          setCanvasTransform({
            panX: currentPanX + step,
            panY: currentPanY,
          });
        }
      } else {
        e.preventDefault();
        const storeState = useProjectStore.getState();
        setCanvasTransform({
          panX: storeState.canvasTransform.panX - e.deltaX,
          panY: storeState.canvasTransform.panY - e.deltaY,
        });
      }
    };

    svgEl.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', handleWheelNative);
    };
  }, [activeTool, setCanvasTransform]);

  // Pointer Down on background (Pan, Draw, or Zoom click)
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'zoom') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.altKey || e.button === 2 ? 0.8 : 1.25;
      const newZoom = Math.min(5, Math.max(0.1, canvasTransform.zoom * zoomFactor));

      const newPanX = mouseX - (mouseX - canvasTransform.panX) * (newZoom / canvasTransform.zoom);
      const newPanY = mouseY - (mouseY - canvasTransform.panY) * (newZoom / canvasTransform.zoom);

      setCanvasTransform({
        zoom: Number(newZoom.toFixed(2)),
        panX: Math.round(newPanX),
        panY: Math.round(newPanY),
      });
      return;
    }

    if (activeTool === 'hand' || e.button === 1 || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasTransform.panX, y: e.clientY - canvasTransform.panY });
      return;
    }

    const pos = screenToCanvasCoords(e.clientX, e.clientY);

    if (['frame', 'rectangle', 'ellipse', 'path', 'text'].includes(activeTool)) {
      pushHistorySnapshot();
      const nodeId = addNode(activeTool as any, pos.x, pos.y, 20, 20);
      setDragState({
        mode: 'draw',
        startX: pos.x,
        startY: pos.y,
        drawStartPos: pos,
        drawingNodeId: nodeId,
      });
      return;
    }

    if (activeTool === 'select') {
      setSelectedIds([]);
      setSelectionMode('transform');
    }
  };

  // Render HTML / CSS Layout Node (Supporting background image & semantic frames)
  const renderHtmlNode = (nodeId: string): React.ReactNode => {
    const node = project.nodes[nodeId];
    if (!node || node.hidden) return null;

    const isSelected = selectedIds.includes(node.id);
    const style = node.style;

    const handleNodePointerDown = (e: React.PointerEvent) => {
      // Middle click (scroll wheel press), Spacebar hold, Hand tool, or active panning -> delegate to canvas pan
      if (e.button === 1 || isSpacePressed || activeTool === 'hand' || isPanning) {
        handleBackgroundPointerDown(e);
        return;
      }

      // Only Left-Click initiates selection or node dragging
      if (e.button !== 0) return;

      e.stopPropagation();

      if (activeTool !== 'select') {
        handleBackgroundPointerDown(e);
        return;
      }

      if (!isSelected) {
        setSelectionMode('transform');
        if (e.shiftKey) {
          setSelectedIds([...selectedIds, node.id]);
        } else {
          setSelectedIds([node.id]);
        }
      } else {
        // Second click on already selected rectangle or frame toggles to radius mode
        if (node.type === 'rectangle' || node.type === 'frame') {
          setSelectionMode((prev) => (prev === 'transform' ? 'radius' : 'transform'));
        }
      }

      pushHistorySnapshot();
      const pos = screenToCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'move',
        startX: pos.x,
        startY: pos.y,
        nodeStartGeom: { x: node.x, y: node.y, width: node.width, height: node.height, rotation: node.rotation },
      });
    };

    const isRoot = !node.parentId;
    const posMode = isRoot ? 'relative' : (style.position || 'static');

    let leftVal: string | undefined = undefined;
    let topVal: string | undefined = undefined;
    let rightVal: string | undefined = undefined;
    let bottomVal: string | undefined = undefined;

    if (!isRoot) {
      if (posMode === 'absolute' || posMode === 'fixed') {
        leftVal = style.left !== undefined ? `${style.left}px` : `${node.x}px`;
        topVal = style.top !== undefined ? `${style.top}px` : `${node.y}px`;
        if (style.right !== undefined) rightVal = `${style.right}px`;
        if (style.bottom !== undefined) bottomVal = `${style.bottom}px`;
      } else if (posMode === 'relative') {
        const effX = style.left !== undefined ? style.left : node.x;
        const effY = style.top !== undefined ? style.top : node.y;
        if (effX !== 0) leftVal = `${effX}px`;
        if (effY !== 0) topVal = `${effY}px`;
        if (style.right !== undefined) rightVal = `${style.right}px`;
        if (style.bottom !== undefined) bottomVal = `${style.bottom}px`;
      } else if (posMode === 'sticky') {
        topVal = style.top !== undefined ? `${style.top}px` : `0px`;
        if (style.bottom !== undefined) bottomVal = `${style.bottom}px`;
        if (style.left !== undefined) leftVal = `${style.left}px`;
        if (style.right !== undefined) rightVal = `${style.right}px`;
      }
    }

    const isSticky = !isRoot && posMode === 'sticky';
    const commonStyle: React.CSSProperties = {
      position: isRoot ? 'relative' : posMode,
      left: leftVal,
      top: topVal,
      right: rightVal,
      bottom: bottomVal,
      marginTop: isSticky && style.top && style.top > 0 ? `${style.top}px` : undefined,
      marginRight: isSticky && style.right && style.right > 0 ? `${style.right}px` : undefined,
      marginBottom: isSticky && style.bottom && style.bottom > 0 ? `${style.bottom}px` : undefined,
      marginLeft: isSticky && style.left && style.left > 0 ? `${style.left}px` : undefined,
      zIndex: style.zIndex && style.zIndex > 1 ? style.zIndex : (isSticky ? 50 : undefined),
      display: style.display,
      flexDirection: style.flexDirection,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      alignSelf: !isRoot && style.alignSelf && style.alignSelf !== 'auto' ? style.alignSelf : undefined,
      gap: style.gap > 0 ? `${style.gap}px` : undefined,
      paddingTop: `${style.paddingTop || 0}px`,
      paddingRight: `${style.paddingRight || 0}px`,
      paddingBottom: `${style.paddingBottom || 0}px`,
      paddingLeft: `${style.paddingLeft || 0}px`,
      backgroundColor: style.fill !== 'transparent' ? style.fill : undefined,
      backgroundImage: (() => {
        const color = style.overlayColor || '#000000';
        const hexToRgba = (hex: string, alpha: number) => {
          let clean = (hex || '#000000').replace('#', '');
          if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
          if (clean.length !== 6) return `rgba(0, 0, 0, ${alpha})`;
          const r = parseInt(clean.substring(0, 2), 16);
          const g = parseInt(clean.substring(2, 4), 16);
          const b = parseInt(clean.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        let overlayGrad: string | null = null;
        if (style.overlayGradient) {
          const angle = style.overlayAngle ?? 90;
          const startOpacity = style.overlayStartOpacity ?? 0;
          const endOpacity = style.overlayEndOpacity ?? 0;
          const startPos = style.overlayStartPos ?? 0;
          const endPos = style.overlayEndPos ?? 100;
          if (startOpacity > 0 || endOpacity > 0) {
            overlayGrad = `linear-gradient(${angle}deg, ${hexToRgba(color, startOpacity)} ${startPos}%, ${hexToRgba(color, endOpacity)} ${endPos}%)`;
          }
        } else {
          const solidOpacity = style.overlayOpacity ?? 0;
          if (solidOpacity > 0) {
            const rgba = hexToRgba(color, solidOpacity);
            overlayGrad = `linear-gradient(${rgba}, ${rgba})`;
          }
        }

        let baseBgStr: string | undefined = undefined;
        if (style.backgroundType === 'gradient' && style.gradientFill) {
          baseBgStr = style.gradientFill;
        } else if (style.backgroundType === 'mesh' && style.meshGradient) {
          baseBgStr = style.meshGradient;
        } else if (style.backgroundImage) {
          baseBgStr = `url(${style.backgroundImage})`;
        }

        if (overlayGrad && baseBgStr) {
          return `${overlayGrad}, ${baseBgStr}`;
        }
        return overlayGrad || baseBgStr;
      })(),
      backgroundSize: style.backgroundImage ? (style.backgroundSize || 'cover') : undefined,
      backgroundPosition: style.backgroundImage ? (style.backgroundPosition || 'center') : undefined,
      backgroundRepeat: style.backgroundImage ? (style.backgroundRepeat || 'no-repeat') : undefined,
      borderRadius: (() => {
        if (node.type === 'ellipse') return '9999px';
        const tl = style.borderTopLeftRadius ?? style.borderRadius ?? 0;
        const tr = style.borderTopRightRadius ?? style.borderRadius ?? 0;
        const br = style.borderBottomRightRadius ?? style.borderRadius ?? 0;
        const bl = style.borderBottomLeftRadius ?? style.borderRadius ?? 0;
        if (tl > 0 || tr > 0 || br > 0 || bl > 0) {
          return `${tl}px ${tr}px ${br}px ${bl}px`;
        }
        return undefined;
      })(),
      border: style.strokeWidth > 0 && style.stroke !== 'transparent' ? `${style.strokeWidth}px ${style.borderStyle || 'solid'} ${style.stroke}` : undefined,
      boxShadow: style.boxShadow !== 'none' ? style.boxShadow : undefined,
      opacity: style.opacity,
      boxSizing: 'border-box',
      cursor: activeTool === 'select' ? (node.parentId && posMode === 'static' ? 'pointer' : 'move') : 'default',
      userSelect: 'none',
      transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
    };

    if (isRoot) {
      commonStyle.width = `${node.width}px`;
      commonStyle.minHeight = `${node.height}px`;
    } else {
      if (style.sizingPreset === 'hero') {
        commonStyle.width = '100%';
        commonStyle.minHeight = `${node.height > 0 ? node.height : 600}px`;
      } else if (style.sizingPreset === 'banner') {
        commonStyle.width = '100%';
        commonStyle.height = 'auto';
      } else if (style.sizingPreset === 'contained') {
        commonStyle.width = '100%';
        if (node.width > 0) commonStyle.maxWidth = `${node.width}px`;
        if (node.height > 0) commonStyle.minHeight = `${node.height}px`;
        commonStyle.margin = '0 auto';
      } else if (style.sizingPreset === 'fit-content') {
        commonStyle.width = 'fit-content';
        if (node.height > 0) commonStyle.height = `${node.height}px`;
      } else {
        const wUnit = style.widthUnit || 'px';
        const hUnit = style.heightUnit || 'px';
        const wVal = style.customWidthVal !== undefined ? style.customWidthVal : node.width;
        const hVal = style.customHeightVal !== undefined ? style.customHeightVal : node.height;

        if (wUnit === 'auto') {
          commonStyle.width = 'auto';
        } else if (wUnit === '%' || wUnit === 'vw') {
          commonStyle.width = `${wVal}%`;
        } else if (wVal > 0) {
          commonStyle.width = `${wVal}px`;
        }

        if (hUnit === 'auto') {
          commonStyle.height = 'auto';
        } else if (hUnit === '%') {
          commonStyle.height = `${hVal}%`;
        } else if (hUnit === 'vh' || hUnit === 'min-vh') {
          commonStyle.minHeight = `${node.height > 0 ? node.height : (wVal > 0 ? 600 : '100%')}`;
        } else if (hVal > 0) {
          commonStyle.height = `${hVal}px`;
        }
      }

      if (style.maxWidth) commonStyle.maxWidth = typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth;
      if (style.minHeight && style.sizingPreset !== 'hero') commonStyle.minHeight = typeof style.minHeight === 'number' ? `${style.minHeight}px` : style.minHeight;
    }

    if (node.type === 'text') {
      const Tag = style.fontSize >= 20 ? 'h2' : 'p';
      return (
        <Tag
          key={node.id}
          id={node.id}
          onPointerDown={handleNodePointerDown}
          onPointerEnter={() => setHoveredId(node.id)}
          onPointerLeave={() => setHoveredId(null)}
          style={{
            ...commonStyle,
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize}px`,
            fontWeight: style.fontWeight,
            color: style.textColor,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing !== undefined ? `${style.letterSpacing}px` : undefined,
            textAlign: style.textAlign,
            margin: 0,
          }}
        >
          {node.text}
        </Tag>
      );
    }

    if (node.type === 'frame' || node.type === 'rectangle' || node.type === 'ellipse') {
      if (node.type === 'ellipse') {
        commonStyle.borderRadius = '9999px';
      }

      const Tag = (node.type === 'frame' && node.frameRole === 'section')
        ? 'section'
        : (node.type === 'frame' && node.frameRole === 'wrapper')
        ? 'main'
        : 'div';

      return (
        <Tag
          key={node.id}
          id={node.id}
          onPointerDown={handleNodePointerDown}
          onPointerEnter={() => setHoveredId(node.id)}
          onPointerLeave={() => setHoveredId(null)}
          style={commonStyle}
        >
          {node.children && node.children.map((cid) => renderHtmlNode(cid))}
        </Tag>
      );
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

      return (
        <svg
          key={node.id}
          id={node.id}
          width={node.width}
          height={node.height}
          onPointerDown={handleNodePointerDown}
          onPointerEnter={() => setHoveredId(node.id)}
          onPointerLeave={() => setHoveredId(null)}
          style={{ ...commonStyle, overflow: 'visible' }}
        >
          <path
            d={d}
            fill={node.style.fill}
            stroke={node.style.stroke}
            strokeWidth={node.style.strokeWidth}
            opacity={node.style.opacity}
          />
        </svg>
      );
    }

    return null;
  };

  // Handles for Selected Bounding Box (1:1 precision without desync)
  const renderBoundingBox = () => {
    if (activeTool !== 'select' || !selectedNode || !containerRef.current) return null;

    let absX = selectedNode.x;
    let absY = selectedNode.y;
    let width = selectedNode.width;
    let height = selectedNode.height;

    // For nested child nodes, measure actual rendered position inside parent frame
    if (selectedNode.parentId) {
      const domEl = document.getElementById(selectedNode.id);
      if (domEl && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = domEl.getBoundingClientRect();
        absX = (elRect.left - containerRect.left - canvasTransform.panX) / canvasTransform.zoom;
        absY = (elRect.top - containerRect.top - canvasTransform.panY) / canvasTransform.zoom;
        width = elRect.width / canvasTransform.zoom;
        height = elRect.height / canvasTransform.zoom;
      }
    }

    const handles: TransformHandle[] = [
      { id: 'tl', cursor: 'nwse-resize', x: absX, y: absY },
      { id: 'tm', cursor: 'ns-resize', x: absX + width / 2, y: absY },
      { id: 'tr', cursor: 'nesw-resize', x: absX + width, y: absY },
      { id: 'ml', cursor: 'ew-resize', x: absX, y: absY + height / 2 },
      { id: 'mr', cursor: 'ew-resize', x: absX + width, y: absY + height / 2 },
      { id: 'bl', cursor: 'nesw-resize', x: absX, y: absY + height },
      { id: 'bm', cursor: 'ns-resize', x: absX + width / 2, y: absY + height },
      { id: 'br', cursor: 'nwse-resize', x: absX + width, y: absY + height },
    ];

    const rotX = absX + width / 2;
    const rotY = absY - 25;

    const isMovable = !selectedNode.parentId || (selectedNode.style.position !== 'static' && selectedNode.style.position !== 'sticky');

    const handleBoundingBoxPointerDown = (e: React.PointerEvent) => {
      if (e.button === 1 || isSpacePressed || isPanning) {
        handleBackgroundPointerDown(e);
        return;
      }
      if (e.button !== 0) return;

      e.stopPropagation();
      if (!isMovable) return;
      pushHistorySnapshot();
      const pos = screenToCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'move',
        startX: pos.x,
        startY: pos.y,
        nodeStartGeom: {
          x: selectedNode.x,
          y: selectedNode.y,
          width: selectedNode.width,
          height: selectedNode.height,
          rotation: selectedNode.rotation,
        },
      });
    };

    const handleResizeDown = (handleId: string) => (e: React.PointerEvent) => {
      if (e.button === 1 || isSpacePressed || isPanning) {
        handleBackgroundPointerDown(e);
        return;
      }
      if (e.button !== 0) return;

      e.stopPropagation();
      pushHistorySnapshot();
      const pos = screenToCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'resize',
        handle: handleId,
        startX: pos.x,
        startY: pos.y,
        nodeStartGeom: {
          x: selectedNode.x,
          y: selectedNode.y,
          width: width,
          height: height,
          rotation: selectedNode.rotation,
        },
      });
    };

    const handleRotateDown = (e: React.PointerEvent) => {
      if (e.button === 1 || isSpacePressed || isPanning) {
        handleBackgroundPointerDown(e);
        return;
      }
      if (e.button !== 0) return;

      e.stopPropagation();
      pushHistorySnapshot();
      const pos = screenToCanvasCoords(e.clientX, e.clientY);
      setDragState({
        mode: 'rotate',
        startX: pos.x,
        startY: pos.y,
        nodeStartGeom: {
          x: selectedNode.x,
          y: selectedNode.y,
          width: width,
          height: height,
          rotation: selectedNode.rotation,
        },
      });
    };

    const isShapeWithRadius = selectedNode.type === 'rectangle' || selectedNode.type === 'frame';

    const tlRadius = selectedNode.style.borderTopLeftRadius ?? selectedNode.style.borderRadius ?? 0;
    const trRadius = selectedNode.style.borderTopRightRadius ?? selectedNode.style.borderRadius ?? 0;
    const brRadius = selectedNode.style.borderBottomRightRadius ?? selectedNode.style.borderRadius ?? 0;
    const blRadius = selectedNode.style.borderBottomLeftRadius ?? selectedNode.style.borderRadius ?? 0;

    // Fixed stable inner-corner offset (anchored securely inside the 4 corners, never jumps)
    const cornerOffset = Math.max(14, Math.min(26, Math.min(width, height) * 0.28));

    const radiusHandles = [
      { id: 'tl' as const, cx: absX + cornerOffset, cy: absY + cornerOffset, currentRadius: tlRadius, label: 'Top-Left' },
      { id: 'tr' as const, cx: absX + width - cornerOffset, cy: absY + cornerOffset, currentRadius: trRadius, label: 'Top-Right' },
      { id: 'br' as const, cx: absX + width - cornerOffset, cy: absY + height - cornerOffset, currentRadius: brRadius, label: 'Bottom-Right' },
      { id: 'bl' as const, cx: absX + cornerOffset, cy: absY + height - cornerOffset, currentRadius: blRadius, label: 'Bottom-Left' },
    ];

    const handleRadiusDown = (corner: 'tl' | 'tr' | 'br' | 'bl') => (e: React.PointerEvent) => {
      if (e.button === 1 || isSpacePressed || isPanning) {
        handleBackgroundPointerDown(e);
        return;
      }
      if (e.button !== 0) return;

      e.stopPropagation();
      pushHistorySnapshot();
      const pos = screenToCanvasCoords(e.clientX, e.clientY);
      const currentCornerRadius = 
        corner === 'tl' ? tlRadius :
        corner === 'tr' ? trRadius :
        corner === 'br' ? brRadius : blRadius;

      setDragState({
        mode: 'radius',
        corner,
        startX: pos.x,
        startY: pos.y,
        startRadius: currentCornerRadius,
        nodeStartGeom: {
          x: absX,
          y: absY,
          width: width,
          height: height,
          rotation: selectedNode.rotation,
        },
      });
    };

    return (
      <g transform={`rotate(${selectedNode.rotation}, ${absX + width / 2}, ${absY + height / 2})`}>
        {/* Outline Box - Click to drag/move if movable */}
        <rect
          x={absX}
          y={absY}
          width={width}
          height={height}
          fill="none"
          stroke={selectionMode === 'radius' ? '#8b5cf6' : '#6366f1'}
          strokeWidth={(selectionMode === 'radius' ? 2 : 1.5) / canvasTransform.zoom}
          strokeDasharray={selectionMode === 'radius' ? '3 3' : '4 4'}
          style={{ pointerEvents: 'stroke' }}
          className={isMovable ? 'cursor-move' : 'cursor-default'}
          onPointerDown={handleBoundingBoxPointerDown}
        />

        {/* Transform Handles: Rotate Knob & 8 Resize Knots (ONLY in transform mode) */}
        {selectionMode === 'transform' && (
          <>
            {/* Rotate Stem & Knot */}
            <line
              x1={absX + width / 2}
              y1={absY}
              x2={rotX}
              y2={rotY}
              stroke="#6366f1"
              strokeWidth={1.5 / canvasTransform.zoom}
            />
            <circle
              cx={rotX}
              cy={rotY}
              r={5 / canvasTransform.zoom}
              fill="#818cf8"
              stroke="#ffffff"
              strokeWidth={1.5 / canvasTransform.zoom}
              className="cursor-grab"
              onPointerDown={handleRotateDown}
            />

            {/* 8 Resize Knots */}
            {handles.map((h) => (
              <rect
                key={h.id}
                x={h.x - 4 / canvasTransform.zoom}
                y={h.y - 4 / canvasTransform.zoom}
                width={8 / canvasTransform.zoom}
                height={8 / canvasTransform.zoom}
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth={1.5 / canvasTransform.zoom}
                style={{ cursor: h.cursor }}
                onPointerDown={handleResizeDown(h.id)}
              />
            ))}
          </>
        )}

        {/* Corner Radius Handles (ONLY rendered in radius mode!) */}
        {selectionMode === 'radius' && isShapeWithRadius && (
          <g className="radius-handles-group">
            {radiusHandles.map((rh) => {
              const isHovered = hoveredRadiusCorner === rh.id;
              const isDragging = dragState.mode === 'radius' && dragState.corner === rh.id;
              const outerR = (isHovered || isDragging ? 7.5 : 5.5) / canvasTransform.zoom;
              const innerR = (isHovered || isDragging ? 3.5 : 2.5) / canvasTransform.zoom;

              return (
                <g 
                  key={rh.id} 
                  className="cursor-crosshair" 
                  onPointerDown={handleRadiusDown(rh.id)}
                  onPointerEnter={() => setHoveredRadiusCorner(rh.id)}
                  onPointerLeave={() => setHoveredRadiusCorner(null)}
                >
                  {/* Transparent enlarged hit target for effortless clicking */}
                  <circle
                    cx={rh.cx}
                    cy={rh.cy}
                    r={16 / canvasTransform.zoom}
                    fill="transparent"
                  />
                  {/* Outer circle */}
                  <circle
                    cx={rh.cx}
                    cy={rh.cy}
                    r={outerR}
                    fill="#ffffff"
                    stroke={isHovered || isDragging ? '#7c3aed' : '#8b5cf6'}
                    strokeWidth={(isHovered || isDragging ? 2.5 : 1.8) / canvasTransform.zoom}
                  />
                  {/* Inner center dot */}
                  <circle
                    cx={rh.cx}
                    cy={rh.cy}
                    r={innerR}
                    fill={isHovered || isDragging ? '#6d28d9' : '#7c3aed'}
                  />
                </g>
              );
            })}
          </g>
        )}
      </g>
    );
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none transition-colors ${
        isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-800'
      } ${
        activeTool === 'zoom'
          ? 'cursor-zoom-in'
          : activeTool === 'hand' || isPanning || isSpacePressed
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-crosshair'
      }`}
      onPointerDown={handleBackgroundPointerDown}
    >
      <svg
        ref={containerRef}
        className="w-full h-full block"
      >
        {/* Defs for Background Grid pattern */}
        <defs>
          <pattern
            id="grid-pattern"
            width={gridSize * canvasTransform.zoom}
            height={gridSize * canvasTransform.zoom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize * canvasTransform.zoom} 0 L 0 0 0 ${gridSize * canvasTransform.zoom}`}
              fill="none"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        {/* Grid Background */}
        {showGrid && (
          <rect
            width="100%"
            height="100%"
            fill="url(#grid-pattern)"
          />
        )}

        {/* Main Canvas Viewport Group (Pan & Zoom Transformed) */}
        <g transform={`translate(${canvasTransform.panX}, ${canvasTransform.panY}) scale(${canvasTransform.zoom})`}>
          {/* Render Root Nodes with Native CSS Layout */}
          {project.rootNodeIds.map((rootId) => {
            const rootNode = project.nodes[rootId];
            if (!rootNode || rootNode.hidden) return null;

            return (
              <foreignObject
                key={rootNode.id}
                x={rootNode.x}
                y={rootNode.y}
                width={rootNode.width}
                height={rootNode.height}
                style={{ overflow: 'visible' }}
              >
                {renderHtmlNode(rootNode.id)}
              </foreignObject>
            );
          })}

          {/* Render Bounding Box Controls */}
          {renderBoundingBox()}
        </g>
      </svg>

      {/* Floating Live Radius Tooltip Feedback */}
      {liveRadiusInfo && (
        <div 
          className="fixed z-50 pointer-events-none bg-slate-900/95 border border-purple-500 text-white font-mono text-[11px] px-3 py-1 rounded-full shadow-2xl backdrop-blur -translate-x-1/2 -translate-y-full flex items-center gap-1.5 animate-in fade-in duration-100"
          style={{ left: liveRadiusInfo.clientX, top: liveRadiusInfo.clientY }}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>{liveRadiusInfo.text}</span>
        </div>
      )}
    </div>
  );
};
