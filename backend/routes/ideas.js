import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import { validateIdea, validateUpdateIdea } from '../middleware/validation.js';

const router = express.Router();

// GET /api/ideas - Get all ideas with optional search and filter
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('ideas')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: ideas, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ ideas, count: ideas.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/ideas/:id - Get single idea
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: idea, error } = await supabase
      .from('ideas')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          username
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    res.json({ idea });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/ideas - Create new idea
router.post('/', authenticateUser, validateIdea, async (req, res) => {
  try {
    const ideaData = {
      ...req.body,
      user_id: req.user.id,
      tags: req.body.tags || []
    };

    const { data: idea, error } = await supabase
      .from('ideas')
      .insert([ideaData])
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          username
        )
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ idea });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/ideas/:id - Update idea
router.patch('/:id', authenticateUser, validateUpdateIdea, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the idea exists and user owns it
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    if (existingIdea.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this idea' });
    }

    const { data: idea, error } = await supabase
      .from('ideas')
      .update(req.body)
      .eq('id', id)
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          username
        )
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ idea });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/ideas/:id - Delete idea
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the idea exists and user owns it
    const { data: existingIdea, error: fetchError } = await supabase
      .from('ideas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    if (existingIdea.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this idea' });
    }

    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;