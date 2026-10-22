-- BloxMobile Cloud Schema Migration (Supabase PostgreSQL)
-- Enforces strict Row Level Security (RLS) and separates admin roles

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile (role protected)" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent elevating own role
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- 2. Games Catalog Table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  touch_controls_rating SMALLINT CHECK (touch_controls_rating BETWEEN 1 AND 5),
  performance_tier TEXT CHECK (performance_tier IN ('Smooth', 'Moderate', 'Demanding')),
  recommended_graphics TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_demo BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_games_place_id ON public.games(place_id);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published games are viewable by everyone" 
  ON public.games FOR SELECT USING (is_published = true);

CREATE POLICY "Admins have full CRUD on games" 
  ON public.games FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 3. User Favorites Table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites" 
  ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" 
  ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
  ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- 4. User Presets Table
CREATE TABLE IF NOT EXISTS public.user_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  theme TEXT NOT NULL CHECK (theme IN ('dark', 'amoled', 'neon')),
  accent TEXT NOT NULL CHECK (accent IN ('violet', 'emerald', 'rose', 'amber', 'cyan', 'blue')),
  bg_pattern TEXT NOT NULL CHECK (bg_pattern IN ('mesh', 'grid', 'dots', 'plain')),
  animation_intensity TEXT NOT NULL CHECK (animation_intensity IN ('full', 'subtle', 'off')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own presets" 
  ON public.user_presets FOR ALL USING (auth.uid() = user_id);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
