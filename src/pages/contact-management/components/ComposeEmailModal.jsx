import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ComposeEmailModal = ({ contact, onClose, onSend }) => {
  const [emailData, setEmailData] = useState({
    to: contact.email,
    subject: '',
    body: '',
    cc: '',
    bcc: ''
  });
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData({
      ...emailData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate sending email
    setTimeout(() => {
      onSend({
        ...emailData,
        timestamp: new Date().toISOString(),
        contactId: contact.id
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-1100 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text-primary">Compose Email</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    To
                  </label>
                  <div className="flex items-center">
                    <input
                      type="email"
                      name="to"
                      value={emailData.to}
                      onChange={handleChange}
                      className="input-field"
                      readOnly
                    />
                  </div>
                </div>
                
                {showCcBcc && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Cc
                      </label>
                      <input
                        type="text"
                        name="cc"
                        value={emailData.cc}
                        onChange={handleChange}
                        placeholder="email@example.com, another@example.com"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Bcc
                      </label>
                      <input
                        type="text"
                        name="bcc"
                        value={emailData.bcc}
                        onChange={handleChange}
                        placeholder="email@example.com, another@example.com"
                        className="input-field"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={emailData.subject}
                    onChange={handleChange}
                    placeholder="Enter email subject"
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Message
                  </label>
                  <textarea
                    name="body"
                    value={emailData.body}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Write your message here..."
                    className="input-field"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  {showCcBcc ? 'Hide' : 'Show'} Cc/Bcc
                </button>
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="Paperclip" size={16} />
                </button>
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="Image" size={16} />
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !emailData.subject || !emailData.body}
                  className={`btn-primary inline-flex items-center ${
                    isSending || !emailData.subject || !emailData.body
                      ? 'opacity-50 cursor-not-allowed' :''
                  }`}
                >
                  {isSending ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} className="mr-2" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailModal;