import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Eye, Tag, DollarSign, Calendar, User, Heart, Share2 } from 'lucide-react';
import { Idea } from '../config/supabase';
import { ideasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const IdeaView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadIdea();
    }
  }, [id]);

  const loadIdea = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await ideasAPI.getById(id);
      setIdea(data);
    } catch (error) {
      console.error('Error loading idea:', error);
      toast.error('Failed to load idea');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (idea) {
      navigate(`/edit-idea/${idea.id}`);
    }
  };

  const handleDelete = async () => {
    if (!idea || !window.confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    const success = await ideasAPI.delete(idea.id);
    if (success) {
      navigate('/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Idea not found</h2>
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === idea.user_id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Image */}
          {idea.image_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={idea.image_url}
                alt={idea.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {idea.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{idea.profiles?.username || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(idea.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{idea.views_count || 0} views</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatPrice(idea.price)}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category and Tags */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full">
                  {idea.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                  {idea.status}
                </span>
              </div>
              
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex items-center space-x-2 flex-wrap">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {idea.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Idea</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Idea</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaView;