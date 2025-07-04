import { supabase } from './supabase';

class ActivityService {
  // Get all activities for the current user
  async getActivityTimeline(limit = 50, filters = {}) {
    limit = Math.max(1, limit);
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          contacts(first_name, last_name, company, email, avatar_url),
          deals(title, value, stage),
          user_profiles(full_name, avatar_url)
        `)
        .order('activity_date', { ascending: false })
        .limit(limit);

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.contactId) query = query.eq('contact_id', filters.contactId);
      if (filters?.dealId) query = query.eq('deal_id', filters.dealId);
      if (filters?.dateFrom) query = query.gte('activity_date', filters.dateFrom);
      if (filters?.dateTo) query = query.lte('activity_date', filters.dateTo);

      const { data, error } = await query;
      if (error) return { success: false, error: error.message };

      return { success: true, data: data || [] };
    } catch {
      return { success: false, error: 'Failed to load activities.' };
    }
  }

  // Get recent activities for dashboard
  async getRecentActivities(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          contacts(first_name, last_name, company, avatar_url),
          deals(title, value, stage),
          user_profiles(full_name, avatar_url)
        `)
        .order('activity_date', { ascending: false })
        .limit(limit);

      if (error) return { success: false, error: error.message };

      const transformedActivities = (data || []).map(activity => ({
        id: activity.id,
        type: activity.type,
        subject: activity.subject || this.getDefaultSubject(activity.type),
        content: activity.content,
        date: activity.activity_date,
        duration: activity.duration_minutes,
        contact: activity.contacts ? {
          name: `${activity.contacts.first_name} ${activity.contacts.last_name}`,
          company: activity.contacts.company,
          avatar: activity.contacts.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg'
        } : null,
        deal: activity.deals ? {
          title: activity.deals.title,
          value: activity.deals.value,
          stage: activity.deals.stage
        } : null,
        user: activity.user_profiles ? {
          name: activity.user_profiles.full_name,
          avatar: activity.user_profiles.avatar_url
        } : null,
        relativeTime: this.getRelativeTime(activity.activity_date),
        icon: this.getActivityIcon(activity.type),
        color: this.getActivityColor(activity.type)
      }));

      return { success: true, data: transformedActivities };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted.'
        };
      }
      return { success: false, error: 'Failed to load recent activities.' };
    }
  }

  // Create a new activity
  async createActivity(activityData) {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error('User not authenticated.');
      }

      const dataToInsert = {
        user_id: authUser.id,
        type: activityData.type,
        subject: activityData.title,
        content: activityData.description,
        activity_date: activityData.timestamp,
        contact_id: activityData.contactId || null,
        deal_id: activityData.dealId || null,
        ...activityData.rest
      };

      const { data, error } = await supabase
        .from('activities')
        .insert([dataToInsert])
        .select(`
          *,
          contacts(first_name, last_name, company),
          deals(title, value)
        `)
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to create activity.' };
    }
  }

  // Update an activity
  async updateActivity(activityId, updates) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', activityId)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to update activity.' };
    }
  }

  // Delete an activity
  async deleteActivity(activityId) {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to delete activity.' };
    }
  }

  // Get activity statistics
  async getActivityStats(period = 'thisMonth') {
    try {
      let query = supabase
        .from('activities')
        .select('type, activity_date, duration_minutes');

      const now = new Date();
      let startDate;
      switch (period) {
        case 'thisWeek':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'thisQuarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
      }

      query = query.gte('activity_date', startDate.toISOString());
      const { data, error } = await query;

      if (error) return { success: false, error: error.message };

      const stats = {
        totalActivities: data?.length || 0,
        emailsSent: 0,
        callsMade: 0,
        meetingsHeld: 0,
        totalDuration: 0,
        avgDuration: 0,
        activitiesByType: {
          email: 0, call: 0, meeting: 0, note: 0, task: 0, demo: 0
        }
      };

      (data || []).forEach(a => {
        if (a.type === 'email') stats.emailsSent++;
        if (a.type === 'call') stats.callsMade++;
        if (a.type === 'meeting') stats.meetingsHeld++;
        if (stats.activitiesByType[a.type] !== undefined) {
          stats.activitiesByType[a.type]++;
        }
        if (a.duration_minutes) stats.totalDuration += a.duration_minutes;
      });

      const activitiesWithDuration = (data || []).filter(a => a.duration_minutes);
      if (activitiesWithDuration.length > 0) {
        stats.avgDuration = Math.round(stats.totalDuration / activitiesWithDuration.length);
      }

      return { success: true, data: stats };
    } catch {
      return { success: false, error: 'Failed to load activity statistics.' };
    }
  }

  // Helpers
  getDefaultSubject(type) {
    const subjects = {
      email: 'Email sent', call: 'Phone call', meeting: 'Meeting held',
      note: 'Note added', task: 'Task created', demo: 'Demo conducted'
    };
    return subjects[type] || 'Activity recorded';
  }

  getActivityIcon(type) {
    const icons = {
      email: 'Mail', call: 'Phone', meeting: 'Calendar',
      note: 'FileText', task: 'CheckSquare', demo: 'Monitor'
    };
    return icons[type] || 'Activity';
  }

  getActivityColor(type) {
    const colors = {
      email: 'bg-blue-100 text-blue-600',
      call: 'bg-green-100 text-green-600',
      meeting: 'bg-purple-100 text-purple-600',
      note: 'bg-gray-100 text-gray-600',
      task: 'bg-orange-100 text-orange-600',
      demo: 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  }

  getRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
}

const activityService = new ActivityService();
export default activityService;
