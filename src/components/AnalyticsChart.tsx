import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsData {
  year: number;
  ideas: number;
  revenue: number;
  categories: Record<string, number>;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  type: 'bar' | 'line' | 'pie';
  title: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, type, title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartColors = {
    text: isDark ? '#E5E7EB' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB',
    background: isDark ? '#1F2937' : '#FFFFFF'
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis 
          dataKey="year" 
          stroke={chartColors.text}
          fontSize={12}
        />
        <YAxis 
          stroke={chartColors.text}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: chartColors.background,
            border: `1px solid ${chartColors.grid}`,
            borderRadius: '8px',
            color: chartColors.text
          }}
        />
        <Bar dataKey="ideas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis 
          dataKey="year" 
          stroke={chartColors.text}
          fontSize={12}
        />
        <YAxis 
          stroke={chartColors.text}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: chartColors.background,
            border: `1px solid ${chartColors.grid}`,
            borderRadius: '8px',
            color: chartColors.text
          }}
          formatter={(value) => [`$${value}`, 'Revenue']}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10B981" 
          strokeWidth={3}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    // Aggregate categories across all years
    const categoryData = data.reduce((acc, yearData) => {
      Object.entries(yearData.categories).forEach(([category, count]) => {
        acc[category] = (acc[category] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: chartColors.background,
              border: `1px solid ${chartColors.grid}`,
              borderRadius: '8px',
              color: chartColors.text
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

export default AnalyticsChart;