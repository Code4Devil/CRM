import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AddActivityModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'email',
    title: '',
    description: '',
    contact: '',
    company: '',
    priority: 'medium',
    channel: 'gmail',
    scheduledDate: '',
    scheduledTime: '',
    duration: '',
    location: '',
    attendees: ''
  });

  const activityTypes = [
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'call', label: 'Call', icon: 'Phone' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar' },
    { value: 'task', label: 'Task', icon: 'CheckSquare' },
    { value: 'note', label: 'Note', icon: 'FileText' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-success' },
    { value: 'medium', label: 'Medium', color: 'text-warning' },
    { value: 'high', label: 'High', color: 'text-error' }
  ];

  const channels = [
    { value: 'gmail', label: 'Gmail' },
    { value: 'twilio', label: 'Phone' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'manual', label: 'Manual Entry' }
  ];

  const contacts = [
    'Sarah Johnson - TechCorp Solutions',
    'David Chen - InnovateTech',
    'Mark Thompson - GlobalTech Industries',
    'Lisa Park - GlobalTech Industries',
    'Robert Kim - StartupXYZ'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('New activity:', formData);
    onClose();
    // Reset form
    setFormData({
      type: 'email',
      title: '',
      description: '',
      contact: '',
      company: '',
      priority: 'medium',
      channel: 'gmail',
      scheduledDate: '',
      scheduledTime: '',
      duration: '',
      location: '',
      attendees: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-surface shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Add New Activity</h3>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all duration-150 ease-out"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Activity Type</label>
              <div className="grid grid-cols-5 gap-2">
                {activityTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all duration-150 ease-out ${
                      formData.type === type.value
                        ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-300 text-text-secondary'
                    }`}
                  >
                    <Icon name={type.icon} size={20} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter activity title..."
                className="input-field"
                required
              />
            </div>

            {/* Contact & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Contact</label>
                <select
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select contact...</option>
                  {contacts.map((contact, index) => (
                    <option key={index} value={contact}>{contact}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="input-field"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Channel */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Communication Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => handleInputChange('channel', e.target.value)}
                className="input-field"
              >
                {channels.map((channel) => (
                  <option key={channel.value} value={channel.value}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter activity description..."
                rows={4}
                className="input-field resize-none"
                required
              />
            </div>

            {/* Conditional Fields based on Activity Type */}
            {(formData.type === 'meeting' || formData.type === 'call') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {formData.type === 'meeting' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Meeting location..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="60"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Icon name="Plus" size={16} />
                <span>Add Activity</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;