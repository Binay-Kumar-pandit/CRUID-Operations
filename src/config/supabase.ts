import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const supabaseUrl = 'https://hxxcrhfovofwcvygntzb.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eGNyaGZvdm9md2N2eWdudHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4Nzk5NzksImV4cCI6MjA3MTQ1NTk3OX0.r6BJ5GxirmBc11HnwczB6cTgi3noAjCl-lEJ3UZJ7oE';

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