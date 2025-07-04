import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import Login from "pages/login";
import SalesDashboard from "pages/sales-dashboard";
import DealManagement from "pages/deal-management";
import ContactManagement from "pages/contact-management";
import PipelineAnalytics from "pages/pipeline-analytics";
import ActivityTimeline from "pages/activity-timeline";
import SettingsAdministration from "pages/settings-administration";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; // Or a loading spinner
  }

  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
          <Route path="/sales-dashboard" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
          <Route path="/deal-management" element={<ProtectedRoute><DealManagement /></ProtectedRoute>} />
          <Route path="/deal-management/:id" element={<ProtectedRoute><DealManagement /></ProtectedRoute>} />
          <Route path="/contact-management" element={<ProtectedRoute><ContactManagement /></ProtectedRoute>} />
          <Route path="/pipeline-analytics" element={<ProtectedRoute><PipelineAnalytics /></ProtectedRoute>} />
          <Route path="/activity-timeline" element={<ProtectedRoute><ActivityTimeline /></ProtectedRoute>} />
          <Route path="/settings-administration" element={<ProtectedRoute><SettingsAdministration /></ProtectedRoute>} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;