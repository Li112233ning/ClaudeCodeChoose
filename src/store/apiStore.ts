import { create } from 'zustand';

// Add ApiSourceData interface to match the one in index.tsx
interface ApiSourceData {
  id?: number;
  name: string;
  apiKey: string;
  api_base: string;
  model?: string;
  is_default: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiSource {
  id?: number;
  name: string;
  apiKey: string;
  api_base: string;
  model?: string;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 模型相关接口
export interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
}

export interface QueryModelsResult {
  success: boolean;
  message: string;
  models: ModelInfo[];
  isDefault?: boolean;
}

interface ApiState {
  sources: ApiSource[];
  activeSource: ApiSource | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSources: (sources: ApiSource[]) => void;
  addSource: (source: ApiSource) => void;
  updateSource: (id: number, source: Partial<ApiSource>) => void;
  removeSource: (id: number) => void;
  setActiveSource: (source: ApiSource | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  loadSources: () => Promise<void>;
  saveSource: (source: ApiSource) => Promise<void>;
  deleteSource: (id: number) => Promise<void>;
  switchToSource: (id: number) => Promise<void>;
  testConnection: (source: ApiSource) => Promise<{ success: boolean; message: string }>;
  queryModels: (source: ApiSource) => Promise<QueryModelsResult>;
}

export const useApiStore = create<ApiState>((set, get) => ({
  sources: [],
  activeSource: null,
  isLoading: false,
  error: null,

  setSources: (sources) => set({ sources }),
  
  addSource: (source) => set((state) => ({
    sources: [...state.sources, source]
  })),
  
  updateSource: (id, updatedSource) => set((state) => ({
    sources: state.sources.map(source => 
      source.id === id ? { ...source, ...updatedSource } : source
    )
  })),
  
  removeSource: (id) => set((state) => ({
    sources: state.sources.filter(source => source.id !== id),
    activeSource: state.activeSource?.id === id ? null : state.activeSource
  })),
  
  setActiveSource: (source) => set({ activeSource: source }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  loadSources: async () => {
    try {
      set({ isLoading: true, error: null });
      
      if (window.electronAPI) {
        const sources = await window.electronAPI.getApiSources();
        const activeSource = sources.find(source => source.is_active) || null;
        
        // Convert ApiSourceData to ApiSource by ensuring is_active is boolean
        const convertedSources: ApiSource[] = sources.map(source => ({
          ...source,
          is_active: source.is_active ?? false
        }));
        
        const convertedActiveSource: ApiSource | null = activeSource ? {
          ...activeSource,
          is_active: activeSource.is_active ?? false
        } : null;
        
        set({ 
          sources: convertedSources, 
          activeSource: convertedActiveSource,
          isLoading: false 
        });
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to load sources:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load sources',
        isLoading: false 
      });
    }
  },

  saveSource: async (source) => {
    try {
      set({ isLoading: true, error: null });
      
      if (window.electronAPI) {
        // 确保字段名正确传递给后端
        const sourceData = {
          id: source.id,
          name: source.name,
          apiKey: source.apiKey,
          api_base: source.api_base,
          model: source.model,
          is_default: source.is_default
        };
        const result = await window.electronAPI.saveApiSource(sourceData);
        
        if (source.id) {
          // Update existing source
          get().updateSource(source.id, source);
        } else {
          // Add new source with the returned ID - handle both number and boolean return types
          if (typeof result === 'number') {
            get().addSource({ ...source, id: result });
          }
        }
        
        // Reload sources to get updated data
        await get().loadSources();
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to save source:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save source',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteSource: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      if (window.electronAPI) {
        const success = await window.electronAPI.deleteApiSource(id);
        
        if (success) {
          get().removeSource(id);
        } else {
          throw new Error('Failed to delete source');
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to delete source:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete source',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  switchToSource: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      if (window.electronAPI) {
        const result = await window.electronAPI.switchApiSource(id);
        
        if (result.success) {
          const source = get().sources.find(s => s.id === id);
          if (source) {
            // Update active states
            const updatedSources = get().sources.map(s => ({
              ...s,
              is_active: s.id === id
            }));
            
            set({ 
              sources: updatedSources,
              activeSource: { ...source, is_active: true }
            });
          }
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to switch source:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to switch source',
        isLoading: false 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  testConnection: async (source) => {
    try {
      if (window.electronAPI) {
        // 确保字段名正确传递给后端
        const sourceData = {
          name: source.name,
          apiKey: source.apiKey,
          api_base: source.api_base,
          model: source.model,
          is_default: source.is_default || false,
          is_active: source.is_active || false
        };
        return await window.electronAPI.testApiConnection(sourceData);
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to test connection' 
      };
    }
  },

  queryModels: async (source) => {
    try {
      if (window.electronAPI) {
        // 确保字段名正确传递给后端
        const sourceData = {
          name: source.name,
          apiKey: source.apiKey,
          api_base: source.api_base,
          model: source.model,
          is_default: source.is_default || false,
          is_active: source.is_active || false
        };
        return await window.electronAPI.queryModels(sourceData);
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to query models:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to query models',
        models: []
      };
    }
  },
}));
