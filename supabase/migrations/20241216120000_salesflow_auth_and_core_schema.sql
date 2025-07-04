-- Location: supabase/migrations/20241216120000_salesflow_auth_and_core_schema.sql

-- 1. Extensions and Types
CREATE TYPE public.user_role AS ENUM ('admin', 'sales_director', 'sales_manager', 'sales_rep');
CREATE TYPE public.deal_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE public.contact_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE public.activity_type AS ENUM ('email', 'call', 'meeting', 'note', 'task', 'demo');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. User Profiles Table (Critical intermediary for auth relationships)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'sales_rep'::public.user_role,
    avatar_url TEXT,
    phone TEXT,
    territory TEXT,
    quota_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contacts Table
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    avatar_url TEXT,
    status public.contact_status DEFAULT 'active'::public.contact_status,
    last_contact_date TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    social_profiles JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Deals Table
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(12,2) NOT NULL DEFAULT 0,
    stage public.deal_stage DEFAULT 'lead'::public.deal_stage,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    days_in_stage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Activities Table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    type public.activity_type NOT NULL,
    subject TEXT,
    content TEXT,
    duration_minutes INTEGER,
    activity_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tasks Table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status public.task_status DEFAULT 'pending'::public.task_status,
    priority public.task_priority DEFAULT 'medium'::public.task_priority,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_company ON public.contacts(company);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_contact_id ON public.deals(contact_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_expected_close_date ON public.deals(expected_close_date);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX idx_activities_date ON public.activities(activity_date);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- 8. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 9. Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
)
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin'::public.user_role, 'sales_director'::public.user_role, 'sales_manager'::public.user_role)
)
$$;

CREATE OR REPLACE FUNCTION public.owns_contact(contact_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.contacts c
    WHERE c.id = contact_uuid AND c.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.owns_deal(deal_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id = deal_uuid AND d.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.can_access_activity(activity_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.id = activity_uuid AND a.user_id = auth.uid()
)
$$;

-- 10. RLS Policies
-- User Profiles: Users can view/edit their own profile, admins can view all
CREATE POLICY "users_view_own_profile" ON public.user_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_update_own_profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Contacts: Users can manage their own contacts, managers can view team contacts
CREATE POLICY "users_manage_own_contacts" ON public.contacts
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_manager_or_above())
WITH CHECK (user_id = auth.uid());

-- Deals: Users can manage their own deals, managers can view team deals
CREATE POLICY "users_manage_own_deals" ON public.deals
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_manager_or_above())
WITH CHECK (user_id = auth.uid());

