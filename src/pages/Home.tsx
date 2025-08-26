import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, Lightbulb, AlertCircle } from 'lucide-react';
import IdeaCard from '../components/IdeaCard';
import SearchAndFilter from '../components/SearchAndFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ideasAPI, categoriesAPI, testConnection } from '../services/api';
import { Idea, Category } from '../config/supabase';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [searchTerm, selectedCategory]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setConnectionError(false);

      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        setConnectionError(true);
        return;
      }

      // Load categories and initial ideas
      await Promise.all([
        loadCategories(),
        loadIdeas()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      setConnectionError(true);
      toast.error('Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadIdeas = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: 50
      };

      const data = await ideasAPI.getAll(filters);
      setIdeas(data);
    } catch (error) {
      console.error('Error loading ideas:', error);
      setConnectionError(true);
    }
  };

  const handleEdit = (idea: Idea) => {
    navigate(`/edit-idea/${idea.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    const success = await ideasAPI.delete(id);
    if (success) {
      setIdeas(ideas.filter(idea => idea.id !== id));
    }
  };

  const stats = [
    {
      name: 'Total Ideas',
      value: ideas.length.toString(),
      icon: Lightbulb,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Categories',
      value: categories.length.toString(),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Active Users',
      value: new Set(ideas.map(idea => idea.user_id)).size.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Database Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to connect to the database. Please check your Supabase configuration.
          </p>
          <button
            onClick={initializeData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Amazing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Ideas
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore innovative concepts, share your creativity, and connect with like-minded entrepreneurs
            in our vibrant marketplace of ideas.
          </p>
          {user && (
            <button
              onClick={() => navigate('/add-idea')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Share Your Idea</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories.map(cat => cat.name)}
        />

        {/* Ideas Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No ideas found' : 'No ideas yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to share an innovative idea!'}
            </p>
            {user && (
              <button
                onClick={() => navigate('/add-idea')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add First Idea</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;