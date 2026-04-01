-- Run this if you already created the tables from supabase-schema.sql
-- Adds the photo_url column to the players table.
alter table players add column if not exists photo_url text;
