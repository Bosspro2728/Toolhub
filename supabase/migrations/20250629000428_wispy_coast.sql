/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`: Stores additional user profile information
      - Includes `user_id` (references `auth.users`)
      - Stores display name, full name, bio, etc.
      - Implements soft delete

  2. Security
    - Enables Row Level Security (RLS) on all tables
    - Implements policies for authenticated users to view and edit their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null unique,
  display_name text,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile data
CREATE POLICY "Users can view their own profile data"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Create policy for users to update their own profile data
CREATE POLICY "Users can update their own profile data"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Create policy for users to insert their own profile data
CREATE POLICY "Users can insert their own profile data"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());