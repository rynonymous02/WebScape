export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'frame' 
  | 'rectangle' 
  | 'ellipse' 
  | 'path' 
  | 'text' 
  | 'zoom'
  | 'image';

export type NodeType = 'frame' | 'rectangle' | 'ellipse' | 'path' | 'text' | 'image';

export type FrameRole = 'container' | 'section' | 'wrapper';

export type PositionMode = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface Point {
  x: number;
  y: number;
}

export interface PathPoint {
  x: number;
  y: number;
  handleIn?: Point;
  handleOut?: Point;
}

export interface NodeStyle {
  // CSS Position & Coordinates
  position: PositionMode;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  zIndex: number;

  // Fill & Stroke
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;

  // Image & Vector Object Properties (Pixel / Vector)
  imageType?: 'pixel' | 'vector';
  imageUrl?: string;
  svgContent?: string;
  blendMode?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  vectorColor?: string;
  vectorColorMode?: 'original' | 'custom' | 'monochrome';
  vectorStroke?: string;
  vectorStrokeWidth?: number;

  // Background Image, Gradients & Mesh (for Frames & Wrappers & Sections)
  backgroundType?: 'solid' | 'gradient' | 'mesh' | 'image';
  gradientFill?: string;
  gradientType?: 'linear' | 'radial';
  gradientAngle?: number;
  gradientPosition?: 'center' | 'top left' | 'top right' | 'bottom left' | 'bottom right';
  gradientColor1?: string;
  gradientColor2?: string;
  meshGradient?: string;
  gradientOpacity?: number;
  overlayEnabled?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayGradient?: boolean;
  overlayAngle?: number;
  overlayStartOpacity?: number;
  overlayEndOpacity?: number;
  overlayStartPos?: number;
  overlayEndPos?: number;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundRepeat?: 'no-repeat' | 'repeat';

  // Border & Shadow
  borderRadius: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  boxShadow: string;

  // Special Effects (Glassmorphism, Shadow, Glow, Neo-Brutalism)
  effectType?: 'none' | 'glassmorphism' | 'shadow' | 'glow' | 'neobrutalism';
  backdropBlur?: number;
  backdropSaturate?: number;
  glowColor?: string;
  glowBlur?: number;
  glowSpread?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  shadowInset?: boolean;
  neoShadowOffsetX?: number;
  neoShadowOffsetY?: number;
  neoShadowColor?: string;

  // Typography (for text nodes)
  fontFamily: string;
  fontSource?: 'web' | 'offline';
  fontUrl?: string;
  fontFile?: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight: number;
  letterSpacing?: number;
  textColor: string;

  // Layout / Flexbox
  display: 'block' | 'flex';
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // Responsive Sizing & Units
  widthUnit?: 'px' | '%' | 'vw' | 'auto';
  heightUnit?: 'px' | 'vh' | '%' | 'auto' | 'min-vh';
  customWidthVal?: number;
  customHeightVal?: number;
  sizingPreset?: 'custom' | 'hero' | 'banner' | 'contained' | 'fit-content';
  minHeight?: number | string;
  maxWidth?: number | string;

  // General
  opacity: number;
  overflow?: 'visible' | 'hidden' | 'clip' | 'auto' | 'scroll';
}

export interface CanvasNode {
  id: string;
  name: string;
  type: NodeType;
  frameRole?: FrameRole; // container, section, wrapper
  parentId: string | null;
  children: string[]; // Node IDs

  // Geometry
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees

  // Specific content
  text?: string;
  pathPoints?: PathPoint[]; // for bezier path

  // Styling & Layout
  style: NodeStyle;

  // State
  locked?: boolean;
  hidden?: boolean;
}

export interface ProjectState {
  id: string;
  name: string;
  version: string;
  updatedAt: string;
  nodes: Record<string, CanvasNode>;
  rootNodeIds: string[];
}

export interface TranspilerOutput {
  htmlCss: {
    html: string;
    css: string;
    fullDocument: string;
  };
  tailwind: {
    html: string;
    jsx: string;
  };
  bootstrap: {
    html: string;
    jsx: string;
  };
  flutter: {
    widget: string;
    fullFile: string;
  };
}

export interface ProjectAsset {
  id: string;
  name: string;
  type: 'pixel' | 'vector';
  url?: string;
  svgContent?: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  category?: 'uploaded' | 'preset' | 'vector' | 'icon';
  createdAt?: number;
}

