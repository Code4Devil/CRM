import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';

const DocumentsSection = ({ documents, dealId }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return { icon: 'FileText', color: 'text-red-600' };
      case 'doc': case'docx':
        return { icon: 'FileText', color: 'text-blue-600' };
      case 'xls': case'xlsx':
        return { icon: 'FileSpreadsheet', color: 'text-green-600' };
      case 'ppt': case'pptx':
        return { icon: 'Presentation', color: 'text-orange-600' };
      case 'jpg': case'jpeg': case'png': case'gif':
        return { icon: 'Image', color: 'text-purple-600' };
      default:
        return { icon: 'File', color: 'text-gray-600' };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUploadDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files) => {
    files.forEach(file => {
      const fileId = Date.now() + Math.random();
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0;
          const newProgress = currentProgress + Math.random() * 30;
          
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(prev => {
                const updated = { ...prev };
                delete updated[fileId];
                return updated;
              });
            }, 1000);
            
            console.log('File uploaded:', {
              id: fileId,
              name: file.name,
              size: formatFileSize(file.size),
              type: file.name.split('.').pop(),
              dealId: dealId,
              uploadedAt: new Date().toISOString(),
              uploadedBy: "You"
            });
            
            return { ...prev, [fileId]: 100 };
          }
          
          return { ...prev, [fileId]: Math.min(newProgress, 100) };
        });
      }, 200);
    });
  };

  const handleDownload = (document) => {
    console.log('Downloading document:', document.name);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = document.name;
    link.click();
  };

  const handleDelete = (documentId) => {
    console.log('Deleting document:', documentId);
    // Simulate delete
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Documents</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-50 text-primary rounded-lg hover:bg-primary-100 transition-colors duration-150"
        >
          <Icon name="Upload" size={16} />
          <span>Upload</span>
        </button>
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-150 mb-6 ${
          isDragOver 
            ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
        }`}
      >
        <Icon name="Upload" size={32} className="text-text-tertiary mx-auto mb-2" />
        <p className="text-sm text-text-secondary mb-1">
          Drag and drop files here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-text-tertiary">
          Supports PDF, DOC, XLS, PPT, and image files up to 10MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
      />

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-3 mb-6">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-surface-hover rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Uploading...</span>
                <span className="text-sm text-text-secondary">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No documents uploaded</p>
            <p className="text-sm text-text-tertiary">Upload your first document to get started</p>
          </div>
        ) : (
          documents.map(document => {
            const fileInfo = getFileIcon(document.type);
            
            return (
              <div key={document.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-surface-hover transition-colors duration-150">
                <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${fileInfo.color}`}>
                  <Icon name={fileInfo.icon} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary truncate">{document.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <span>{document.size}</span>
                    <span>•</span>
                    <span>Uploaded by {document.uploadedBy}</span>
                    <span>•</span>
                    <span>{formatUploadDate(document.uploadedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                    title="Download"
                  >
                    <Icon name="Download" size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="p-2 text-text-secondary hover:text-error hover:bg-error-50 rounded-lg transition-colors duration-150"
                    title="Delete"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Stats */}
      {documents.length > 0 && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
            <span>
              Total size: {formatFileSize(
                documents.reduce((total, doc) => {
                  const sizeInBytes = parseFloat(doc.size) * (
                    doc.size.includes('MB') ? 1024 * 1024 :
                    doc.size.includes('KB') ? 1024 : 1
                  );
                  return total + sizeInBytes;
                }, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;