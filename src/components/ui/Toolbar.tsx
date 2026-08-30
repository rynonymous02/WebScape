import React from 'react';
import { 
  MousePointer, Hand, Square, Circle, PenTool, Type, Frame, ZoomIn, Image as ImageIcon,
  Sun, Moon
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import type { ToolType } from '../../types/canvas';

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const TOOLS: ToolItem[] = [
  { id: 'select', label: 'Select / Transform', icon: MousePointer, shortcut: 'V' },
  { id: 'hand', label: 'Pan Canvas', icon: Hand, shortcut: 'H' },
  { id: 'frame', label: 'Frame / Container (Flex)', icon: Frame, shortcut: 'F' },
  { id: 'rectangle', label: 'Rectangle Shape', icon: Square, shortcut: 'R' },
  { id: 'ellipse', label: 'Circle / Ellipse Shape', icon: Circle, shortcut: 'E' },
  { id: 'path', label: 'Bezier Curve Pen', icon: PenTool, shortcut: 'P' },
  { id: 'text', label: 'Text Heading / Paragraph', icon: Type, shortcut: 'T' },
  { id: 'zoom', label: 'Zoom Tool (Scroll / Click)', icon: ZoomIn, shortcut: 'Z' },
  { id: 'image', label: 'Image & Vector Object', icon: ImageIcon, shortcut: 'I' },
];

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, theme, toggleTheme } = useProjectStore();

  return (
    <aside className={`w-12 border-r flex flex-col items-center py-3 justify-between select-none z-20 shadow-md transition-colors ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Tool List */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              
              {/* Tooltip on hover */}
              <div className="absolute left-12 bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded shadow-lg border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 flex items-center gap-1.5">
                <span>{tool.label}</span>
                <kbd className="bg-slate-800 text-slate-400 px-1 py-0.5 text-[10px] rounded font-mono">
                  {tool.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preferences / Theme Mode Toggle at Bottom */}
      <div className="pt-2 border-t w-full flex justify-center border-slate-800">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative ${
            theme === 'dark'
              ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}

          {/* Tooltip on hover */}
          <div className="absolute left-12 bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded shadow-lg border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 flex items-center gap-1.5">
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
