import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'components/AppIcon';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading, authError, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/sales-dashboard');
    }
  }, [user, loading, navigate]);

  // Demo credentials for quick access
  const demoCredentials = [
    { email: 'sales.rep@salesflow.com', password: 'SalesRep123!', role: 'Sales Representative' },
    { email: 'sales.manager@salesflow.com', password: 'Manager456!', role: 'Sales Manager' },
    { email: 'sales.director@salesflow.com', password: 'Director789!', role: 'Sales Director' },
    { email: 'admin@salesflow.com', password: 'Admin2024!', role: 'System Administrator' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth errors
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (failedAttempts >= 3) {
      setErrors({ general: 'Too many failed attempts. Please try again later.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn(formData.email, formData.password);

      if (result?.success) {
        setFailedAttempts(0);
        navigate('/sales-dashboard');
      } else {
        setFailedAttempts(prev => prev + 1);
        setErrors({ 
          general: result?.error || `Login failed. ${3 - failedAttempts - 1} attempts remaining.`
        });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (credentials) => {
    setFormData({
      email: credentials.email,
      password: credentials.password,
      rememberMe: false
    });
    
    setIsLoading(true);
    const result = await signIn(credentials.email, credentials.password);
    
    if (result?.success) {
      navigate('/sales-dashboard');
    } else {
      setErrors({ general: result?.error || 'Demo login failed.' });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality would be implemented here. For demo, use the provided credentials.');
  };

  // Show loading if auth is still initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13L12 4L21 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V13H15V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">SalesFlow Pro</h1>
          <p className="text-text-secondary">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {(errors.general || authError) && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-center space-x-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0" />
                <span className="text-error text-sm">{errors.general || authError}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Mail" size={20} className="text-text-tertiary" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.email ? 'border-error focus:ring-error focus:border-error' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error flex items-center space-x-1">
                  <Icon name="AlertCircle" size={16} />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Lock" size={20} className="text-text-tertiary" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-error focus:ring-error focus:border-error' : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  <Icon 
                    name={showPassword ? "EyeOff" : "Eye"} 
                    size={20} 
                    className="text-text-tertiary hover:text-text-secondary transition-colors duration-150 ease-out" 
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error flex items-center space-x-1">
                  <Icon name="AlertCircle" size={16} />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary-700 transition-colors duration-150 ease-out"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || failedAttempts >= 3}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
            <h3 className="text-sm font-medium text-primary mb-3 flex items-center space-x-2">
              <Icon name="Info" size={16} />
              <span>Demo Credentials - Click to Login</span>
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(cred)}
                  disabled={isLoading}
                  className="w-full text-left text-xs bg-white border border-primary-200 rounded p-2 hover:bg-primary-25 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-primary">{cred.role}</div>
                  <div className="text-primary-600">{cred.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-tertiary">
            © {new Date().getFullYear()} SalesFlow Pro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-primary font-medium">Authenticating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;