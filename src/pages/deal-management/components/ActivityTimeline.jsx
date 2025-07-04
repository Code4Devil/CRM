import React, { useState, useEffect } from 'react';
import activityService from '../../../utils/activityService';
import Icon from 'components/AppIcon';

const ActivityTimeline = ({ contact, dealId }) => {
  const [activities, setActivities] = useState([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'note',
    title: '',
    description: ''
  });

  const activityTypes = [
    { value: 'email', label: 'Email', icon: 'Mail', color: 'bg-blue-100 text-blue-600' },
    { value: 'call', label: 'Call', icon: 'Phone', color: 'bg-green-100 text-green-600' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar', color: 'bg-purple-100 text-purple-600' },
    { value: 'note', label: 'Note', icon: 'FileText', color: 'bg-gray-100 text-gray-600' },
    { value: 'task', label: 'Task', icon: 'CheckSquare', color: 'bg-orange-100 text-orange-600' }
  ];

  const getActivityTypeInfo = (type) => {
    return activityTypes.find(t => t.value === type) || activityTypes[3];
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const handleAddActivity = async () => {
    if (newActivity.title.trim()) {
      const activity = {
        id: Date.now(),
        type: newActivity.type,
        title: newActivity.title,
        description: newActivity.description,
        timestamp: new Date().toISOString(),
        user: "You",
        contactId: contact?.id,
        dealId: dealId
      };
      
      const { success, error } = await activityService.createActivity(activity);
      if (success) {
        console.log('Activity added successfully:', activity);
        setNewActivity({ type: 'note', title: '', description: '' });
        setShowAddActivity(false);
        refreshActivities();
      } else {
        console.error('Failed to add activity:', error);
        // Handle error, e.g., show an error message to the user
      }
    }
  };

  useEffect(() => {
    refreshActivities();
  }, [contact?.id, dealId]);

  const refreshActivities = async () => {
    if (contact?.id || dealId) {
      const { data, success, error } = await activityService.getActivityTimeline(50, {
        contactId: contact?.id,
        dealId: dealId
      });
      if (success) {
        setActivities(data);
      } else {
        console.error('Failed to fetch activities:', error);
      }
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
        <button
          onClick={() => setShowAddActivity(!showAddActivity)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-50 text-primary rounded-lg hover:bg-primary-100 transition-colors duration-150"
        >
          <Icon name="Plus" size={16} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Contact Info */}
      {contact && (
        <div className="bg-surface-hover rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-text-primary">{contact.name}</h4>
              <p className="text-sm text-text-secondary">{contact.title}</p>
              <div className="flex items-center space-x-4 mt-1">
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-sm text-primary hover:underline flex items-center space-x-1"
                >
                  <Icon name="Mail" size={14} />
                  <span>{contact.email}</span>
                </a>
                <a 
                  href={`tel:${contact.phone}`}
                  className="text-sm text-primary hover:underline flex items-center space-x-1"
                >
                  <Icon name="Phone" size={14} />
                  <span>{contact.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Form */}
      {showAddActivity && (
        <div className="bg-surface-hover rounded-lg p-4 mb-6">
          <h4 className="font-medium text-text-primary mb-3">Add New Activity</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Activity Type
              </label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                className="input-field"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Title
              </label>
              <input
                type="text"
                value={newActivity.title}
                onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter activity title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description
              </label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="input-field resize-none"
                placeholder="Enter activity description"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAddActivity}
                disabled={!newActivity.title.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
              <button
                onClick={() => setShowAddActivity(false)}
                className="px-3 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No activities yet</p>
            <p className="text-sm text-text-tertiary">Add your first activity to start tracking interactions</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const typeInfo = getActivityTypeInfo(activity.type);
            
            return (
              <div key={activity.id} className="flex space-x-3">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                    <Icon name={typeInfo.icon} size={16} />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px h-6 bg-border mt-2"></div>
                  )}
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary">{activity.title}</h4>
                      <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
                    </div>
                    <div className="text-xs text-text-tertiary ml-4">
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-xs text-text-tertiary">by {activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      
    </div>
  );
};

export default ActivityTimeline;