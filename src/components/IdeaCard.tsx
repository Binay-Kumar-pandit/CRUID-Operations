import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Tag, DollarSign, Calendar, User } from 'lucide-react';
import { Idea } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

interface IdeaCardProps {
  idea: Idea;
  onEdit?: (idea: Idea) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
  const { user } = useAuth();
  const isOwner = user?.id === idea.user_id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group">
      {/* Image */}
      {idea.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={idea.image_url}
            alt={idea.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {idea.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{idea.profiles?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(idea.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-lg font-bold text-green-600 dark:text-green-400">
            <DollarSign className="h-5 w-5" />
            <span>{formatPrice(idea.price)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {idea.description}
        </p>

        {/* Category and Tags */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
              {idea.category}
            </span>
          </div>
          
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex items-center space-x-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {idea.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {idea.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                    +{idea.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to={`/ideas/${idea.id}`}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </Link>

            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit?.(idea)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete?.(idea.id)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaCard;