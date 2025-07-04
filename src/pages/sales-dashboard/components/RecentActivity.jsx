import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { useState, useEffect } from 'react';
import activityService from 'utils/activityService';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { success, data, error } = await activityService.getRecentActivities();
        if (success) {
          setActivities(data);
        } else {
          setError(error);
        }
      } catch (err) {
        setError('Failed to fetch recent activities.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary-700 transition-colors duration-150">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            {/* Activity Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-surface-hover rounded-full flex items-center justify-center">
              <Icon name={activity.icon} size={14} className={activity.iconColor} />
            </div>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Image
                  src={activity.user?.avatar || activity.contact?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
                  alt={activity.user?.name || activity.contact?.name || 'User Avatar'}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-text-primary">
                  {activity.user?.name || activity.contact?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-text-tertiary">•</span>
                <span className="text-xs text-text-tertiary">
                  {activity.relativeTime}
                </span>
              </div>
              
              <p className="text-sm font-medium text-text-primary mb-1">
                {activity.subject}
              </p>
              
              <p className="text-xs text-text-secondary line-clamp-2">
                {activity.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-sm text-text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center space-x-2">
          <Icon name="ChevronDown" size={16} />
          <span>Load More Activities</span>
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;