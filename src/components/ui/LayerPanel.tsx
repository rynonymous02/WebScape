import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, Frame, Square, Circle, PenTool, Type, Image as ImageIcon,
  Lock, Unlock, Eye, EyeOff, Layers, Plus, Trash2, FolderPlus, GripVertical, Copy 
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import type { NodeType } from '../../types/canvas';
import { AssetPanel } from './AssetPanel';

export const LayerPanel: React.FC = () => {
  const {
    project,
    selectedIds,
    setSelectedIds,
    toggleSelectId,
    updateNode,
    hoveredId,
    setHoveredId,
    deleteSelected,
    duplicateSelected,
    addNode,
    reorderNode,
    theme,
    leftSidebarTab,
  } = useProjectStore();

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');

  // Drag and Drop States
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPos, setDropPos] = useState<'above' | 'below' | 'inside' | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIconForType = (type: NodeType) => {
    switch (type) {
      case 'frame': return Frame;
      case 'rectangle': return Square;
      case 'ellipse': return Circle;
      case 'path': return PenTool;
      case 'text': return Type;
      case 'image': return ImageIcon;
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (nameInput.trim()) {
      updateNode(id, { name: nameInput.trim() });
    }
    setEditingId(null);
  };

  const isDark = theme === 'dark';

  const renderLayerItem = (nodeId: string, depth: number = 0) => {
    const node = project.nodes[nodeId];
    if (!node) return null;

    const isSelected = selectedIds.includes(node.id);
    const isHovered = hoveredId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds[node.id] !== false; // expanded by default
    const Icon = getIconForType(node.type);

    const isDropTarget = dropTargetId === node.id;
    const isBeingDragged = draggedNodeId === node.id;

    const handleDragStart = (e: React.DragEvent) => {
      e.stopPropagation();
      setDraggedNodeId(node.id);
      e.dataTransfer.setData('text/plain', node.id);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
      setDraggedNodeId(null);
      setDropTargetId(null);
      setDropPos(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggedNodeId || draggedNodeId === node.id) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const relY = e.clientY - rect.top;

      if (node.type === 'frame') {
        if (relY <= 6) {
          setDropPos('above');
        } else if (relY >= rect.height - 6) {
          setDropPos('below');
        } else {
          setDropPos('inside');
        }
      } else {
        if (relY <= rect.height / 2) {
          setDropPos('above');
        } else {
          setDropPos('below');
        }
      }
      setDropTargetId(node.id);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;
      // Only clear if pointer truly left the row bounding box
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        if (dropTargetId === node.id) {
          setDropTargetId(null);
          setDropPos(null);
        }
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggedNodeId || draggedNodeId === node.id) {
        setDropTargetId(null);
        setDropPos(null);
        return;
      }

      if (dropPos === 'inside' && node.type === 'frame') {
        reorderNode(draggedNodeId, node.id, 0);
      } else {
        const parentId = node.parentId;
        const siblings = parentId ? project.nodes[parentId]?.children || [] : project.rootNodeIds;
        const oldIdx = siblings.indexOf(draggedNodeId);
        let targetIdx = siblings.indexOf(node.id);

        if (targetIdx !== -1) {
          if (dropPos === 'above') {
            if (oldIdx !== -1 && oldIdx < targetIdx) {
              targetIdx -= 1;
            }
            reorderNode(draggedNodeId, parentId, Math.max(0, targetIdx));
          } else if (dropPos === 'below') {
            if (oldIdx !== -1 && oldIdx > targetIdx) {
              targetIdx += 1;
            }
            reorderNode(draggedNodeId, parentId, targetIdx);
          }
        }
      }

      setDraggedNodeId(null);
      setDropTargetId(null);
      setDropPos(null);
    };

    return (
      <div key={node.id} className="flex flex-col relative select-none">
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={(e) => {
            e.stopPropagation();
            if (e.shiftKey) toggleSelectId(node.id);
            else setSelectedIds([node.id]);
          }}
          onDoubleClick={() => {
            setEditingId(node.id);
            setNameInput(node.name);
          }}
          onMouseEnter={() => setHoveredId(node.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={`h-7 flex items-center justify-between px-2 text-xs rounded transition-colors cursor-pointer group relative ${
            isBeingDragged
              ? 'opacity-40 bg-indigo-500/10'
              : isSelected
              ? 'bg-indigo-600/30 text-white border-l-2 border-indigo-500 font-medium'
              : isHovered
              ? isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-900'
              : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          } ${isDropTarget && dropPos === 'inside' ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : ''}`}
          style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
        >
          {/* Drop indicator above (Absolute, 0 layout shift) */}
          {isDropTarget && dropPos === 'above' && (
            <div className="absolute top-0 left-1 right-1 h-0.5 bg-indigo-500 rounded-full z-30 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,1)]" />
          )}

          {/* Drop indicator below (Absolute, 0 layout shift) */}
          {isDropTarget && dropPos === 'below' && (
            <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-500 rounded-full z-30 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,1)]" />
          )}

          {/* Left: Drag Handle, Expand arrow, Icon, Name */}
          <div className="flex items-center gap-1.5 truncate flex-1 pointer-events-none">
            <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-60 text-slate-400 shrink-0" />
            
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white pointer-events-auto"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <div className="w-4" />
            )}

            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />

            {editingId === node.id ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => handleRenameSubmit(node.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(node.id)}
                autoFocus
                className={`text-xs px-1.5 py-0.5 rounded outline-none border border-indigo-500 w-28 pointer-events-auto ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
                }`}
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>

          {/* Right: Visibility & Lock Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateNode(node.id, { hidden: !node.hidden });
              }}
              title={node.hidden ? 'Show Layer' : 'Hide Layer'}
              className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white"
            >
              {node.hidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateNode(node.id, { locked: !node.locked });
              }}
              title={node.locked ? 'Unlock Layer' : 'Lock Layer'}
              className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white"
            >
              {node.locked ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Render Children Recursively */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children.map((childId) => renderLayerItem(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNodeId) {
      reorderNode(draggedNodeId, null);
      setDraggedNodeId(null);
    }
  };

  return (
    <aside className={`w-64 border-r flex flex-col h-full select-none z-20 transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* RENDER ACTIVE TAB: LAYERS TREE */}
      {leftSidebarTab === 'layers' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Panel Header */}
          <div className={`h-10 border-b px-3 flex items-center justify-between font-semibold shrink-0 ${
            isDark ? 'border-slate-800 text-white bg-slate-900/50' : 'border-slate-200 text-slate-900 bg-slate-50'
          }`}>
            <div className="flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Layers Tree</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => addNode('frame', 100, 100)}
                title="Add New Frame Container"
                className={`p-1 rounded text-slate-400 ${isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}
              >
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              </button>
              <button
                onClick={() => addNode('rectangle', 120, 120)}
                title="Add New Shape"
                className={`p-1 rounded text-slate-400 ${isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={duplicateSelected}
                disabled={selectedIds.length === 0}
                title="Duplicate Selected Layer (Ctrl+D)"
                className={`p-1 rounded text-slate-400 disabled:opacity-30 ${isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-200 hover:text-slate-900'}`}
              >
                <Copy className="w-3.5 h-3.5 text-sky-400" />
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedIds.length === 0}
                title="Delete Selected Layer (Delete)"
                className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 disabled:opacity-30 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Layer List Tree */}
          <div 
            className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleRootDrop}
          >
            {project.rootNodeIds.map((id) => renderLayerItem(id, 0))}

            {/* Drop zone to move node to root level */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-indigo-500/10', 'border-indigo-500/40');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-indigo-500/10', 'border-indigo-500/40');
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove('bg-indigo-500/10', 'border-indigo-500/40');
                handleRootDrop(e);
              }}
              className="flex-1 min-h-[48px] rounded border border-dashed border-transparent transition-all flex items-center justify-center text-[10px] text-slate-500"
            >
              {draggedNodeId && <span>Drop here to move to root canvas</span>}
            </div>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB: MENU ASET (ASSETS) */}
      {leftSidebarTab === 'assets' && (
        <AssetPanel />
      )}
    </aside>
  );
};
