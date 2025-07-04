import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
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

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
          <Route path="/deal-management" element={<DealManagement />} />
          <Route path="/deal-management/:id" element={<DealManagement />} />
          <Route path="/contact-management" element={<ContactManagement />} />
          <Route path="/pipeline-analytics" element={<PipelineAnalytics />} />
          <Route path="/activity-timeline" element={<ActivityTimeline />} />
          <Route path="/settings-administration" element={<SettingsAdministration />} />
          <Route path="/" element={<Login />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;