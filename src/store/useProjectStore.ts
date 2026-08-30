import { create } from 'zustand';
import type { CanvasNode, NodeStyle, NodeType, ProjectState, ToolType } from '../types/canvas';
import { createInitialProject, createNewNode } from '../utils/defaults';
import { storageService } from '../services/storage';

interface CanvasTransform {
  zoom: number;
  panX: number;
  panY: number;
}

interface ProjectStoreState {
  // Project Data
  project: ProjectState;
  fileHandle: any;

  // Theme & Preferences
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // UI / Editor State
  activeTool: ToolType;
  selectedIds: string[];
  hoveredId: string | null;

  // Canvas Viewport & Grid
  canvasTransform: CanvasTransform;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showInspector: boolean;

  // History Stack (Undo / Redo)
  undoStack: Array<{ nodes: Record<string, CanvasNode>; rootNodeIds: string[] }>;
  redoStack: Array<{ nodes: Record<string, CanvasNode>; rootNodeIds: string[] }>;

  // Modals
  isCodeExportOpen: boolean;
  isGraphicExportOpen: boolean;
  isLivePreviewOpen: boolean;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;
  setHoveredId: (id: string | null) => void;

  // Canvas Navigation
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleRulers: () => void;
  toggleInspector: () => void;
  setShowInspector: (show: boolean) => void;

  // Node Mutations
  addNode: (type: NodeType, x: number, y: number, width?: number, height?: number) => string;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  updateNodeStyle: (id: string, styleUpdates: Partial<NodeStyle>) => void;
  updateNodeGeometry: (id: string, x: number, y: number, width: number, height: number, rotation?: number) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  reorderNode: (id: string, newParentId: string | null, targetIndex?: number) => void;
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  nudgeSelected: (dx: number, dy: number) => void;

  // Z-Index Layer Stacking Actions
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;

  // History
  pushHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Project I/O
  setProject: (project: ProjectState, fileHandle?: any) => void;
  renameProject: (name: string) => void;
  resetToInitialDemo: () => void;
  saveDraftToStorage: () => void;
  loadDraftFromStorage: () => Promise<void>;

  // Modals
  setCodeExportOpen: (open: boolean) => void;
  setGraphicExportOpen: (open: boolean) => void;
  setLivePreviewOpen: (open: boolean) => void;
}

