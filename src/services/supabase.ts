import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/environment';

// Database types
export interface PageView {
  id: number;
  page: string;
  count: number;
  last_updated: string;
}

export interface Database {
  public: {
    Tables: {
      page_views: {
        Row: PageView;
        Insert: Omit<PageView, 'id' | 'last_updated'>;
        Update: Partial<Omit<PageView, 'id'>>;
      };
    };
    Functions: {
      increment_page_views: {
        Args: { page_name: string };
        Returns: { count: number };
      };
    };
  };
}

// Supabase client instance
let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!config.supabase.enabled) {
    return null;
  }

  if (!supabaseClient && config.supabase.url && config.supabase.anonKey) {
    supabaseClient = createClient<Database>(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          persistSession: false, // We don't need user authentication
        },
      }
    );
  }

  return supabaseClient;
}

// Page view operations
export class PageViewService {
  private client: SupabaseClient<Database> | null;

  constructor() {
    this.client = getSupabaseClient();
  }

  async incrementPageViews(
    page: string = 'home'
  ): Promise<{ count: number } | null> {
    if (!this.client) {
      throw new Error('Supabase client not available');
    }

    try {
      // Use RPC function for atomic increment
      const { data, error } = await this.client.rpc('increment_page_views', {
        page_name: page,
      });

      if (error) {
        throw error;
      }

      // RPC functions return arrays, extract first element
      if (data && Array.isArray(data) && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error incrementing page views:', error);
      throw error;
    }
  }

  async getPageViews(page: string = 'home'): Promise<number> {
    if (!this.client) {
      throw new Error('Supabase client not available');
    }

    try {
      const { data, error } = await this.client
        .from('page_views')
        .select('count')
        .eq('page', page)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected for new pages
        throw error;
      }

      return data?.count || 0;
    } catch (error) {
      console.error('Error getting page views:', error);
      return 0;
    }
  }

  async createPageIfNotExists(page: string = 'home'): Promise<void> {
    if (!this.client) {
      throw new Error('Supabase client not available');
    }

    try {
      const { error } = await this.client
        .from('page_views')
        .upsert(
          { page, count: 0 },
          { onConflict: 'page', ignoreDuplicates: true }
        );

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }
}

export const pageViewService = new PageViewService();
