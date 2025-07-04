import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ContactList = ({ 
  contacts, 
  selectedContact, 
  selectedContacts, 
  onContactSelect, 
  onContactMultiSelect,
  onDeleteContact 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A'; // Or 'Never contacted', or an empty string
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date'; // Handle cases where dateString is not a valid date format
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (contacts.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-secondary">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
      {contacts.map(contact => (
        <div 
          key={contact.id}
          className={`border-b border-border last:border-b-0 p-4 cursor-pointer transition-colors duration-150 ease-out ${
            selectedContact && selectedContact.id === contact.id 
              ? 'bg-primary-50' :'hover:bg-surface-hover'
          }`}
          onClick={() => onContactSelect(contact)}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  onContactMultiSelect(contact.id);
                }}
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
              />
            </div>
            
            <div className="flex-shrink-0 mr-3">
              <div className="relative">
                <Image
                  src={contact.avatar || 'https://via.placeholder.com/150'}
                  alt={`${contact.firstName} ${contact.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
                  contact.status === 'active' ? 'bg-success' : 'bg-text-tertiary'
                }`}></span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-text-primary truncate">
                  {contact.firstName} {contact.lastName}
                </h3>
                <div className="flex items-center ml-2">
                  {contact.deals.some(deal => deal.stage === 'negotiation' || deal.stage === 'proposal') && (
                    <span className="w-2 h-2 bg-warning rounded-full mr-1" title="Has active deals"></span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteContact(contact.id);
                    }}
                    className="text-text-tertiary hover:text-error transition-colors duration-150 ease-out"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-secondary truncate">{contact.company}</p>
              <div className="flex items-center mt-1">
                <Icon name="Clock" size={12} className="text-text-tertiary mr-1" />
                <span className="text-xs text-text-tertiary">
                  {formatDate(contact.lastContactDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;