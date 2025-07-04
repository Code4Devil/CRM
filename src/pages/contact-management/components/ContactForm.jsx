import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ContactForm = ({ contact, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    position: contact?.position || '',
    avatar: contact?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
    tags: contact?.tags || [],
    notes: contact?.notes || '',
    socialProfiles: contact?.socialProfiles || { linkedin: '', twitter: '' },
    customFields: contact?.customFields || {
      preferredContactMethod: '',
      decisionTimeframe: '',
      budgetRange: ''
    }
  });
  
  const [tagInput, setTagInput] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button
            onClick={onCancel}
            className="text-text-secondary hover:text-text-primary"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {/* Form Sections Navigation */}
          <div className="flex border-b border-border mb-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('basic')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSection === 'basic' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('social')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSection === 'social' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Social Profiles
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('custom')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSection === 'custom' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Additional Information
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('notes')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSection === 'notes' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Notes
            </button>
          </div>
          
          {/* Basic Information */}
          {activeSection === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-1">
                  First Name*
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input-field ${errors.firstName ? 'border-error focus:border-error focus:ring-error' : ''}`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-error">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-1">
                  Last Name*
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input-field ${errors.lastName ? 'border-error focus:border-error focus:ring-error' : ''}`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-error">{errors.lastName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-error focus:border-error focus:ring-error' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-error focus:border-error focus:ring-error' : ''}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-text-secondary mb-1">
                  Company*
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`input-field ${errors.company ? 'border-error focus:border-error focus:ring-error' : ''}`}
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-error">{errors.company}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-text-secondary mb-1">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-border rounded-md bg-surface">
                  {formData.tags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 text-primary hover:text-primary-700"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </span>
                  ))}
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add a tag..."
                        className="w-full border-0 p-0 focus:ring-0 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="ml-2 text-primary hover:text-primary-700"
                      >
                        <Icon name="Plus" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">
                  Press Enter or click the + icon to add a tag
                </p>
              </div>
            </div>
          )}
          
          {/* Social Profiles */}
          {activeSection === 'social' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-text-secondary mb-1">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Linkedin" size={16} className="text-text-tertiary" />
                  </div>
                  <input
                    type="text"
                    id="linkedin"
                    name="socialProfiles.linkedin"
                    value={formData.socialProfiles.linkedin}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/username"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-text-secondary mb-1">
                  Twitter Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Twitter" size={16} className="text-text-tertiary" />
                  </div>
                  <input
                    type="text"
                    id="twitter"
                    name="socialProfiles.twitter"
                    value={formData.socialProfiles.twitter}
                    onChange={handleChange}
                    placeholder="twitter.com/username"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-text-secondary mb-1">
                  Facebook Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Facebook" size={16} className="text-text-tertiary" />
                  </div>
                  <input
                    type="text"
                    id="facebook"
                    name="socialProfiles.facebook"
                    value={formData.socialProfiles.facebook || ''}
                    onChange={handleChange}
                    placeholder="facebook.com/username"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Custom Fields */}
          {activeSection === 'custom' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-text-secondary mb-1">
                  Preferred Contact Method
                </label>
                <select
                  id="preferredContactMethod"
                  name="customFields.preferredContactMethod"
                  value={formData.customFields.preferredContactMethod}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a method</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="video call">Video Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="decisionTimeframe" className="block text-sm font-medium text-text-secondary mb-1">
                  Decision Timeframe
                </label>
                <select
                  id="decisionTimeframe"
                  name="customFields.decisionTimeframe"
                  value={formData.customFields.decisionTimeframe}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a timeframe</option>
                  <option value="Immediate">Immediate</option>
                  <option value="This Month">This Month</option>
                  <option value="Q3 2023">Q3 2023</option>
                  <option value="Q4 2023">Q4 2023</option>
                  <option value="Q1 2024">Q1 2024</option>
                  <option value="Q2 2024">Q2 2024</option>
                  <option value="On hold">On Hold</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-text-secondary mb-1">
                  Budget Range
                </label>
                <select
                  id="budgetRange"
                  name="customFields.budgetRange"
                  value={formData.customFields.budgetRange}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a budget range</option>
                  <option value="Under $25K">Under $25K</option>
                  <option value="$25K-$50K">$25K-$50K</option>
                  <option value="$50K-$100K">$50K-$100K</option>
                  <option value="$100K-$250K">$100K-$250K</option>
                  <option value="$250K-$500K">$250K-$500K</option>
                  <option value="$500K+">$500K+</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {activeSection === 'notes' && (
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={6}
                className="input-field"
                placeholder="Add notes about this contact..."
              ></textarea>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {isEditing ? 'Update Contact' : 'Add Contact'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;