import { supabase } from './supabase';

interface CachedAudio {
  textHash: string;
  audioUrl: string;
  audioBlob?: Blob;
  timestamp: number;
  entryId: string;
}

interface AudioCacheDB extends IDBDatabase {
  // Define the structure for type safety
}

class AudioCacheManager {
  private dbName = 'ChodeOracleAudioCache';
  private storeName = 'audioStore';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'textHash' });
          store.createIndex('entryId', 'entryId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private generateTextHash(text: string): string {
    // Simple hash function for text content
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  async getCachedAudio(entryId: string, text: string): Promise<string | null> {
    console.log(`🎵 [CACHE] Checking cache for entry: ${entryId}`);
    
    const textHash = this.generateTextHash(text);
    
    try {
      // 1. Check local IndexedDB cache first (fastest)
      const localAudio = await this.getFromIndexedDB(textHash);
      if (localAudio && localAudio.audioBlob) {
        console.log(`✅ [CACHE] Found in local IndexedDB cache`);
        const audioUrl = URL.createObjectURL(localAudio.audioBlob);
        return audioUrl;
      }

      // 2. Check if audio already exists in database (backend)
      const backendAudio = await this.getFromBackend(entryId);
      if (backendAudio) {
        console.log(`✅ [CACHE] Found in backend, downloading for local cache`);
        
        // Download and cache locally for future use
        const audioBlob = await this.downloadAudioBlob(backendAudio);
        if (audioBlob) {
          await this.storeInIndexedDB({
            textHash,
            audioUrl: backendAudio,
            audioBlob,
            timestamp: Date.now(),
            entryId
          });
          
          const audioUrl = URL.createObjectURL(audioBlob);
          return audioUrl;
        }
        
        // Fallback to direct URL if blob download fails
        return backendAudio;
      }

      console.log(`❌ [CACHE] No cached audio found, will need to generate`);
      return null;

    } catch (error) {
      console.error('❌ [CACHE] Error checking cache:', error);
      return null;
    }
  }

  async storeCachedAudio(entryId: string, text: string, audioUrl: string): Promise<void> {
    console.log(`💾 [CACHE] Storing audio in cache for entry: ${entryId}`);
    
    const textHash = this.generateTextHash(text);
    
    try {
      // Download the audio blob for local storage
      const audioBlob = await this.downloadAudioBlob(audioUrl);
      if (!audioBlob) {
        console.warn(`⚠️ [CACHE] Failed to download audio blob, storing URL only`);
        return;
      }

      // Store in IndexedDB
      await this.storeInIndexedDB({
        textHash,
        audioUrl,
        audioBlob,
        timestamp: Date.now(),
        entryId
      });

      console.log(`✅ [CACHE] Successfully cached audio locally`);

    } catch (error) {
      console.error('❌ [CACHE] Error storing cache:', error);
    }
  }

  private async getFromIndexedDB(textHash: string): Promise<CachedAudio | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(textHash);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedAudio | undefined;
        
        // Check if cache is still valid (7 days)
        if (result && (Date.now() - result.timestamp) < 7 * 24 * 60 * 60 * 1000) {
          resolve(result);
        } else if (result) {
          // Clean up expired cache
          this.removeFromIndexedDB(textHash);
          resolve(null);
        } else {
          resolve(null);
        }
      };
    });
  }

  private async storeInIndexedDB(cachedAudio: CachedAudio): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cachedAudio);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async removeFromIndexedDB(textHash: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(textHash);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getFromBackend(entryId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chode_lore_entries')
        .select('tts_audio_url')
        .eq('id', entryId)
        .single();

      if (error) {
        console.error('❌ [CACHE] Backend check error:', error);
        return null;
      }

      return data?.tts_audio_url || null;
    } catch (error) {
      console.error('❌ [CACHE] Backend check failed:', error);
      return null;
    }
  }

  private async downloadAudioBlob(audioUrl: string): Promise<Blob | null> {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Verify it's audio content
      if (!blob.type.startsWith('audio/')) {
        console.warn(`⚠️ [CACHE] Invalid audio type: ${blob.type}`);
        return null;
      }
      
      return blob;
    } catch (error) {
      console.error('❌ [CACHE] Audio download failed:', error);
      return null;
    }
  }

  async clearExpiredCache(): Promise<void> {
    console.log(`🧹 [CACHE] Cleaning expired cache entries`);
    
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`✅ [CACHE] Cleaned ${deletedCount} expired entries`);
        }
      };
      
    } catch (error) {
      console.error('❌ [CACHE] Cache cleanup failed:', error);
    }
  }

  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const entries = request.result as CachedAudio[];
          const totalSize = entries.reduce((sum, entry) => {
            return sum + (entry.audioBlob?.size || 0);
          }, 0);
          
          resolve({
            totalEntries: entries.length,
            totalSize
          });
        };
      });
    } catch (error) {
      console.error('❌ [CACHE] Stats failed:', error);
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const audioCache = new AudioCacheManager();

// Utility function for components
export const formatCacheSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}; 