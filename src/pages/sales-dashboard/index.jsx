import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import dealService from '../../utils/dealService';
import activityService from '../../utils/activityService';
import analyticsService from '../../utils/analyticsService';
import taskService from '../../utils/taskService';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';

import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import UpcomingTasks from './components/UpcomingTasks';
import PipelineStage from './components/PipelineStage';
import PerformanceMetrics from './components/PerformanceMetrics';

const SalesDashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [selectedProbability, setSelectedProbability] = useState('all');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pipelineData, setPipelineData] = useState({});
  const [dealStats, setDealStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([
    { month: 'Jan', forecast: 450000, actual: 420000 },
    { month: 'Feb', forecast: 520000, actual: 485000 },
    { month: 'Mar', forecast: 580000, actual: 562000 },
    { month: 'Apr', forecast: 620000, actual: 598000 },
    { month: 'May', forecast: 680000, actual: 645000 },
    { month: 'Jun', forecast: 750000, actual: 0 }
  ]);
  const [performanceData, setPerformanceData] = useState({
    quota: userProfile?.quota_amount || 2500000,
    achieved: 1850000,
    percentage: 74,
    dealsWon: 23,
    dealsLost: 8,
    avgDealSize: 85000,
    conversionRate: 28.5
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || authLoading) return;

      try {
        setLoading(true);
        setError(null);

        // Load all dashboard data in parallel
        const [
          pipelineResult,
          statsResult,
          activitiesResult,
          revenueResult,
          performanceResult,
          tasksResult
        ] = await Promise.all([
          dealService.getPipelineDeals(),
          dealService.getDealStats(),
          activityService.getRecentActivities(10),
          analyticsService.getRevenueData(selectedDateRange),
          analyticsService.getPerformanceMetrics(),

          taskService.getUpcomingTasks(user?.id, 5)
        ]);

        // Handle pipeline data
        if (pipelineResult?.success) {
          setPipelineData(pipelineResult.data);
        } else {
          setError(pipelineResult?.error || 'Failed to load pipeline data');
        }

        // Handle deal statistics
        if (statsResult?.success) {
          setDealStats(statsResult.data);
        }

        // Handle recent activities
        if (activitiesResult?.success) {
          setRecentActivities(activitiesResult.data);
        }

        // Handle revenue data
        if (revenueResult?.success) {
          setRevenueData(revenueResult.data);
        }

        // Handle performance data
        if (performanceResult?.success) {
          setPerformanceData(performanceResult.data);
        }

        // Handle upcoming tasks
        if (tasksResult?.success) {
          setUpcomingTasks(tasksResult.data);
        }

      } catch (error) {
        setError('Failed to load dashboard data');
        console.log('Dashboard loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading, selectedDateRange]);

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Handle drag and drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    try {
      // Update deal stage in database
      const updateResult = await dealService.updateDealStage(draggableId, destination.droppableId);
      
      if (!updateResult?.success) {
        setError(updateResult?.error || 'Failed to update deal stage');
        return;
      }

      // Update local state optimistically
      const sourceStage = pipelineData[source.droppableId];
      const destStage = pipelineData[destination.droppableId];
      const draggedDeal = sourceStage?.deals?.find(deal => deal.id === draggableId);

      if (!draggedDeal) return;

      // Update probability based on stage
      const stageProbs = {
        'lead': 20,
        'qualified': 40,
        'proposal': 70,
        'negotiation': 85,
        'closed_won': 100,
        'closed_lost': 0
      };

      const updatedDeal = {
        ...draggedDeal,
        probability: stageProbs[destination.droppableId] || draggedDeal.probability,
        daysInStage: 0
      };

      // Remove from source
      const newSourceDeals = sourceStage.deals.filter(deal => deal.id !== draggableId);
      
      // Add to destination
      const newDestDeals = [...destStage.deals];
      newDestDeals.splice(destination.index, 0, updatedDeal);

      setPipelineData({
        ...pipelineData,
        [source.droppableId]: {
          ...sourceStage,
          deals: newSourceDeals
        },
        [destination.droppableId]: {
          ...destStage,
          deals: newDestDeals
        }
      });

      // Refresh deal stats
      const statsResult = await dealService.getDealStats();
      if (statsResult?.success) {
        setDealStats(statsResult.data);
      }

    } catch (error) {
      setError('Failed to update deal stage');
      console.log('Drag and drop error:', error);
    }
  };

  // Calculate pipeline totals
  const calculateStageTotal = (stage) => {
    return stage?.deals?.reduce((total, deal) => total + (deal.value || 0), 0) || 0;
  };

  const calculateWeightedTotal = (stage) => {
    return stage?.deals?.reduce((total, deal) => total + ((deal.value || 0) * (deal.probability || 0) / 100), 0) || 0;
  };

  const totalPipelineValue = Object.values(pipelineData).reduce((total, stage) => 
    total + calculateStageTotal(stage), 0
  );

  const weightedPipelineValue = Object.values(pipelineData).reduce((total, stage) => 
    total + calculateWeightedTotal(stage), 0
  );

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">Failed to Load Dashboard</h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Welcome back, {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-text-secondary">
                Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 5 minutes
              </p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="input-field text-sm"
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
              </select>
              
              <select
                value={selectedProbability}
                onChange={(e) => setSelectedProbability(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Probabilities</option>
                <option value="high">High (&gt;70%)</option>
                <option value="medium">Medium (30-70%)</option>
                <option value="low">Low (&lt;30%)</option>
              </select>
              
              <select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Territories</option>
                <option value="north">North America</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia Pacific</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-normal">Total Pipeline</p>
                  <p className="text-2xl font-normal text-text-primary">
                    ${(totalPipelineValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-normal">Weighted Pipeline</p>
                  <p className="text-2xl font-normal text-text-primary">
                    ${(weightedPipelineValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                  <Icon name="Target" size={24} className="text-success" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-normal">Active Deals</p>
                  <p className="text-2xl font-normal text-text-primary">
                    {dealStats?.activeDealCount || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center">
                  <Icon name="Briefcase" size={24} className="text-secondary" />
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-normal">Quota Achievement</p>
                  <p className="text-2xl font-normal text-text-primary">{performanceData.percentage}%</p>
                </div>
                <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center">
                  <Icon name="Award" size={24} className="text-accent" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Pipeline Section */}
            <div className="xl:col-span-3 space-y-8">
              {/* Interactive Pipeline */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-normal text-text-primary">Sales Pipeline</h2>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="RefreshCw" size={16} />
                    <span>Drag deals to update stages</span>
                  </div>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.values(pipelineData).map((stage) => (
                      <PipelineStage
                        key={stage.id}
                        stage={stage}
                        totalValue={calculateStageTotal(stage)}
                        weightedValue={calculateWeightedTotal(stage)}
                      />
                    ))}
                  </div>
                </DragDropContext>
              </div>

              {/* Revenue Forecast Chart */}
              <div className="card p-6">
                <h2 className="text-xl font-normal text-text-primary mb-6">Monthly Revenue Forecast</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" tickFormatter={(value) => `${value / 1000}K`} />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()}`, '']}
                        labelStyle={{ color: '#1F2937' }}
                      />
                      <Bar dataKey="forecast" fill="var(--color-primary)" name="Forecast" />
                      <Bar dataKey="actual" fill="var(--color-success)" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Metrics */}
              <PerformanceMetrics data={performanceData} />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              
              {/* Upcoming Tasks */}
              <UpcomingTasks tasks={upcomingTasks} />
              
              {/* Recent Activity */}
              <RecentActivity activities={recentActivities} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;