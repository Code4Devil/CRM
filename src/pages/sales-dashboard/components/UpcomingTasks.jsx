import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

import { useAuth } from '../../../contexts/AuthContext';
import taskService from '../../../utils/taskService';
import { Link } from 'react-router-dom';

const UpcomingTasks = ({ tasks: propTasks }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(propTasks || []);
  const [loading, setLoading] = useState(!propTasks);
  const [error, setError] = useState(null);

  // Load tasks if not provided via props
  useEffect(() => {
    if (!propTasks && user) {
      loadUpcomingTasks();
    }
  }, [propTasks, user]);

  const loadUpcomingTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching upcoming tasks for user:', user.id);
      const result = await taskService.getUpcomingTasks(user.id, 5);
      
      if (result?.success) {
        console.log('Successfully fetched tasks:', result.data);
        setTasks(result.data);
      } else {
        console.error('Failed to load tasks:', result?.error);
        setError(result?.error || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Exception while loading upcoming tasks:', error);
      setError('Failed to load upcoming tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await taskService.completeTask(taskId);
      
      if (result?.success) {
        // Remove completed task from list
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } else {
        setError(result?.error || 'Failed to complete task');
      }
    } catch (error) {
      setError('Failed to complete task');
      console.log('Task completion error:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority] || colors.medium;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium text-text-primary mb-4">Upcoming Tasks</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium text-text-primary mb-4">Upcoming Tasks</h3>
        <div className="text-center py-4">
          <Icon name="AlertCircle" size={24} className="text-error mx-auto mb-2" />
          <p className="text-text-secondary text-sm">{error}</p>
          <button 
            onClick={loadUpcomingTasks}
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-text-primary">Upcoming Tasks</h3>
        <Link to="/tasks" className="text-primary hover:text-primary-dark text-sm">
          View all
        </Link>
      </div>
      
      {tasks?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
          <p className="text-text-secondary">All caught up! No upcoming tasks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks?.map((task) => (
            <div 
              key={task.id} 
              className={`p-3 rounded-lg border ${task.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs ${task.isOverdue ? 'text-red-600 font-medium' : 'text-text-secondary'}`}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-text-primary text-sm mb-1">
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className="text-text-secondary text-xs mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  {(task.contact || task.deal) && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      {task.contact && (
                        <span>📧 {task.contact}</span>
                      )}
                      {task.deal && (
                        <span>💼 {task.deal}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="ml-2 p-1 text-text-secondary hover:text-success transition-colors"
                  title="Mark as complete"
                >
                  <Icon name="Check" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;