const initialProjectData = createInitialProject();
const savedTheme = (localStorage.getItem('webscape_theme') as 'dark' | 'light') || 'dark';

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  project: {
    id: `proj_${Date.now()}`,
    name: 'Untitled Vector Design',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    nodes: initialProjectData.nodes,
    rootNodeIds: initialProjectData.rootNodeIds,
  },
  fileHandle: null,

  theme: savedTheme,
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('webscape_theme', nextTheme);
    set({ theme: nextTheme });
  },

  activeTool: 'select',
  selectedIds: [initialProjectData.rootNodeIds[0]],
  hoveredId: null,

  canvasTransform: {
    zoom: 1,
    panX: 50,
    panY: 50,
  },
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,
  showRulers: true,
  showInspector: true,

  undoStack: [],
  redoStack: [],

  isCodeExportOpen: false,
  isGraphicExportOpen: false,
  isLivePreviewOpen: false,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectId: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((item) => item !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  clearSelection: () => set({ selectedIds: [] }),
  setHoveredId: (id) => set({ hoveredId: id }),

  setCanvasTransform: (transform) =>
    set((state) => ({
      canvasTransform: { ...state.canvasTransform, ...transform },
    })),
  zoomIn: () =>
    set((state) => ({
      canvasTransform: {
        ...state.canvasTransform,
        zoom: Math.min(5, Number((state.canvasTransform.zoom * 1.25).toFixed(2))),
      },
    })),
  zoomOut: () =>
    set((state) => ({
      canvasTransform: {
        ...state.canvasTransform,
        zoom: Math.max(0.1, Number((state.canvasTransform.zoom / 1.25).toFixed(2))),
      },
    })),
  resetZoom: () =>
    set((state) => ({
      canvasTransform: { ...state.canvasTransform, zoom: 1, panX: 50, panY: 50 },
    })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
  toggleInspector: () => set((state) => ({ showInspector: !state.showInspector })),
  setShowInspector: (show) => set({ showInspector: show }),

  pushHistorySnapshot: () => {
    const { project, undoStack } = get();
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(project.nodes)),
      rootNodeIds: [...project.rootNodeIds],
    };
    set({
      undoStack: [...undoStack.slice(-30), snapshot],
      redoStack: [],
    });
  },

  addNode: (type, x, y, width, height) => {
    get().pushHistorySnapshot();
    const { project } = get();

    const newNode = createNewNode(type, x, y, width, height, null);
    const updatedNodes = { ...project.nodes, [newNode.id]: newNode };
    const updatedRoots = [...project.rootNodeIds, newNode.id];

    const updatedProject = {
      ...project,
      nodes: updatedNodes,
      rootNodeIds: updatedRoots,
      updatedAt: new Date().toISOString(),
    };

    set({
      project: updatedProject,
      selectedIds: [newNode.id],
      activeTool: 'select',
    });

    get().saveDraftToStorage();
    return newNode.id;
  },

  updateNode: (id, updates) => {
    const { project } = get();
    if (!project.nodes[id]) return;

    const updatedNodes = {
      ...project.nodes,
      [id]: { ...project.nodes[id], ...updates },
    };

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  updateNodeStyle: (id, styleUpdates) => {
    get().pushHistorySnapshot();
    const { project } = get();
    const node = project.nodes[id];
    if (!node) return;

    const updatedNode = {
      ...node,
      style: { ...node.style, ...styleUpdates },
    };

    set({
      project: {
        ...project,
        nodes: { ...project.nodes, [id]: updatedNode },
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  updateNodeGeometry: (id, x, y, width, height, rotation) => {
    const { project } = get();
    const node = project.nodes[id];
    if (!node) return;

    const updatedNode = {
      ...node,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.max(10, Math.round(width)),
      height: Math.max(10, Math.round(height)),
      rotation: rotation !== undefined ? Math.round(rotation) : node.rotation,
    };

    set({
      project: {
        ...project,
        nodes: { ...project.nodes, [id]: updatedNode },
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  deleteSelected: () => {
    const { selectedIds, project } = get();
    if (selectedIds.length === 0) return;

    get().pushHistorySnapshot();

    const nodesToDelete = new Set<string>();
    const gatherChildren = (id: string) => {
      nodesToDelete.add(id);
      const node = project.nodes[id];
      if (node && node.children) {
        node.children.forEach(gatherChildren);
      }
    };
    selectedIds.forEach(gatherChildren);

    const updatedNodes = { ...project.nodes };
    nodesToDelete.forEach((id) => delete updatedNodes[id]);

    Object.keys(updatedNodes).forEach((id) => {
      const node = updatedNodes[id];
      if (node.children.some((cid) => nodesToDelete.has(cid))) {
        updatedNodes[id] = {
          ...node,
          children: node.children.filter((cid) => !nodesToDelete.has(cid)),
        };
      }
    });

    const updatedRoots = project.rootNodeIds.filter((id) => !nodesToDelete.has(id));

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        rootNodeIds: updatedRoots,
        updatedAt: new Date().toISOString(),
      },
      selectedIds: [],
    });
    get().saveDraftToStorage();
  },

  duplicateSelected: () => {
    const { selectedIds, project } = get();
    if (selectedIds.length === 0) return;

    get().pushHistorySnapshot();

    const newNodesMap: Record<string, CanvasNode> = { ...project.nodes };
    const newRootIds = [...project.rootNodeIds];
    const newlySelectedIds: string[] = [];

    const duplicateNodeTree = (originalId: string, newParentId: string | null): string => {
      const originalNode = project.nodes[originalId];
      if (!originalNode) return '';

      const newId = `node_${Math.random().toString(36).substring(2, 9)}`;
      const newStyle: NodeStyle = JSON.parse(JSON.stringify(originalNode.style));
      const newPathPoints = originalNode.pathPoints ? JSON.parse(JSON.stringify(originalNode.pathPoints)) : undefined;

      const newChildren: string[] = [];
      if (originalNode.children && originalNode.children.length > 0) {
        originalNode.children.forEach((childId) => {
          const duplicatedChildId = duplicateNodeTree(childId, newId);
          if (duplicatedChildId) {
            newChildren.push(duplicatedChildId);
          }
        });
      }

      const isTopDuplicatedNode = selectedIds.includes(originalId);
      const offsetX = isTopDuplicatedNode ? 20 : 0;
      const offsetY = isTopDuplicatedNode ? 20 : 0;

      const duplicatedNode: CanvasNode = {
        ...originalNode,
        id: newId,
        name: isTopDuplicatedNode ? `${originalNode.name} Copy` : originalNode.name,
        parentId: newParentId,
        children: newChildren,
        x: originalNode.x + offsetX,
        y: originalNode.y + offsetY,
        style: newStyle,
        pathPoints: newPathPoints,
      };

      newNodesMap[newId] = duplicatedNode;
      return newId;
    };

    selectedIds.forEach((origId) => {
      const origNode = project.nodes[origId];
      if (!origNode) return;

      const duplicatedId = duplicateNodeTree(origId, origNode.parentId);
      if (!duplicatedId) return;

      newlySelectedIds.push(duplicatedId);

      if (origNode.parentId && newNodesMap[origNode.parentId]) {
        const parent = newNodesMap[origNode.parentId];
        const origIdx = parent.children.indexOf(origId);
        const updatedChildren = [...parent.children];
        if (origIdx >= 0) {
          updatedChildren.splice(origIdx + 1, 0, duplicatedId);
        } else {
          updatedChildren.push(duplicatedId);
        }
        newNodesMap[origNode.parentId] = {
          ...parent,
          children: updatedChildren,
        };
      } else {
        const rootIdx = newRootIds.indexOf(origId);
        if (rootIdx >= 0) {
          newRootIds.splice(rootIdx + 1, 0, duplicatedId);
        } else {
          newRootIds.unshift(duplicatedId);
        }
      }
    });

    set({
      project: {
        ...project,
        nodes: newNodesMap,
        rootNodeIds: newRootIds,
        updatedAt: new Date().toISOString(),
      },
      selectedIds: newlySelectedIds,
    });
    get().saveDraftToStorage();
  },

  groupSelected: () => {
    const { selectedIds, project } = get();
    if (selectedIds.length <= 1) return;

    get().pushHistorySnapshot();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedIds.forEach((id) => {
      const node = project.nodes[id];
      if (node) {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      }
    });

    const groupFrame = createNewNode('frame', minX, minY, maxX - minX, maxY - minY, null, 'Group Container');
    groupFrame.children = [...selectedIds];

    const updatedNodes = { ...project.nodes, [groupFrame.id]: groupFrame };

    selectedIds.forEach((id) => {
      if (updatedNodes[id]) {
        updatedNodes[id] = {
          ...updatedNodes[id],
          parentId: groupFrame.id,
        };
      }
    });

    const updatedRoots = [
      groupFrame.id,
      ...project.rootNodeIds.filter((id) => !selectedIds.includes(id)),
    ];

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        rootNodeIds: updatedRoots,
        updatedAt: new Date().toISOString(),
      },
      selectedIds: [groupFrame.id],
    });
    get().saveDraftToStorage();
  },

  ungroupSelected: () => {
    const { selectedIds, project } = get();
    if (selectedIds.length !== 1) return;

    const groupNode = project.nodes[selectedIds[0]];
    if (!groupNode || groupNode.children.length === 0) return;

    get().pushHistorySnapshot();

    const updatedNodes = { ...project.nodes };
    const childrenIds = [...groupNode.children];

    childrenIds.forEach((cid) => {
      if (updatedNodes[cid]) {
        updatedNodes[cid] = {
          ...updatedNodes[cid],
          parentId: groupNode.parentId,
        };
      }
    });

    delete updatedNodes[groupNode.id];

    let updatedRoots = project.rootNodeIds.filter((id) => id !== groupNode.id);
    if (!groupNode.parentId) {
      updatedRoots = [...childrenIds, ...updatedRoots];
    } else if (updatedNodes[groupNode.parentId]) {
      const parent = updatedNodes[groupNode.parentId];
      const newParentChildren = [
        ...childrenIds,
        ...parent.children.filter((id) => id !== groupNode.id),
      ];
      updatedNodes[groupNode.parentId] = { ...parent, children: newParentChildren };
    }

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        rootNodeIds: updatedRoots,
        updatedAt: new Date().toISOString(),
      },
      selectedIds: childrenIds,
    });
    get().saveDraftToStorage();
  },

  reorderNode: (id, newParentId, targetIndex) => {
    const { project } = get();
    const node = project.nodes[id];
    if (!node) return;

    get().pushHistorySnapshot();
    const updatedNodes = { ...project.nodes };

    if (node.parentId && updatedNodes[node.parentId]) {
      const oldParent = updatedNodes[node.parentId];
      updatedNodes[node.parentId] = {
        ...oldParent,
        children: oldParent.children.filter((cid) => cid !== id),
      };
    }
    let updatedRoots = project.rootNodeIds.filter((rid) => rid !== id);

    updatedNodes[id] = { ...node, parentId: newParentId };

    if (newParentId && updatedNodes[newParentId]) {
      const newParent = updatedNodes[newParentId];
      const newChildren = [...newParent.children];
      if (targetIndex !== undefined) {
        newChildren.splice(targetIndex, 0, id);
      } else {
        newChildren.unshift(id);
      }
      updatedNodes[newParentId] = { ...newParent, children: newChildren };
    } else {
      if (targetIndex !== undefined) {
        updatedRoots.splice(targetIndex, 0, id);
      } else {
        updatedRoots.unshift(id);
      }
    }

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        rootNodeIds: updatedRoots,
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  alignSelected: (alignment) => {
    const { selectedIds, project } = get();
    if (selectedIds.length < 2) return;

    get().pushHistorySnapshot();

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    selectedIds.forEach((id) => {
      const n = project.nodes[id];
      if (n) {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + n.width);
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + n.height);
      }
    });

    const updatedNodes = { ...project.nodes };

    selectedIds.forEach((id) => {
      const n = updatedNodes[id];
      if (!n) return;

      let x = n.x;
      let y = n.y;

      if (alignment === 'left') x = minX;
      else if (alignment === 'center') x = minX + (maxX - minX) / 2 - n.width / 2;
      else if (alignment === 'right') x = maxX - n.width;
      else if (alignment === 'top') y = minY;
      else if (alignment === 'middle') y = minY + (maxY - minY) / 2 - n.height / 2;
      else if (alignment === 'bottom') y = maxY - n.height;

      updatedNodes[id] = { ...n, x: Math.round(x), y: Math.round(y) };
    });

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  nudgeSelected: (dx, dy) => {
    const { selectedIds, project } = get();
    if (selectedIds.length === 0) return;

    get().pushHistorySnapshot();
    const updatedNodes = { ...project.nodes };

    selectedIds.forEach((id) => {
      const n = updatedNodes[id];
      if (!n) return;

      const isRoot = !n.parentId;
      let nextStyle = n.style;

      // If a static child node is nudged, automatically switch it to relative so it can be offset smoothly
      if (!isRoot && n.style?.position === 'static') {
        nextStyle = { ...n.style, position: 'relative' };
      }

      if (isRoot || n.style?.position !== 'sticky') {
        updatedNodes[id] = {
          ...n,
          x: Math.round(n.x + dx),
          y: Math.round(n.y + dy),
          style: nextStyle,
        };
      }
    });

    set({
      project: {
        ...project,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  bringToFront: (id) => {
    const { project, reorderNode } = get();
    const node = project.nodes[id];
    if (!node) return;
    reorderNode(id, node.parentId, 0);
  },

  sendToBack: (id) => {
    const { project, reorderNode } = get();
    const node = project.nodes[id];
    if (!node) return;
    const siblings = node.parentId ? project.nodes[node.parentId]?.children || [] : project.rootNodeIds;
    reorderNode(id, node.parentId, siblings.length);
  },

  moveUp: (id) => {
    const { project, reorderNode } = get();
    const node = project.nodes[id];
    if (!node) return;
    const siblings = node.parentId ? project.nodes[node.parentId]?.children || [] : project.rootNodeIds;
    const currIndex = siblings.indexOf(id);
    if (currIndex > 0) {
      reorderNode(id, node.parentId, currIndex - 1);
    }
  },

  moveDown: (id) => {
    const { project, reorderNode } = get();
    const node = project.nodes[id];
    if (!node) return;
    const siblings = node.parentId ? project.nodes[node.parentId]?.children || [] : project.rootNodeIds;
    const currIndex = siblings.indexOf(id);
    if (currIndex >= 0 && currIndex < siblings.length - 1) {
      reorderNode(id, node.parentId, currIndex + 2);
    }
  },

  undo: () => {
    const { undoStack, redoStack, project } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    const currentSnapshot = {
      nodes: JSON.parse(JSON.stringify(project.nodes)),
      rootNodeIds: [...project.rootNodeIds],
    };

    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],
      project: {
        ...project,
        nodes: previous.nodes,
        rootNodeIds: previous.rootNodeIds,
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  redo: () => {
    const { undoStack, redoStack, project } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const currentSnapshot = {
      nodes: JSON.parse(JSON.stringify(project.nodes)),
      rootNodeIds: [...project.rootNodeIds],
    };

    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, currentSnapshot],
      project: {
        ...project,
        nodes: next.nodes,
        rootNodeIds: next.rootNodeIds,
        updatedAt: new Date().toISOString(),
      },
    });
    get().saveDraftToStorage();
  },

  setProject: (newProject, handle) => {
    set({
      project: newProject,
      fileHandle: handle || null,
      selectedIds: newProject.rootNodeIds.length > 0 ? [newProject.rootNodeIds[0]] : [],
      undoStack: [],
      redoStack: [],
    });
    get().saveDraftToStorage();
  },

  resetToInitialDemo: () => {
    const initial = createInitialProject();
    set({
      project: {
        id: `proj_${Date.now()}`,
        name: 'Untitled Vector Design',
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        nodes: initial.nodes,
        rootNodeIds: initial.rootNodeIds,
      },
      selectedIds: [initial.rootNodeIds[0]],
      undoStack: [],
      redoStack: [],
    });
    get().saveDraftToStorage();
  },

  renameProject: (name) => {
    set((state) => ({
      project: { ...state.project, name },
    }));
    get().saveDraftToStorage();
  },

  saveDraftToStorage: () => {
    const { project } = get();
    storageService.saveDraft(project);
  },

  loadDraftFromStorage: async () => {
    const draft = await storageService.loadDraft();
    if (draft && draft.nodes && Object.keys(draft.nodes).length > 0) {
      set({
        project: draft,
        selectedIds: draft.rootNodeIds.length > 0 ? [draft.rootNodeIds[0]] : [],
      });
    }
  },

  setCodeExportOpen: (open) => set({ isCodeExportOpen: open }),
  setGraphicExportOpen: (open) => set({ isGraphicExportOpen: open }),
  setLivePreviewOpen: (open) => set({ isLivePreviewOpen: open }),
}));
