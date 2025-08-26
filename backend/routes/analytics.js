import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/overview - Get user's analytics overview
router.get('/overview', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total ideas count
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('id, price, created_at, category')
      .eq('user_id', userId);

    if (ideasError) {
      return res.status(500).json({ error: ideasError.message });
    }

    const totalIdeas = ideas.length;
    const totalRevenue = ideas.reduce((sum, idea) => sum + (idea.price || 0), 0);
    
    // Get categories distribution
    const categories = ideas.reduce((acc, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {});

    // Get monthly data for current year
    const currentYear = new Date().getFullYear();
    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const monthIdeas = ideas.filter(idea => {
        const ideaDate = new Date(idea.created_at);
        return ideaDate.getFullYear() === currentYear && ideaDate.getMonth() === month;
      });

      return {
        month: month + 1,
        ideas: monthIdeas.length,
        revenue: monthIdeas.reduce((sum, idea) => sum + (idea.price || 0), 0)
      };
    });

    res.json({
      totalIdeas,
      totalRevenue,
      categories,
      monthlyData
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/yearly/:year - Get analytics for specific year
router.get('/yearly/:year', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.params.year);

    if (isNaN(year) || year < 2020 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const totalIdeas = ideas.length;
    const totalRevenue = ideas.reduce((sum, idea) => sum + (idea.price || 0), 0);
    
    // Categories distribution
    const categories = ideas.reduce((acc, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {});

    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const monthIdeas = ideas.filter(idea => {
        const ideaDate = new Date(idea.created_at);
        return ideaDate.getMonth() === month;
      });

      return {
        month: month + 1,
        monthName: new Date(year, month).toLocaleString('default', { month: 'short' }),
        ideas: monthIdeas.length,
        revenue: monthIdeas.reduce((sum, idea) => sum + (idea.price || 0), 0)
      };
    });

    res.json({
      year,
      totalIdeas,
      totalRevenue,
      categories,
      monthlyData,
      ideas: ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
        category: idea.category,
        price: idea.price,
        created_at: idea.created_at
      }))
    });
  } catch (error) {
    console.error('Yearly analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;