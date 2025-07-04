import React, { useState, useMemo, useEffect } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';

import ActivityCard from './components/ActivityCard';
import ActivityFilters from './components/ActivityFilters';
import AddActivityModal from './components/AddActivityModal';

import analyticsService from '../../utils/analyticsService';
import activityService from '../../utils/activityService';

const ActivityTimeline = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    dateRange: 'thisWeek',
    contactId: '',
    dealId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      if (!user || authLoading) return;

      try {
        setLoading(true);
        setError(null);

        // Calculate date range
        const dateFilters = getDateRangeFilters(filters.dateRange);
        
        const result = await analyticsService.getActivityTimeline(50, {
          type: filters.type || undefined,
          contactId: filters.contactId || undefined,
          dealId: filters.dealId || undefined,
          ...dateFilters
        });

        if (result?.success) {
          setActivities(result.data);
          setFilteredActivities(result.data);
        } else {
          setError(result?.error || 'Failed to load activities');
        }

      } catch (error) {
        setError('Failed to load activity timeline');
        console.log('Activity timeline loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [user, authLoading, filters]);

  // Helper function to get date range filters
  const getDateRangeFilters = (range) => {
    const now = new Date();
    let dateFrom;

    switch (range) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'thisWeek':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case 'thisMonth':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        dateFrom = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      default:
        dateFrom = new Date(now.getFullYear(), 0, 1);
    }

    return {
      dateFrom: dateFrom.toISOString(),
      dateTo: now.toISOString()
    };
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle add activity
  const handleAddActivity = async (activityData) => {
    try {
      const result = await activityService.createActivity({
        ...activityData,
        user_id: user.id,
        activity_date: new Date().toISOString()
      });

      if (result?.success) {
        // Refresh activities
        setIsAddModalOpen(false);
        window.location.reload(); // Simple refresh for now
      } else {
        setError(result?.error || 'Failed to add activity');
      }
    } catch (error) {
      setError('Failed to add activity');
      console.log('Add activity error:', error);
    }
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    const icons = {
      email: 'Mail',
      call: 'Phone',
      meeting: 'Calendar',
      note: 'FileText',
      task: 'CheckSquare',
      demo: 'Monitor'
    };
    return icons[type] || 'Activity';
  };

  // Get activity color
  const getActivityColor = (type) => {
    const colors = {
      email: 'bg-blue-100 text-blue-600 border-blue-200',
      call: 'bg-green-100 text-green-600 border-green-200',
      meeting: 'bg-purple-100 text-purple-600 border-purple-200',
      note: 'bg-gray-100 text-gray-600 border-gray-200',
      task: 'bg-orange-100 text-orange-600 border-orange-200',
      demo: 'bg-red-100 text-red-600 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Format activity date
  const formatActivityDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading activity timeline...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Activity Timeline</h1>
              <p className="text-text-secondary">
                Track all sales activities and interactions
              </p>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary mt-4 lg:mt-0"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Add Activity
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ActivityFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Activity Timeline */}
            <div className="lg:col-span-3">
              {error && (
                <div className="card p-4 mb-6 border-l-4 border-red-500 bg-red-50">
                  <div className="flex items-center">
                    <Icon name="AlertCircle" size={20} className="text-red-600 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {filteredActivities?.length === 0 ? (
                <div className="card p-8 text-center">
                  <Icon name="Calendar" size={48} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No Activities Found</h3>
                  <p className="text-text-secondary mb-4">
                    {filters.type || filters.contactId || filters.dealId 
                      ? 'No activities match your current filters.' :'No activities recorded yet.'}
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary"
                  >
                    Add First Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredActivities?.map((activity, index) => (
                    <div key={activity.id} className="relative">
                      {/* Timeline connector */}
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                      )}
                      
                      <ActivityCard
                        activity={activity}
                        getActivityIcon={getActivityIcon}
                        getActivityColor={getActivityColor}
                        formatActivityDate={formatActivityDate}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Activity Modal */}
      {isAddModalOpen && (
        <AddActivityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddActivity}
        />
      )}
    </div>
  );
};

export default ActivityTimeline;