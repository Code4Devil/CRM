// src/pages/settings-administration/components/UserManagement.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Sales Manager',
      status: 'Active',
      lastLogin: '2024-01-15 14:30',
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Sales Rep',
      status: 'Active',
      lastLogin: '2024-01-15 09:15',
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      role: 'Admin',
      status: 'Inactive',
      lastLogin: '2024-01-10 16:45',
      avatar: null
    }
  ]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: '', message: '' });

  const roles = ['Admin', 'Sales Manager', 'Sales Rep', 'Sales Operations'];

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev?.includes(userId)
        ? prev?.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers?.length === users?.length ? [] : users?.map(user => user?.id)
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const handleInviteUser = (e) => {
    e.preventDefault();
    console.log('Inviting user:', inviteForm);
    setShowInviteModal(false);
    setInviteForm({ email: '', role: '', message: '' });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: 'bg-success-50 text-success-600 border-success-100',
      Inactive: 'bg-error-50 text-error-600 border-error-100',
      Pending: 'bg-warning-50 text-warning-600 border-warning-100'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
          <p className="text-text-secondary mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          <Icon name="UserPlus" size={16} />
          <span>Invite User</span>
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers?.length > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary font-medium">
              {selectedUsers?.length} user{selectedUsers?.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success-600 transition-colors duration-150"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-xs bg-error text-white rounded hover:bg-error-600 transition-colors duration-150"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-xs bg-text-secondary text-white rounded hover:bg-text-primary transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers?.length === users?.length && users?.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Last Login</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user?.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers?.includes(user?.id)}
                      onChange={() => handleSelectUser(user?.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{user?.name}</div>
                        <div className="text-sm text-text-secondary">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{user?.role}</td>
                  <td className="py-3 px-4">{getStatusBadge(user?.status)}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{user?.lastLogin}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-text-secondary hover:text-primary transition-colors duration-150">
                        <Icon name="Edit3" size={16} />
                      </button>
                      <button className="p-1 text-text-secondary hover:text-error transition-colors duration-150">
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowInviteModal(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-md w-full relative z-1300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Invite New User</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                    <input
                      type="email"
                      value={inviteForm?.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="user@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                    <select
                      value={inviteForm?.role}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles?.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Welcome Message (Optional)</label>
                    <textarea
                      value={inviteForm?.message}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      rows={3}
                      placeholder="Welcome to our team..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;