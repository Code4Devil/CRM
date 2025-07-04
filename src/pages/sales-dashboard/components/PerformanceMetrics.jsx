import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';
import analyticsService from '../../../utils/analyticsService';
import { useAuth } from 'contexts/AuthContext';

const PerformanceMetrics = ({ data: propData }) => {
  const { user } = useAuth();
  const [data, setData] = useState(propData || {});
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState(null);

  // Load performance data if not provided via props
  useEffect(() => {
    if (!propData && user) {
      loadPerformanceData();
    }
  }, [propData, user]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await analyticsService.getPerformanceMetrics(user?.id);
      
      if (result?.success) {
        setData(result.data);
      } else {
        setError(result?.error || 'Failed to load performance metrics');
      }
    } catch (error) {
      setError('Failed to load performance metrics');
      console.log('Performance metrics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value?.toLocaleString() || 0}`;
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-normal text-text-primary mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-normal text-text-primary mb-6">Performance Metrics</h2>
        <div className="text-center py-8">
          <Icon name="AlertCircle" size={24} className="text-error mx-auto mb-2" />
          <p className="text-text-secondary">{error}</p>
          <button 
            onClick={loadPerformanceData}
            className="btn-primary btn-sm mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-normal text-text-primary mb-6">Performance Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quota Achievement */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Quota Achievement</h3>
            <Icon name="Target" size={16} className="text-blue-600" />
          </div>
          <div className="mb-3">
            <div className="text-2xl font-bold text-blue-900">
              {data?.percentage || 0}%
            </div>
            <div className="text-xs text-blue-700">
              {formatCurrency(data?.achieved || 0)} of {formatCurrency(data?.quota || 0)}
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(data?.percentage || 0, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Deals Won/Lost */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Deals Closed</h3>
            <Icon name="TrendingUp" size={16} className="text-green-600" />
          </div>
          <div className="mb-3">
            <div className="text-2xl font-bold text-green-900">
              {(data?.dealsWon || 0) + (data?.dealsLost || 0)}
            </div>
            <div className="text-xs text-green-700">
              {data?.dealsWon || 0} won, {data?.dealsLost || 0} lost
            </div>
          </div>
          <div className="flex space-x-1">
            <div 
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${((data?.dealsWon || 0) / Math.max((data?.dealsWon || 0) + (data?.dealsLost || 0), 1)) * 100}%` }}
            ></div>
            <div 
              className="bg-red-400 h-2 rounded-full"
              style={{ width: `${((data?.dealsLost || 0) / Math.max((data?.dealsWon || 0) + (data?.dealsLost || 0), 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Average Deal Size */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900">Avg Deal Size</h3>
            <Icon name="DollarSign" size={16} className="text-purple-600" />
          </div>
          <div className="mb-3">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(data?.avgDealSize || 0)}
            </div>
            <div className="text-xs text-purple-700">
              Active pipeline: {formatCurrency(data?.activePipeline || 0)}
            </div>
          </div>
          <div className="text-xs text-purple-700">
            {data?.activeDealCount || 0} active deals
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900">Conversion Rate</h3>
            <Icon name="BarChart3" size={16} className="text-orange-600" />
          </div>
          <div className="mb-3">
            <div className="text-2xl font-bold text-orange-900">
              {data?.conversionRate || 0}%
            </div>
            <div className="text-xs text-orange-700">
              Win rate from closed deals
            </div>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(data?.conversionRate || 0, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Quota Progress:</span>
            <span className={`ml-2 font-medium ${getPerformanceColor(data?.percentage || 0)}`}>
              {data?.percentage >= 90 ? 'Excellent' : 
               data?.percentage >= 70 ? 'On Track' : 
               data?.percentage >= 50 ? 'Needs Attention' : 'Below Target'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Deal Activity:</span>
            <span className="ml-2 font-medium text-gray-900">
              {data?.activeDealCount || 0} deals in pipeline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;