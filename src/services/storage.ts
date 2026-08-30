import localforage from 'localforage';
import type { ProjectState } from '../types/canvas';

// Configure LocalForage to use IndexedDB
localforage.config({
  name: 'WebScapeEditor',
  storeName: 'projects_store',
  description: 'IndexedDB storage for WebScape vector editor projects',
});

const DRAFT_KEY = 'webscape_current_draft';

export const storageService = {
  async saveDraft(project: ProjectState): Promise<void> {
    try {
      await localforage.setItem(DRAFT_KEY, project);
    } catch (err) {
      console.error('Failed to save project draft to IndexedDB:', err);
    }
  },

  async loadDraft(): Promise<ProjectState | null> {
    try {
      return await localforage.getItem<ProjectState>(DRAFT_KEY);
    } catch (err) {
      console.error('Failed to load project draft from IndexedDB:', err);
      return null;
    }
  },

  async clearDraft(): Promise<void> {
    try {
      await localforage.removeItem(DRAFT_KEY);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  },
};
