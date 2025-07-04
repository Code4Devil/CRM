import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const DealForm = ({ deal, contacts, stages, salesReps, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    probability: 50,
    stage: 'lead',
    expected_close_date: '',
    user_id: null,
    contact_id: null,
    description: '',

  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value || '',
        probability: deal.probability || 50,
        stage: deal.stage || 'lead',
        expected_close_date: deal.expected_close_date || '',
        user_id: deal.user_id || null,
        contact_id: deal.contact_id || null,
        description: deal.description || '',

      });
    }
  }, [deal]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };



  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Deal name is required';
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }
    
    if (!formData.expected_close_date) {
      newErrors.expected_close_date = 'Expected close date is required';
    }
    
    if (!formData.user_id) {
      newErrors.user_id = 'Assigned representative is required';
    }
    
    if (!formData.contact_id) {
      newErrors.contact_id = 'Primary contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      setHasChanges(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStageColor = (stage) => {
    const stageObj = stages.find(s => s.value === stage);
    return stageObj ? stageObj.color : 'bg-gray-100 text-gray-800';
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-success';
    if (probability >= 60) return 'text-warning';
    if (probability >= 40) return 'text-accent';
    return 'text-error';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Deal Information</h2>
        {hasChanges && (
          <span className="text-sm text-warning flex items-center space-x-1">
            <Icon name="AlertCircle" size={16} />
            <span>Unsaved changes</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Deal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-error' : ''}`}
              placeholder="Enter deal title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Deal Value *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || '')}
                className={`input-field pl-8 ${errors.value ? 'border-error' : ''}`}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
            {errors.value && (
              <p className="mt-1 text-sm text-error">{errors.value}</p>
            )}
            {formData.value && (
              <p className="mt-1 text-sm text-text-secondary">
                {formatCurrency(formData.value)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Expected Close Date *
            </label>
            <input
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
              className={`input-field ${errors.expected_close_date ? 'border-error' : ''}`}
            />
            {errors.expected_close_date && (
              <p className="mt-1 text-sm text-error">{errors.expectedCloseDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Deal Stage *
            </label>
            <select
              value={formData.stage}
              onChange={(e) => handleInputChange('stage', e.target.value)}
              className="input-field"
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageColor(formData.stage)}`}>
                {stages.find(s => s.value === formData.stage)?.label}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Assigned To *
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => handleInputChange('user_id', e.target.value)}
              className={`input-field ${errors.user_id ? 'border-error' : ''}`}
            >
              <option value="">Select Sales Rep</option>
              {salesReps.map(rep => (
                <option key={rep.value} value={rep.value}>{rep.label}</option>
              ))}
            </select>
            {errors.user_id && (
              <p className="mt-1 text-sm text-error">{errors.user_id}</p>
            )}
          </div>
        </div>

        {/* Probability Slider */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Win Probability
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => handleInputChange('probability', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">0%</span>
              <span className={`text-lg font-semibold ${getProbabilityColor(formData.probability)}`}>
                {formData.probability}%
              </span>
              <span className="text-sm text-text-secondary">100%</span>
            </div>
          </div>
        </div>

        {/* Contact Association */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Primary Contact *
          </label>
          <select
              value={formData.contact_id}
              onChange={(e) => handleInputChange('contact_id', e.target.value)}
              className={`input-field ${errors.contact_id ? 'border-error' : ''}`}
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
            {errors.contact_id && (
              <p className="mt-1 text-sm text-error">{errors.contact_id}</p>
            )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Deal Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="input-field resize-none"
            placeholder="Enter deal description, requirements, and notes..."
          />
        </div>



        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="Save" size={16} />
                <span>Save Deal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealForm;