-- 1. Enable RLS (Row Level Security) - Best Practice
-- For now, we will create policies that allow anyone to read/write 
-- (since we haven't implemented Auth yet, we just want shared data).

-- MEMBERS
create table members (
  id text primary key, -- Text ID like "M001" to match our existing data
  name text not null,
  role text default 'MEMBER', 
  active boolean default true,
  avatar_url text,
  created_at timestamptz default now()
);

alter table members enable row level security;
create policy "Public Access Members" on members for all using (true);

-- BOOKS
create table books (
  id text primary key, -- Changed to TEXT to match local "B123..." IDs
  title text not null,
  author text,
  pages int,
  cover_url text,
  genre text,
  created_at timestamptz default now()
);

alter table books enable row level security;
create policy "Public Access Books" on books for all using (true);

-- SESSIONS
create table sessions (
  id text primary key, -- Keeping text ID like "S001" for migration ease? Or UUID? Let's stick to UUID for new, but if we migrate, maybe text. Let's use text to be safe with "S001".
  book_id text references books(id),
  start_date date,
  end_date date,
  active boolean default false,
  created_at timestamptz default now()
);

alter table sessions enable row level security;
create policy "Public Access Sessions" on sessions for all using (true);

-- LOGS
create table logs (
  id text primary key, -- Keeping standard ID
  member_id text references members(id), -- Referencing the text ID
  session_id text references sessions(id),
  date date not null,
  pages_read int default 0,
  notes text,
  minutes_read int default 0,
  created_at timestamptz default now()
);

alter table logs enable row level security;
create policy "Public Access Logs" on logs for all using (true);

-- QUOTES
create table quotes (
  id text primary key,
  text text not null,
  member_id text references members(id),
  book_id text references books(id),
  page_num int,
  likes int default 0,
  created_at timestamptz default now()
);

alter table quotes enable row level security;
create policy "Public Access Quotes" on quotes for all using (true);

-- DISCUSSION POINTS
create table discussion_points (
  id text primary key,
  topic text not null,
  member_id text references members(id),
  session_id text references sessions(id),
  upvotes int default 0,
  created_at timestamptz default now()
);

alter table discussion_points enable row level security;
create policy "Public Access Discussion" on discussion_points for all using (true);

-- PEER REVIEWS
create table peer_reviews (
  id text primary key,
  rater_id text references members(id), -- Who gave the review
  ratee_id text references members(id), -- Who received it
  session_id text references sessions(id),
  prep int,
  contrib int,
  comment text,
  created_at timestamptz default now()
);

alter table peer_reviews enable row level security;
create policy "Public Access Reviews" on peer_reviews for all using (true);
