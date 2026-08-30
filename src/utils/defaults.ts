import type { CanvasNode, NodeStyle, NodeType, FrameRole } from '../types/canvas';

export const createDefaultStyle = (override: Partial<NodeStyle> = {}): NodeStyle => ({
  position: 'relative',
  top: 0,
  left: 0,
  zIndex: 1,

  fill: '#3b82f6',
  fillOpacity: 1,
  stroke: '#1d4ed8',
  strokeWidth: 0,
  strokeDasharray: '',
  borderRadius: 0,
  borderStyle: 'none',
  boxShadow: 'none',

  backgroundType: 'solid',
  gradientFill: '',
  gradientType: 'linear',
  gradientAngle: 135,
  gradientPosition: 'center',
  gradientColor1: '#6366f1',
  gradientColor2: '#a855f7',
  meshGradient: '',
  gradientOpacity: 1,
  overlayColor: '#000000',
  overlayOpacity: 0,
  overlayAngle: 90,
  overlayStartOpacity: 0,
  overlayEndOpacity: 0.8,
  overlayStartPos: 0,
  overlayEndPos: 100,
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',

  fontFamily: 'Inter, sans-serif',
  fontSize: 16,
  fontWeight: 400,
  fontStyle: 'normal',
  textAlign: 'left',
  lineHeight: 1.5,
  letterSpacing: 0,
  textColor: '#1e293b',

  display: 'block',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  alignSelf: 'auto',
  gap: 8,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  widthUnit: 'px',
  heightUnit: 'px',
  sizingPreset: 'custom',

  opacity: 1,
  ...override,
});

export const createNewNode = (
  type: NodeType,
  x: number,
  y: number,
  width: number = 120,
  height: number = 100,
  parentId: string | null = null,
  customName?: string,
  frameRole?: FrameRole
): CanvasNode => {
  const id = `node_${Math.random().toString(36).substring(2, 9)}`;
  let name = customName || `${type.charAt(0).toUpperCase() + type.slice(1)}`;

  let style = createDefaultStyle({ position: 'relative' });
  let assignedRole: FrameRole | undefined = undefined;

  if (type === 'frame') {
    assignedRole = frameRole || (parentId ? 'container' : 'wrapper');
    style = createDefaultStyle({
      position: 'relative',
      fill: '#ffffff',
      stroke: '#cbd5e1',
      strokeWidth: 1,
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      gap: 12,
      borderRadius: 8,
    });
    if (!customName) {
      if (assignedRole === 'wrapper') name = 'Page Wrapper';
      else if (assignedRole === 'section') name = 'Content Section';
      else name = 'Card Container';
    }
  } else if (type === 'rectangle') {
    style = createDefaultStyle({
      position: 'relative',
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 0,
      borderRadius: 4,
    });
    if (!customName) name = 'Rectangle Box';
  } else if (type === 'text') {
    style = createDefaultStyle({
      position: 'relative',
      fill: 'transparent',
      textColor: '#0f172a',
      fontSize: 18,
      fontWeight: 600,
    });
    if (!customName) name = 'Text Heading';
  } else if (type === 'ellipse') {
    style = createDefaultStyle({
      position: 'relative',
      fill: '#ec4899',
      borderRadius: 9999,
    });
    if (!customName) name = 'Circle Object';
  } else if (type === 'path') {
    style = createDefaultStyle({
      position: 'relative',
      fill: 'transparent',
      stroke: '#8b5cf6',
      strokeWidth: 3,
    });
    if (!customName) name = 'Bezier Curve';
  }

  return {
    id,
    name,
    type,
    frameRole: assignedRole,
    parentId,
    children: [],
    x,
    y,
    width,
    height,
    rotation: 0,
    text: type === 'text' ? 'Sample Text Heading' : undefined,
    pathPoints: type === 'path' ? [
      { x: 0, y: 50 },
      { x: 50, y: 0, handleOut: { x: 75, y: 25 } },
      { x: 100, y: 50 }
    ] : undefined,
    style,
    locked: false,
    hidden: false,
  };
};

export const createInitialProject = (): { nodes: Record<string, CanvasNode>; rootNodeIds: string[] } => {
  const frameNode = createNewNode('frame', 200, 150, 480, 260, null, 'Feature Card', 'wrapper');
  frameNode.style.position = 'relative';
  frameNode.style.fill = '#1e1b4b';
  frameNode.style.borderRadius = 16;
  frameNode.style.paddingTop = 24;
  frameNode.style.paddingRight = 24;
  frameNode.style.paddingBottom = 24;
  frameNode.style.paddingLeft = 24;
  frameNode.style.gap = 14;
  frameNode.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';

  const textHeading = createNewNode('text', 0, 0, 432, 32, frameNode.id, 'Title Text');
  textHeading.text = 'Webscape to Code Transpiler';
  textHeading.style.position = 'static';
  textHeading.style.textColor = '#f8fafc';
  textHeading.style.fontSize = 20;
  textHeading.style.fontWeight = 700;

  const textSub = createNewNode('text', 0, 0, 432, 44, frameNode.id, 'Subtitle Text');
  textSub.text = 'Design visually on infinite canvas and instant-export clean CSS, Tailwind CSS, or Bootstrap 5 components.';
  textSub.style.position = 'static';
  textSub.style.textColor = '#a5b4fc';
  textSub.style.fontSize = 14;
  textSub.style.lineHeight = 1.4;

  const buttonFrame = createNewNode('frame', 0, 0, 160, 44, frameNode.id, 'CTA Button', 'container');
  buttonFrame.style.position = 'static';
  buttonFrame.style.display = 'flex';
  buttonFrame.style.flexDirection = 'row';
  buttonFrame.style.justifyContent = 'center';
  buttonFrame.style.alignItems = 'center';
  buttonFrame.style.fill = '#6366f1';
  buttonFrame.style.borderRadius = 8;
  buttonFrame.style.paddingTop = 10;
  buttonFrame.style.paddingRight = 20;
  buttonFrame.style.paddingBottom = 10;
  buttonFrame.style.paddingLeft = 20;

  const buttonText = createNewNode('text', 0, 0, 120, 24, buttonFrame.id, 'Button Text');
  buttonText.text = 'Export Code →';
  buttonText.style.position = 'static';
  buttonText.style.textColor = '#ffffff';
  buttonText.style.fontSize = 14;
  buttonText.style.fontWeight = 600;
  buttonText.style.textAlign = 'center';

  buttonFrame.children = [buttonText.id];
  frameNode.children = [textHeading.id, textSub.id, buttonFrame.id];

  const nodes: Record<string, CanvasNode> = {
    [frameNode.id]: frameNode,
    [textHeading.id]: textHeading,
    [textSub.id]: textSub,
    [buttonFrame.id]: buttonFrame,
    [buttonText.id]: buttonText,
  };

  return {
    nodes,
    rootNodeIds: [frameNode.id],
  };
};
