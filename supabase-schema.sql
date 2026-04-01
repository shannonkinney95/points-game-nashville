-- Points Game Nashville — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database.

-- Players table
create table players (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_emoji text default '🤠',
  created_at timestamptz default now()
);

-- Actions with configurable point values
create table actions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  points integer not null,
  emoji text default '⭐',
  category text default 'General',
  created_at timestamptz default now()
);

-- Submissions: a player did an action
create table submissions (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references players(id) on delete cascade not null,
  action_id uuid references actions(id) on delete cascade not null,
  note text,
  created_at timestamptz default now()
);

-- Enable realtime for all tables
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table actions;
alter publication supabase_realtime add table submissions;

-- Enable RLS but allow all operations (public game, no auth needed)
alter table players enable row level security;
alter table actions enable row level security;
alter table submissions enable row level security;

create policy "Allow all on players" on players for all using (true) with check (true);
create policy "Allow all on actions" on actions for all using (true) with check (true);
create policy "Allow all on submissions" on submissions for all using (true) with check (true);

-- Seed sample actions
insert into actions (name, points, emoji, category) values
  ('Take a shot', 10, '🥃', 'Drinks'),
  ('Buy someone a drink', 15, '🍹', 'Drinks'),
  ('Finish your drink first', 10, '🏆', 'Drinks'),
  ('Get a stranger to buy you a drink', 25, '💅', 'Drinks'),
  ('Request a song at a bar', 10, '🎵', 'Going Out'),
  ('Get on stage', 50, '🎤', 'Going Out'),
  ('Dance on a table/bar', 30, '💃', 'Going Out'),
  ('Get a free item from a stranger', 20, '🎁', 'Going Out'),
  ('Take a photo with a stranger', 10, '📸', 'Going Out'),
  ('Convince someone you are famous', 30, '⭐', 'Going Out'),
  ('Wear cowboy boots all day', 15, '🤠', 'Style'),
  ('Best dressed of the night (voted)', 25, '👗', 'Style'),
  ('Matching outfits with someone', 10, '👯', 'Style'),
  ('First one ready to go out', 10, '⏰', 'House'),
  ('Make breakfast for the group', 20, '🥞', 'House'),
  ('Start a group activity', 15, '🎲', 'House'),
  ('Jump in the pool fully clothed', 30, '🏊', 'House'),
  ('Last one standing at night', 20, '🌙', 'Going Out'),
  ('Learn a line dance', 15, '🕺', 'Going Out'),
  ('Get a phone number', 20, '📱', 'Going Out');
