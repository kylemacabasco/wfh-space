-- Migration: Add unique constraint on email
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- NOTE: Delete duplicate emails first before running this!

-- Add unique constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

