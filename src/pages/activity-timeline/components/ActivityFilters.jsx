import React from 'react';
import Icon from 'components/AppIcon';

const ActivityFilters = ({ filters, onFilterChange }) => {
  const activityTypes = [
    { value: '', label: 'All Activities', icon: 'Activity' }, // Changed 'all' to '' for default
    { value: 'email', label: 'Emails', icon: 'Mail' },
    { value: 'call', label: 'Calls', icon: 'Phone' },
    { value: 'meeting', label: 'Meetings', icon: 'Calendar' },
    { value: 'task', label: 'Tasks', icon: 'CheckSquare' }
  ];

  const dateRanges = [
    { value: 'thisWeek', label: 'This Week' }, // Default
    { value: 'today', label: 'Today' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'allTime', label: 'All Time' }
  ];

  return (
    <div className="space-y-6">
      {/* Activity Type Filter */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Activity Type</h4>
        <div className="space-y-2">
          {activityTypes.map((type) => (
            <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={filters.type === type.value}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2">
                <Icon name={type.icon} size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">{type.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Date Range</h4>
        <div className="space-y-2">
          {dateRanges.map((range) => (
            <label key={range.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="dateRange"
                value={range.value}
                checked={filters.dateRange === range.value}
                onChange={(e) => onFilterChange('dateRange', e.target.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary-500"
              />
              <span className="text-sm text-text-secondary">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
     
    </div>
  );
};

export default ActivityFilters;