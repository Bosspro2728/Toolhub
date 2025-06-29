/*
  # Usage Tracking Schema

  1. New Tables
    - `user_feature_usage`: Tracks daily usage of features per user
      - Includes `user_id` (references `auth.users`)
      - Tracks counts for each feature
      - Includes last reset timestamp

  2. Security
    - Enables Row Level Security (RLS) on all tables
    - Implements policies for authenticated users to view their own data
*/

CREATE TABLE IF NOT EXISTS user_feature_usage (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  ai_chat_daily_count integer default 0,
  text_humanizer_daily_count integer default 0,
  ai_detection_daily_count integer default 0,
  translation_daily_count integer default 0,
  text_to_speech_daily_count integer default 0,
  seo_analyzer_daily_count integer default 0,
  code_snippets_daily_count integer default 0,
  document_view_daily_count integer default 0,
  file_conversion_daily_count integer default 0,
  media_conversion_daily_count integer default 0,
  url_shortener_daily_count integer default 0,
  last_reset timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  CONSTRAINT unique_user_feature_usage UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE user_feature_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own usage data
CREATE POLICY "Users can view their own usage data"
  ON user_feature_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for users to update their own usage data
CREATE POLICY "Users can update their own usage data"
  ON user_feature_usage
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create a function to get a user's plan tier based on their subscription
CREATE OR REPLACE FUNCTION get_user_plan(user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  plan_tier text;
BEGIN
  SELECT 
    CASE 
      WHEN s.price_id = 'price_1RetsiKLsZT7M52urVbmm6EP' AND s.status = 'active' THEN 'master'
      WHEN s.price_id = 'price_1RetZ6KLsZT7M52uIyb7Ruc5' AND s.status = 'active' THEN 'pro'
      ELSE 'free'
    END INTO plan_tier
  FROM stripe_customers c
  LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
  WHERE c.user_id = user_id
  AND c.deleted_at IS NULL;
  
  RETURN COALESCE(plan_tier, 'free');
END;
$$;