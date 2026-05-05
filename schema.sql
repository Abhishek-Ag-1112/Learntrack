-- ============================================
-- LearnTrack – Supabase Database Schema
-- ============================================
-- Run this in the Supabase SQL Editor to set up
-- the database tables, RLS policies, and triggers.
-- ============================================

-- Clean up any previous version
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- 1. Create the users table
-- ============================================
CREATE TABLE public.users (
  uid UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  "photoURL" TEXT,
  streak INTEGER DEFAULT 0,
  "longestStreak" INTEGER DEFAULT 0,
  "lastActiveDate" TEXT,
  progress JSONB DEFAULT '{}'::jsonb,
  todos JSONB DEFAULT '[]'::jsonb,
  activity JSONB DEFAULT '[]'::jsonb
);

-- ============================================
-- 2. Enable Row Level Security
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS Policies – users can only touch their own row
-- ============================================
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING ( auth.uid() = uid );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING ( auth.uid() = uid );

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK ( auth.uid() = uid );

CREATE POLICY "Users can delete their own profile" ON public.users
  FOR DELETE USING ( auth.uid() = uid );

-- ============================================
-- 4. Auto-create user row on signup (trigger)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uid, email, name, "photoURL")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
