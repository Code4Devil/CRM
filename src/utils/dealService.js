import { supabase } from './supabase';

class DealService {
  // Get a single deal by ID
  async getDealById(dealId) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contacts(first_name, last_name, company, email, avatar_url),
          activities(*)
        `)
        .eq('id', dealId)
        .single();

      if (error) {
        console.error('DealService.getDealById error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('DealService.getDealById success, data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('DealService.getDealById exception:', error);
      return { success: false, error: 'Failed to load deal.' };
    }
  }

  // Get all deals for the current user
  async getDeals(filters = {}) {
    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          contacts(first_name, last_name, company, email),
          activities(*)
        `)
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters?.stage) {
        query = query.eq('stage', filters.stage);
      }
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('DealService.getDeals error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('DealService.getDeals success, data:', data);
      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted.' 
        };
      }
      console.error('DealService.getDeals exception:', error);
      if (error?.message?.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted.' 
        };
      }
      return { success: false, error: 'Failed to load deals.' };
    }
  }

  // Get deals grouped by stage for pipeline view
  async getPipelineDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contacts(first_name, last_name, company, email, avatar_url)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('DealService.getPipelineDeals error:', error.message);
        return { success: false, error: error.message };
      }

      // Group deals by stage
      const pipelineData = {
        lead: { id: 'lead', title: 'Lead', deals: [] },
        qualified: { id: 'qualified', title: 'Qualified', deals: [] },
        proposal: { id: 'proposal', title: 'Proposal', deals: [] },
        negotiation: { id: 'negotiation', title: 'Negotiation', deals: [] },
        closed_won: { id: 'closed_won', title: 'Closed Won', deals: [] },
        closed_lost: { id: 'closed_lost', title: 'Closed Lost', deals: [] }
      };

      (data || []).forEach(deal => {
        if (pipelineData[deal.stage]) {
          // Transform deal data to match expected format
          const transformedDeal = {
            id: deal.id,
            title: deal.title,
            value: parseFloat(deal.value),
            probability: deal.probability,
            contact: deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : 'No contact',
            company: deal.contacts?.company || 'Unknown company',
            avatar: deal.contacts?.avatar_url || `https://randomuser.me/api/portraits/men/32.jpg`,
            daysInStage: deal.days_in_stage || 0,
            lastActivity: this.getRelativeTime(deal.updated_at)
          };
          
          pipelineData[deal.stage].deals.push(transformedDeal);
        }
      });

      return { success: true, data: pipelineData };
    } catch (error) {
      console.error('DealService.getPipelineDeals exception:', error);
      return { success: false, error: 'Failed to load pipeline data.' };
    }
  }

  // Create a new deal
  async createDeal(dealData) {
    const { title, expectedCloseDate, user_id, contact_id, ...rest } = dealData;
    const dataToInsert = {
      ...rest,
      title: title,
      expected_close_date: expectedCloseDate,
      user_id: user_id || null, // Ensure user_id is null if empty or invalid
      contact_id: contact_id || null // Ensure contact_id is null if empty or invalid
    };
    
    try {
  
    const { data, error } = await supabase
      .from('deals')
      .insert([dealData])
        .select()
        .single();

      if (error) {
        console.error('DealService.createDeal error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('DealService.createDeal success, data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('DealService.createDeal exception:', error);
      return { success: false, error: 'Failed to create deal.' };
    }
  }

  // Update an existing deal
  async updateDeal(dealId, updates) {
    const { title, expectedCloseDate, user_id, contact_id, ...rest } = updates;
    const dataToUpdate = {
      ...rest,
      title: title,
      expected_close_date: expectedCloseDate,
      user_id: user_id || null, // Ensure user_id is null if empty or invalid
      contact_id: contact_id || null // Ensure contact_id is null if empty or invalid
    };
    if (expectedCloseDate === undefined) {
      delete dataToUpdate.expected_close_date;
    }
    if (title === undefined) {
      delete dataToUpdate.title;
    }
    
    if (expectedCloseDate === undefined) {
      delete dataToUpdate.expected_close_date;
    }
    try {
      const { data, error } = await supabase
        .from('deals')
        .update(dataToUpdate)
        .eq('id', dealId)
        .select()
        .single();

      if (error) {
        console.error('DealService.updateDeal error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('DealService.updateDeal success, data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('DealService.updateDeal exception:', error);
      return { success: false, error: 'Failed to update deal.' };
    }
  }

  // Update deal stage (for drag and drop)
  async updateDealStage(dealId, newStage) {
    try {
      // Map stage to probability
      const stageProbs = {
        lead: 20,
        qualified: 40,
        proposal: 70,
        negotiation: 85,
        closed_won: 100,
        closed_lost: 0
      };

      const updates = {
        stage: newStage,
        probability: stageProbs[newStage] || 0,
        days_in_stage: 0
      };

      if (newStage === 'closed_won' || newStage === 'closed_lost') {
        updates.actual_close_date = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', dealId)
        .select()
        .single();

      if (error) {
        console.error('DealService.updateDealStage error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('DealService.updateDealStage success, data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('DealService.updateDealStage exception:', error);
      return { success: false, error: 'Failed to update deal stage.' };
    }
  }

  // Delete a deal
  async deleteDeal(dealId) {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) {
        console.error('DealService.deleteDeal error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('DealService.deleteDeal success');
      return { success: true };
    } catch (error) {
      console.error('DealService.deleteDeal exception:', error);
      return { success: false, error: 'Failed to delete deal.' };
    }
  }

    async getDealStats() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('value, stage, probability, expected_close_date');

      if (error) {
        console.error('DealService.getDealStats error:', error.message);
        return { success: false, error: error.message };
      }

      const stats = {
        totalPipelineValue: 0,
        weightedPipelineValue: 0,
        activeDealCount: 0,
        closedWonCount: 0,
        closedLostCount: 0,
        avgDealSize: 0
      };

      (data || []).forEach(deal => {
        const value = parseFloat(deal.value) || 0;
        
        if (deal.stage !== 'closed_won' && deal.stage !== 'closed_lost') {
          stats.totalPipelineValue += value;
          stats.weightedPipelineValue += (value * (deal.probability || 0) / 100);
          stats.activeDealCount++;
        } else if (deal.stage === 'closed_won') {
          stats.closedWonCount++;
        } else if (deal.stage === 'closed_lost') {
          stats.closedLostCount++;
        }
      });

      if (data?.length > 0) {
        stats.avgDealSize = data.reduce((sum, deal) => sum + parseFloat(deal.value || 0), 0) / data.length;
      }
      return { success: true, data: stats };
    } catch (error) {
      console.error('DealService.getDealStats exception:', error);
      return { success: false, error: 'Failed to load deal statistics.' };
    }
  }

  // Helper function to get relative time
  getRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }
}

const dealService = new DealService();
export default dealService;