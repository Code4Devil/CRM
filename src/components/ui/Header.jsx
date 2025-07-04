import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

   const handleLogout = async () => {
    await signOut();
    handleNavigation();
    navigate('/login');
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/sales-dashboard', icon: 'BarChart3', tooltip: 'Pipeline overview and metrics' },
    { label: 'Deals', path: '/deal-management', icon: 'Target', tooltip: 'Manage deal lifecycle and opportunities' },
    { label: 'Contacts', path: '/contact-management', icon: 'Users', tooltip: 'Customer relationship management' },
    { label: 'Analytics', path: '/pipeline-analytics', icon: 'TrendingUp', tooltip: 'Performance insights and analysis' },
    { label: 'Activity', path: '/activity-timeline', icon: 'Clock', tooltip: 'Interaction timeline and history' }
  ];

  const userMenuItems = [
    
    { label: 'Logout', action: handleLogout, icon: 'LogOut' }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

 

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-1000">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center h-10  md:pl-10 overflow-hidden">
              <Link to="/sales-dashboard" className="flex items-center space-x-3" onClick={handleNavigation}>
                <img src="https://sdwgyjjcxdhdlcuvjadq.supabase.co/storage/v1/object/public/invoices//delta_zero_vertical_logo-removebg-preview.png"  className="h-28 w-auto -ml-8 " />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={`px-6 py-4 rounded-lg text-sm font-medium transition-all duration-150 ease-smooth flex items-center space-x-2 ${
                    isActiveRoute(item.path)
                      ? 'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                  title={item.tooltip}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
            

              {/* Logout Button for Desktop */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-smooth text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                title="Logout"
              >
                <Icon name="LogOut" size={16} />
                <span>Logout</span>
              </button>

         

              {/* Mobile Menu Button */}
              <button
                onClick={handleMobileMenuToggle}
                className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 ease-smooth"
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-1200 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleMobileMenuToggle}></div>
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-surface shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <img src="https://sdwgyjjcxdhdlcuvjadq.supabase.co/storage/v1/object/public/invoices//delta_zero_vertical_logo-removebg-preview.png" alt="SalesForce Pro Logo" className="h-20 w-auto" />
                </div>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 ease-smooth"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigation}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-150 ease-smooth ${
                      isActiveRoute(item.path)
                        ? 'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <div className="border-t border-border my-4"></div>
                
                {userMenuItems.map((item) => (
                  item.path ? (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavigation}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth"
                    >
                      <Icon name={item.icon} size={20} />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth w-full text-left"
                    >
                      <Icon name={item.icon} size={20} />
                      <span>{item.label}</span>
                    </button>
                  )
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-1000"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;