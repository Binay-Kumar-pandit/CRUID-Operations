import { supabase } from '../config/supabase';
import { Idea, Profile, Sale, Category } from '../config/supabase';
import toast from 'react-hot-toast';

// Enhanced error handling
const handleError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error);
  const message = error?.message || defaultMessage;
  toast.error(message);
  throw new Error(message);
};

// Ideas API
export const ideasAPI = {
  // Get all ideas with filters
  getAll: async (filters?: { 
    search?: string; 
    category?: string; 
    limit?: number; 
    offset?: number;
    userId?: string;
  }) => {
    try {
      let query = supabase
        .from('ideas')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.limit) {
        const offset = filters.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error } = await query;
      
      if (error) {
        handleError(error, 'Failed to fetch ideas');
      }

      return data || [];
    } catch (error) {
      handleError(error, 'Failed to load ideas');
      return [];
    }
  },

  // Get single idea by ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        handleError(error, 'Idea not found');
      }

      // Increment view count
      await supabase.rpc('increment_idea_views', { idea_uuid: id });

      return data;
    } catch (error) {
      handleError(error, 'Failed to load idea');
      return null;
    }
  },

  // Create new idea
  create: async (ideaData: Partial<Idea>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create an idea');
      }

      const { data, error } = await supabase
        .from('ideas')
        .insert([{
          ...ideaData,
          user_id: user.id,
          status: 'active'
        }])
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        handleError(error, 'Failed to create idea');
      }

      toast.success('Idea created successfully!');
      return data;
    } catch (error) {
      handleError(error, 'Failed to create idea');
      return null;
    }
  },

  // Update idea
  update: async (id: string, ideaData: Partial<Idea>) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .update(ideaData)
        .eq('id', id)
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        handleError(error, 'Failed to update idea');
      }

      toast.success('Idea updated successfully!');
      return data;
    } catch (error) {
      handleError(error, 'Failed to update idea');
      return null;
    }
  },

  // Delete idea
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) {
        handleError(error, 'Failed to delete idea');
      }

      toast.success('Idea deleted successfully!');
      return true;
    } catch (error) {
      handleError(error, 'Failed to delete idea');
      return false;
    }
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        handleError(error, 'Failed to fetch categories');
      }

      return data || [];
    } catch (error) {
      handleError(error, 'Failed to load categories');
      return [];
    }
  }
};

// Analytics API
export const analyticsAPI = {
  // Get user analytics
  getUserAnalytics: async (userId: string) => {
    try {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear];
      
      const analyticsData = await Promise.all(
        years.map(async (year) => {
          const startDate = `${year}-01-01`;
          const endDate = `${year}-12-31`;

          // Get ideas for the year
          const { data: ideas, error: ideasError } = await supabase
            .from('ideas')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (ideasError) throw ideasError;

          // Get sales for the year
          const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('*')
            .eq('seller_id', userId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (salesError) throw salesError;

          const totalRevenue = sales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
          const categories = ideas?.reduce((acc: any, idea) => {
            acc[idea.category] = (acc[idea.category] || 0) + 1;
            return acc;
          }, {}) || {};

          return {
            year,
            ideas: ideas?.length || 0,
            revenue: totalRevenue,
            sales: sales?.length || 0,
            categories,
            monthlyData: Array.from({ length: 12 }, (_, month) => {
              const monthIdeas = ideas?.filter(idea => {
                const ideaDate = new Date(idea.created_at);
                return ideaDate.getMonth() === month;
              }) || [];

              const monthSales = sales?.filter(sale => {
                const saleDate = new Date(sale.created_at);
                return saleDate.getMonth() === month;
              }) || [];

              return {
                month: month + 1,
                monthName: new Date(year, month).toLocaleString('default', { month: 'short' }),
                ideas: monthIdeas.length,
                revenue: monthSales.reduce((sum, sale) => sum + sale.amount, 0),
                sales: monthSales.length
              };
            })
          };
        })
      );

      return analyticsData;
    } catch (error) {
      handleError(error, 'Failed to load analytics');
      return [];
    }
  },

  // Get overall platform analytics
  getPlatformAnalytics: async () => {
    try {
      const { data: ideas, error: ideasError } = await supabase
        .from('ideas')
        .select('category, price, created_at');

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('amount, created_at');

      if (ideasError) throw ideasError;
      if (salesError) throw salesError;

      const totalIdeas = ideas?.length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
      const categories = ideas?.reduce((acc: any, idea) => {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalIdeas,
        totalRevenue,
        totalSales: sales?.length || 0,
        categories
      };
    } catch (error) {
      handleError(error, 'Failed to load platform analytics');
      return null;
    }
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const ideas = await ideasAPI.getAll({ limit: 1 });
    console.log('✅ API connection successful');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};


// Example API wrapper
export const supabaseAPI = {
  getCourses: async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return data;
  },

  createCourse: async (course: { title: string; description: string }) => {
    const { data, error } = await supabase.from('courses').insert([course]);
    if (error) throw error;
    return data;
  }
};
