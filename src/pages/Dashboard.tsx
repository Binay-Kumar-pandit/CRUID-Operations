import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Lightbulb, Calendar, Eye } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ideasAPI, analyticsAPI } from '../services/api';
import { Idea } from '../config/supabase';
import toast from 'react-hot-toast';

interface AnalyticsData {
  year: number;
  ideas: number;
  revenue: number;
  categories: Record<string, number>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [analytics, ideas] = await Promise.all([
        analyticsAPI.getUserAnalytics(user.id),
        ideasAPI.getAll({ userId: user.id, limit: 100 })
      ]);

      setAnalyticsData(analytics);
      setUserIdeas(ideas);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const currentYearData = analyticsData.find(data => data.year === selectedYear);
  const totalIdeas = analyticsData.reduce((sum, data) => sum + data.ideas, 0);
  const totalRevenue = analyticsData.reduce((sum, data) => sum + data.revenue, 0);
  const availableYears = analyticsData.map(data => data.year).sort((a, b) => b - a);

  const stats = [
    {
      name: 'Total Ideas',
      value: totalIdeas.toString(),
      icon: Lightbulb,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      name: `${selectedYear} Ideas`,
      value: currentYearData?.ideas.toString() || '0',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      name: `${selectedYear} Revenue`,
      value: `$${currentYearData?.revenue.toLocaleString() || '0'}`,
      icon: BarChart3,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your ideas performance and revenue over time
          </p>
        </div>

        {/* Year Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {analyticsData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AnalyticsChart
              data={analyticsData}
              type="bar"
              title="Ideas Created by Year"
            />
            <AnalyticsChart
              data={analyticsData}
              type="line"
              title="Revenue by Year"
            />
            <div className="lg:col-span-2">
              <AnalyticsChart
                data={analyticsData}
                type="pie"
                title="Ideas by Category"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No analytics data yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create some ideas to see your analytics dashboard
            </p>
          </div>
        )}

        {/* Recent Ideas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Ideas</h2>
          </div>
          <div className="p-6">
            {userIdeas.length > 0 ? (
              <div className="space-y-4">
                {userIdeas.slice(0, 5).map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{idea.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {idea.category} • ${idea.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No ideas created yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;