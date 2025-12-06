-- Migration: Add unique constraint on email
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Add unique constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

