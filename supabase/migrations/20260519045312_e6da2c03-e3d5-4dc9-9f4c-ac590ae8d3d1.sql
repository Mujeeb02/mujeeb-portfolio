
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.post_status AS ENUM ('published', 'draft');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ updated_at trigger helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ BLOG POSTS ============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  read_time TEXT NOT NULL DEFAULT '1 min read',
  views INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status public.post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Published posts are viewable by everyone"
  ON public.blog_posts FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ BLOG LIKES ============
CREATE TABLE public.blog_likes (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON public.blog_likes FOR SELECT USING (true);
CREATE POLICY "Users can like as themselves"
  ON public.blog_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes"
  ON public.blog_likes FOR DELETE USING (auth.uid() = user_id);

-- ============ INCREMENT POST VIEWS RPC ============
CREATE OR REPLACE FUNCTION public.increment_post_views(_post_id UUID)
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.blog_posts SET views = views + 1 WHERE id = _post_id;
$$;

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ PROJECT LIKES ============
CREATE TABLE public.project_likes (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project likes are viewable by everyone"
  ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Users can like projects as themselves"
  ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own project likes"
  ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- ============ PROJECT REVIEWS ============
CREATE TABLE public.project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.project_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post reviews"
  ON public.project_reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);
CREATE POLICY "Users can delete their own reviews"
  ON public.project_reviews FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins can delete any review"
  ON public.project_reviews FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED DATA ============
INSERT INTO public.blog_posts (slug, title, excerpt, content, read_time, views, tags, status, featured) VALUES
('building-secure-apis-with-rust', 'Building Secure APIs with Rust', 'A comprehensive guide to building high-performance, memory-safe APIs using Rust and Actix-web.', '# Building Secure APIs with Rust

Rust provides memory safety without garbage collection...', '12 min read', 3420, ARRAY['Rust','Security','API'], 'published', true),
('react-performance-optimization', 'React Performance: From Good to Blazing Fast', 'Deep dive into React performance optimization techniques including memoization and code splitting.', '# React Performance Optimization

Performance is crucial for user experience...', '8 min read', 2891, ARRAY['React','Performance','JavaScript'], 'published', true),
('understanding-sql-injection', 'Understanding SQL Injection: Attack and Defense', 'Learn how SQL injection attacks work and how to protect your applications.', '# SQL Injection

SQL injection remains one of the most common vulnerabilities...', '10 min read', 4521, ARRAY['Security','SQL','OWASP'], 'published', false),
('typescript-advanced-patterns', 'Advanced TypeScript Patterns You Need to Know', 'Explore advanced TypeScript patterns including discriminated unions and conditional types.', '# Advanced TypeScript

TypeScript offers powerful type system features...', '15 min read', 1892, ARRAY['TypeScript','JavaScript','Patterns'], 'published', false),
('docker-best-practices', 'Docker Best Practices for Production', 'Essential Docker practices for production environments including multi-stage builds.', '# Docker Best Practices

Containerization has revolutionized deployment...', '9 min read', 2103, ARRAY['Docker','DevOps','Containers'], 'draft', false),
('websocket-real-time-apps', 'Building Real-Time Apps with WebSockets', 'A practical guide to implementing real-time features using WebSockets and Socket.io.', '# Real-Time with WebSockets

Real-time communication is essential for modern apps...', '11 min read', 1567, ARRAY['WebSocket','Node.js','Real-time'], 'published', false);

INSERT INTO public.projects (title, description, tags, github_url, live_url, featured) VALUES
('Beyondseed', 'A startup-investor collaboration platform with dual dashboards (Admin & Investor). Features bulk document upload via AWS S3 pre-signed URLs, User Manual, Investment Analytics, and Accelerator D2C Program modules.', ARRAY['React','TypeScript','AWS S3','PostgreSQL','REST APIs'], 'https://github.com/Mujeeb02', 'https://beyondseed.com', true),
('Dopamine Rush', 'An interactive memory game using React 18, TypeScript, and Vite. Features Framer Motion animations, progressive difficulty, streak-based scoring, and leaderboard competition with Supabase integration.', ARRAY['React 18','TypeScript','Vite','Tailwind CSS','Supabase','Framer Motion'], 'https://github.com/Mujeeb02', 'https://dopaminerush.vercel.app', true);
