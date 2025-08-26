import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const supabaseUrl = 'https://uyvkatufuqunxokpzxlm.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dmthdHVmdXF1bnhva3B6eGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDQ1NzgsImV4cCI6MjA3MTcyMDU3OH0.PuD0CJ97Iez7pGB6eCDmwF_VU1KyBDwgKLT5kBsymT8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  image_url?: string;
  status: 'active' | 'sold' | 'draft';
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  idea_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  created_at: string;
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('ideas').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};