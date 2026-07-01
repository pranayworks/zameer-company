-- SQL Migration script for Loyalty Points System

-- 1. Extend the profiles table to store loyalty details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS customer_segment TEXT DEFAULT 'Regular';

-- 2. Create the loyalty points history table
CREATE TABLE IF NOT EXISTS loyalty_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    amount_spent NUMERIC(12, 2) NOT NULL,
    points_earned INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) on loyalty_history
ALTER TABLE loyalty_history ENABLE ROW LEVEL SECURITY;

-- 4. Set up Policies for loyalty_history
DROP POLICY IF EXISTS "Users can view their own loyalty history" ON loyalty_history;
CREATE POLICY "Users can view their own loyalty history" 
ON loyalty_history FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own loyalty history" ON loyalty_history;
CREATE POLICY "Users can insert their own loyalty history" 
ON loyalty_history FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 5. Enable Realtime on profiles and loyalty_history tables
-- For Supabase db, we publish to the supabase_realtime publication
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table loyalty_history;
