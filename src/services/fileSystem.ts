import type { ProjectState } from '../types/canvas';

export const fileSystemService = {
  // Save Project JSON file (with File System Access API or download fallback)
  async saveProjectFile(project: ProjectState, fileHandle?: any): Promise<any> {
    const jsonString = JSON.stringify(project, null, 2);
    const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.webscape`;

    // Try modern File System Access API if available
    if ('showSaveFilePicker' in window && !fileHandle) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'WebScape Vector Project File',
              accept: { 'application/json': ['.webscape', '.json'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return handle;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        console.warn('File System Access API failed or cancelled, falling back to download:', err);
      }
    } else if (fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return fileHandle;
      } catch (err) {
        console.warn('Existing handle save failed, falling back to download:', err);
      }
    }

    // Fallback: Trigger Blob Download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return null;
  },

  // Open Project JSON file
  async openProjectFile(): Promise<{ project: ProjectState; handle: any } | null> {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'WebScape Vector Project File',
              accept: { 'application/json': ['.webscape', '.json'] },
            },
          ],
          multiple: false,
        });
        const file = await handle.getFile();
        const text = await file.text();
        const project = JSON.parse(text) as ProjectState;
        return { project, handle };
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        console.warn('File System Access picker failed, falling back to input file:', err);
      }
    }

    // Fallback: Standard file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.webscape,.json';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const text = await file.text();
        try {
          const project = JSON.parse(text) as ProjectState;
          resolve({ project, handle: null });
        } catch (parseErr) {
          alert('Invalid WebScape project file format!');
          resolve(null);
        }
      };
      input.click();
    });
  },

  // Helper to download text file (.html, .css, .jsx, .tsx)
  downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