-- Activities: Users can manage their own activities
CREATE POLICY "users_manage_own_activities" ON public.activities
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Tasks: Users can manage their own tasks
CREATE POLICY "users_manage_own_tasks" ON public.tasks
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Trigger Functions for automatic profile creation and timestamps
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'sales_rep')::public.user_role
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 12. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_contacts
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_deals
    BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. Mock Data for Development
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    manager_uuid UUID := gen_random_uuid();
    rep1_uuid UUID := gen_random_uuid();
    rep2_uuid UUID := gen_random_uuid();
    contact1_uuid UUID := gen_random_uuid();
    contact2_uuid UUID := gen_random_uuid();
    contact3_uuid UUID := gen_random_uuid();
    deal1_uuid UUID := gen_random_uuid();
    deal2_uuid UUID := gen_random_uuid();
    deal3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@salesflow.com', crypt('Admin2024!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "System Administrator", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (manager_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sales.manager@salesflow.com', crypt('Manager456!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sales Manager", "role": "sales_manager"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (rep1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sales.rep@salesflow.com', crypt('SalesRep123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sales Representative", "role": "sales_rep"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (rep2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sales.director@salesflow.com', crypt('Director789!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Sales Director", "role": "sales_director"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create contacts
    INSERT INTO public.contacts (id, user_id, first_name, last_name, email, phone, company, position, status, tags, social_profiles, custom_fields, last_contact_date)
    VALUES
        (contact1_uuid, rep1_uuid, 'Sarah', 'Johnson', 'sarah.johnson@acmecorp.com', '+1 (555) 123-4567', 'Acme Corporation', 'Chief Technology Officer', 'active'::public.contact_status, 
         ARRAY['enterprise', 'tech', 'decision-maker'], '{"linkedin": "linkedin.com/in/sarahjohnson", "twitter": "twitter.com/sarahjtech"}'::jsonb,
         '{"preferredContactMethod": "email", "decisionTimeframe": "Q3 2023", "budgetRange": "$100K-$250K"}'::jsonb, now() - interval '2 days'),
        (contact2_uuid, rep1_uuid, 'Michael', 'Chen', 'michael.chen@globex.com', '+1 (555) 987-6543', 'Globex Industries', 'Procurement Director', 'active'::public.contact_status,
         ARRAY['manufacturing', 'mid-market', 'procurement'], '{"linkedin": "linkedin.com/in/michaelchen"}'::jsonb,
         '{"preferredContactMethod": "phone", "decisionTimeframe": "Q4 2023", "budgetRange": "$50K-$100K"}'::jsonb, now() - interval '1 day'),
        (contact3_uuid, rep2_uuid, 'Emily', 'Rodriguez', 'emily.rodriguez@innovateco.com', '+1 (555) 234-5678', 'InnovateCo', 'VP of Marketing', 'active'::public.contact_status,
         ARRAY['marketing', 'enterprise', 'fast-growth'], '{"linkedin": "linkedin.com/in/emilyrodriguez"}'::jsonb,
         '{"preferredContactMethod": "video call", "decisionTimeframe": "Q3 2023", "budgetRange": "$75K-$150K"}'::jsonb, now() - interval '3 hours');

    -- Create deals
    INSERT INTO public.deals (id, user_id, contact_id, title, description, value, stage, probability, expected_close_date)
    VALUES
        (deal1_uuid, rep1_uuid, contact1_uuid, 'Acme Corp - Enterprise License', 'Enterprise software licensing and implementation', 125000, 'negotiation'::public.deal_stage, 85, now() + interval '30 days'),
        (deal2_uuid, rep1_uuid, contact2_uuid, 'Globex - Supply Chain Integration', 'Supply chain management system implementation', 78000, 'proposal'::public.deal_stage, 65, now() + interval '45 days'),
        (deal3_uuid, rep2_uuid, contact3_uuid, 'InnovateCo - Marketing Platform', 'Marketing automation platform deployment', 95000, 'qualified'::public.deal_stage, 40, now() + interval '60 days');

    -- Create activities
    INSERT INTO public.activities (user_id, contact_id, deal_id, type, subject, content, duration_minutes, activity_date)
    VALUES
        (rep1_uuid, contact1_uuid, deal1_uuid, 'email'::public.activity_type, 'Follow-up on proposal', 'Sent detailed pricing breakdown and implementation timeline.', null, now() - interval '2 hours'),
        (rep1_uuid, contact1_uuid, deal1_uuid, 'call'::public.activity_type, 'Technical requirements discussion', 'Discussed integration points and technical requirements.', 25, now() - interval '1 day'),
        (rep1_uuid, contact2_uuid, deal2_uuid, 'meeting'::public.activity_type, 'Demo presentation', 'Demonstrated supply chain management features to procurement team.', 45, now() - interval '3 days'),
        (rep2_uuid, contact3_uuid, deal3_uuid, 'call'::public.activity_type, 'Marketing automation requirements', 'Discussed marketing team structure and automation needs.', 30, now() - interval '5 hours');

    -- Create tasks
    INSERT INTO public.tasks (user_id, contact_id, deal_id, title, description, status, priority, due_date)
    VALUES
        (rep1_uuid, contact1_uuid, deal1_uuid, 'Prepare final contract', 'Create final contract documents for Acme Corp deal', 'pending'::public.task_status, 'high'::public.task_priority, now() + interval '3 days'),
        (rep1_uuid, contact2_uuid, deal2_uuid, 'Schedule technical demo', 'Arrange technical demonstration for Globex team', 'in_progress'::public.task_status, 'medium'::public.task_priority, now() + interval '1 week'),
        (rep2_uuid, contact3_uuid, deal3_uuid, 'Send case studies', 'Share relevant case studies from similar companies', 'pending'::public.task_status, 'medium'::public.task_priority, now() + interval '2 days');

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;

-- 14. Cleanup function for development
CREATE OR REPLACE FUNCTION public.cleanup_demo_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_user_ids UUID[];
BEGIN
    -- Get demo user IDs
    SELECT ARRAY_AGG(id) INTO demo_user_ids
    FROM auth.users
    WHERE email LIKE '%@salesflow.com';

    -- Delete in dependency order
    DELETE FROM public.tasks WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.activities WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.deals WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.contacts WHERE user_id = ANY(demo_user_ids);
    DELETE FROM public.user_profiles WHERE id = ANY(demo_user_ids);
    DELETE FROM auth.users WHERE id = ANY(demo_user_ids);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;
