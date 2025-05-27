// Artificial Analysis API integration with Appwrite persistence
import { getAppwriteService } from './appwrite-service';

export interface ModelPricing {
  id: string;
  name: string;
  slug: string;
  model_creator: {
    id: string;
    name: string;
    slug: string;
  };
  pricing: {
    price_1m_input_tokens: number;
    price_1m_output_tokens: number;
    price_1m_blended_3_to_1: number;
  };
  evaluations?: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_math_index?: number;
  };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
}

export interface APIResponse {
  status: number;
  data: ModelPricing[];
  prompt_options: {
    parallel_queries: number;
    prompt_length: string;
  };
}

const API_BASE_URL = 'https://artificialanalysis.ai/api/v2';

// This function should only be called on the server side
function getAPIKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('API key should not be accessed on the client side');
  }
  
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  if (!apiKey) {
    throw new Error('ARTIFICIAL_ANALYSIS_API_KEY environment variable is not set');
  }
  
  return apiKey;
}

export class ArtificialAnalysisAPI {
  private static instance: ArtificialAnalysisAPI;
  private cache: { data: ModelPricing[]; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {}

  public static getInstance(): ArtificialAnalysisAPI {
    if (!ArtificialAnalysisAPI.instance) {
      ArtificialAnalysisAPI.instance = new ArtificialAnalysisAPI();
    }
    return ArtificialAnalysisAPI.instance;
  }

  private async fetchModels(): Promise<ModelPricing[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/llms/models`, {
        method: 'GET',
        headers: {
          'x-api-key': getAPIKey(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      return data.data.filter(model => model.pricing && model.pricing.price_1m_input_tokens && model.pricing.price_1m_output_tokens);
    } catch (error) {
      console.error('Error fetching models from Artificial Analysis API:', error);
      throw error;
    }
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = Date.now();
    return (now - this.cache.timestamp) < this.CACHE_DURATION;
  }

  public async getModels(): Promise<ModelPricing[]> {
    try {
      const appwriteService = getAppwriteService();
      
      // Check if Appwrite cache is valid
      const isCacheValid = await appwriteService.isCacheValid(24); // 24 hours
      
      if (isCacheValid) {
        console.log('Using cached data from Appwrite database');
        const cachedModels = await appwriteService.getModels();
        
        // Update local cache for faster subsequent access
        this.cache = {
          data: cachedModels,
          timestamp: Date.now(),
        };
        
        return cachedModels;
      }

      // Fetch fresh data from API
      console.log('Fetching fresh data from Artificial Analysis API');
      const models = await this.fetchModels();
      
      // Try to store in Appwrite (with graceful fallback)
      try {
        await appwriteService.storeModels(models);
      } catch (appwriteError) {
        console.warn('Failed to store in Appwrite, continuing without cache:', appwriteError);
      }
      
      // Update local cache
      this.cache = {
        data: models,
        timestamp: Date.now(),
      };

      return models;
    } catch (error) {
      console.error('Error in getModels:', error);
      
      // Try to fallback to local cache
      if (this.cache && this.cache.data) {
        console.log('Using local cache as fallback');
        return this.cache.data;
      }
      
      // Try to fallback to Appwrite cache (even if expired)
      try {
        const appwriteService = getAppwriteService();
        const cachedModels = await appwriteService.getModels();
        if (cachedModels.length > 0) {
          console.log('Using expired Appwrite cache as fallback');
          return cachedModels;
        }
      } catch (appwriteError) {
        console.error('Error accessing Appwrite fallback:', appwriteError);
      }
      
      // If all else fails, throw error
      throw error;
    }
  }

  public async initializeFromStorage(): Promise<void> {
    // This method is kept for compatibility but does nothing on server-side
    // Server-side caching is handled via Appwrite
  }

  public async clearCache(): Promise<void> {
    this.cache = null;
    try {
      const appwriteService = getAppwriteService();
      await appwriteService.clearCache();
      console.log('Cleared both local and Appwrite cache');
    } catch (error) {
      console.error('Error clearing Appwrite cache:', error);
    }
  }

  public async getCacheInfo(): Promise<{ hasCache: boolean; lastUpdated?: Date; isValid: boolean }> {
    try {
      const appwriteService = getAppwriteService();
      const lastUpdated = await appwriteService.getLatestCacheTimestamp();
      const isValid = await appwriteService.isCacheValid(24);
      
      return {
        hasCache: !!lastUpdated,
        lastUpdated: lastUpdated || undefined,
        isValid,
      };
    } catch (error) {
      console.error('Error getting cache info from Appwrite:', error);
      
      // Fallback to local cache info
      return {
        hasCache: !!this.cache,
        lastUpdated: this.cache ? new Date(this.cache.timestamp) : undefined,
        isValid: this.isCacheValid(),
      };
    }
  }
}

// Helper function to transform API data to chart format
export function transformToChartData(models: ModelPricing[]) {
  return models.map(model => ({
    name: model.name,
    Input: model.pricing.price_1m_input_tokens,
    Output: model.pricing.price_1m_output_tokens,
    creator: model.model_creator.name,
    intelligenceIndex: model.evaluations?.artificial_analysis_intelligence_index,
    codingIndex: model.evaluations?.artificial_analysis_coding_index,
    mathIndex: model.evaluations?.artificial_analysis_math_index,
  }));
}
