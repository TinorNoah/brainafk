// Appwrite service for data persistence and caching
import { Client, Databases, Query } from 'node-appwrite';
import type { ModelPricing } from './artificial-analysis-api';

interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  collectionId: string;
}

interface CacheDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  modelsData: string; // JSON string of ModelPricing[]
  timestamp: number;
  cacheType: 'ai_models';
}

class AppwriteService {
  private client: Client;
  private databases: Databases;
  private config: AppwriteConfig;

  constructor() {
    // Validate environment variables
    this.config = {
      endpoint: process.env.APPWRITE_ENDPOINT || '',
      projectId: process.env.APPWRITE_PROJECT_ID || '',
      apiKey: process.env.APPWRITE_API_KEY || '',
      databaseId: process.env.APPWRITE_DATABASE_ID || '',
      collectionId: process.env.APPWRITE_COLLECTION_ID || '',
    };

    // Check for missing required environment variables
    const missingVars = Object.entries(this.config)
      .filter(([, value]) => !value)
      .map(([key]) => `APPWRITE_${key.toUpperCase()}`);

    if (missingVars.length > 0) {
      throw new Error(`Missing required Appwrite environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize Appwrite client
    this.client = new Client()
      .setEndpoint(this.config.endpoint)
      .setProject(this.config.projectId)
      .setKey(this.config.apiKey);

    this.databases = new Databases(this.client);
  }

  /**
   * Check if the cached data is still valid based on the specified hours
   */
  async isCacheValid(hours: number): Promise<boolean> {
    try {
      const cacheDocument = await this.getLatestCacheDocument();
      if (!cacheDocument) return false;

      const now = Date.now();
      const cacheAge = now - cacheDocument.timestamp;
      const maxAge = hours * 60 * 60 * 1000; // Convert hours to milliseconds

      return cacheAge < maxAge;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get cached models from Appwrite
   */
  async getModels(): Promise<ModelPricing[]> {
    try {
      const cacheDocument = await this.getLatestCacheDocument();
      if (!cacheDocument) return [];
      
      // Parse the JSON string back to ModelPricing[]
      return JSON.parse(cacheDocument.modelsData);
    } catch (error) {
      console.error('Error retrieving models from Appwrite:', error);
      return [];
    }
  }

  /**
   * Store models in Appwrite database
   */
  async storeModels(models: ModelPricing[]): Promise<void> {
    try {
      const data = {
        modelsData: JSON.stringify(models), // Store as JSON string
        timestamp: Date.now(),
        cacheType: 'ai_models' as const,
      };

      // Try to update existing cache document or create new one
      try {
        const existingDocument = await this.getLatestCacheDocument();
        if (existingDocument) {
          await this.databases.updateDocument(
            this.config.databaseId,
            this.config.collectionId,
            existingDocument.$id,
            data
          );
          console.log('Updated existing cache document in Appwrite');
        } else {
          throw new Error('No existing document found');
        }
      } catch (updateError) {
        // If update fails or no document exists, create a new one
        await this.databases.createDocument(
          this.config.databaseId,
          this.config.collectionId,
          'unique()', // Let Appwrite generate a unique ID
          data
        );
        console.log('Created new cache document in Appwrite');
      }
    } catch (error) {
      console.error('Error storing models in Appwrite:', error);
      
      // If it's a schema error, provide helpful guidance
      if (error instanceof Error && error.message.includes('Unknown attribute')) {
        console.error('Appwrite collection schema needs to be configured with the following attributes:');
        console.error('- modelsData (type: string, size: 1000000, required: true)');
        console.error('- timestamp (type: integer, required: true)');
        console.error('- cacheType (type: string, size: 50, required: true)');
        
        // Fallback: Don't throw error, just log it to allow the app to continue
        console.warn('Continuing without Appwrite cache due to schema mismatch');
        return;
      }
      
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      // Get all cache documents
      const response = await this.databases.listDocuments(
        this.config.databaseId,
        this.config.collectionId,
        [
          Query.equal('cacheType', 'ai_models'),
          Query.limit(100) // Adjust limit as needed
        ]
      );

      // Delete all cache documents
      const deletePromises = response.documents.map(doc =>
        this.databases.deleteDocument(
          this.config.databaseId,
          this.config.collectionId,
          doc.$id
        )
      );

      await Promise.all(deletePromises);
      console.log(`Cleared ${response.documents.length} cache documents from Appwrite`);
    } catch (error) {
      console.error('Error clearing cache from Appwrite:', error);
      throw error;
    }
  }

  /**
   * Get the timestamp of the latest cache entry
   */
  async getLatestCacheTimestamp(): Promise<Date | null> {
    try {
      const cacheDocument = await this.getLatestCacheDocument();
      return cacheDocument ? new Date(cacheDocument.timestamp) : null;
    } catch (error) {
      console.error('Error getting latest cache timestamp:', error);
      return null;
    }
  }

  /**
   * Get the latest cache document from Appwrite
   */
  private async getLatestCacheDocument(): Promise<CacheDocument | null> {
    try {
      const response = await this.databases.listDocuments(
        this.config.databaseId,
        this.config.collectionId,
        [
          Query.equal('cacheType', 'ai_models'),
          Query.orderDesc('timestamp'),
          Query.limit(1)
        ]
      );

      return response.documents.length > 0 ? response.documents[0] as unknown as CacheDocument : null;
    } catch (error) {
      console.error('Error getting latest cache document:', error);
      return null;
    }
  }

  /**
   * Test the connection to Appwrite
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.databases.get(this.config.databaseId);
      console.log('Appwrite connection test successful');
      return true;
    } catch (error) {
      console.error('Appwrite connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
let appwriteServiceInstance: AppwriteService | null = null;

/**
 * Get the singleton Appwrite service instance
 */
export function getAppwriteService(): AppwriteService {
  if (!appwriteServiceInstance) {
    appwriteServiceInstance = new AppwriteService();
  }
  return appwriteServiceInstance;
}

// Export the service class for testing purposes
export { AppwriteService };
export type { AppwriteConfig, CacheDocument };
