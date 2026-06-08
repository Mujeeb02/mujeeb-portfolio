
-- EXPERIENCES
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  period text NOT NULL,
  description text NOT NULL DEFAULT '',
  technologies text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experiences are viewable by everyone" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Admins insert experiences" ON public.experiences FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update experiences" ON public.experiences FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete experiences" ON public.experiences FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_experiences_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SKILLS
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level int NOT NULL DEFAULT 50 CHECK (level >= 0 AND level <= 100),
  category text NOT NULL DEFAULT 'General',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins insert skills" ON public.skills FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update skills" ON public.skills FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete skills" ON public.skills FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_skills_updated BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CERTIFICATIONS
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  credential_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certifications are viewable by everyone" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Admins insert certifications" ON public.certifications FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update certifications" ON public.certifications FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete certifications" ON public.certifications FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_certs_updated BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BIO (single-row site bio)
CREATE TABLE public.site_bio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL DEFAULT 'Full Stack Developer',
  paragraphs text[] NOT NULL DEFAULT '{}',
  location text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_bio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bio viewable by everyone" ON public.site_bio FOR SELECT USING (true);
CREATE POLICY "Admins insert bio" ON public.site_bio FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update bio" ON public.site_bio FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete bio" ON public.site_bio FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bio_updated BEFORE UPDATE ON public.site_bio FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BLOG COMMENTS
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid,
  author_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_comments_post ON public.blog_comments(post_id, created_at DESC);
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by everyone" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.blog_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);
CREATE POLICY "Users delete own comments" ON public.blog_comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins delete any comment" ON public.blog_comments FOR DELETE USING (has_role(auth.uid(),'admin'));

-- Comment notification trigger
CREATE OR REPLACE FUNCTION public.on_blog_comment_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _title text;
BEGIN
  SELECT title INTO _title FROM public.blog_posts WHERE id = NEW.post_id;
  INSERT INTO public.activity_log (type, title, description, actor_id, status)
  VALUES ('comment', 'New blog comment', NEW.author_name || ' commented on "' || COALESCE(_title,'a post') || '"', NEW.author_id, 'pending');
  PERFORM public.notify_admins('comment','New blog comment', NEW.author_name || ' commented on "' || COALESCE(_title,'a post') || '"','/blog','notify_new_review');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_blog_comment_insert AFTER INSERT ON public.blog_comments FOR EACH ROW EXECUTE FUNCTION public.on_blog_comment_insert();

-- Realtime
ALTER TABLE public.blog_likes REPLICA IDENTITY FULL;
ALTER TABLE public.blog_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_comments;

-- Storage bucket for certificate images
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates','certificates', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Certificate images publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Admins upload certificate images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update certificate images" ON storage.objects FOR UPDATE USING (bucket_id = 'certificates' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete certificate images" ON storage.objects FOR DELETE USING (bucket_id = 'certificates' AND has_role(auth.uid(),'admin'));

-- Seed initial content
INSERT INTO public.site_bio (headline, paragraphs, location, availability) VALUES (
  'Full Stack Developer | B.E. Computer Science | DSA Enthusiast',
  ARRAY[
    'Hello, World! I''m Mujeeburrahman, a passionate full-stack developer with expertise in building scalable web applications using modern technologies.',
    'I graduated from Chandigarh University with a B.E. in Computer Science. Currently working at Buildby, optimizing APIs and building admin dashboards.',
    'I''ve solved 530+ DSA problems on LeetCode and love exploring new technologies. When I''m not coding, I''m creating solutions on GitHub.'
  ],
  'SidharthaNagar, Uttar Pradesh',
  'Available for freelance'
);

INSERT INTO public.skills (name, level, category, sort_order) VALUES
  ('React.js / Next.js', 95, 'Frontend', 1),
  ('TypeScript', 92, 'Languages', 2),
  ('Node.js / Express.js', 90, 'Backend', 3),
  ('JavaScript', 95, 'Languages', 4),
  ('MongoDB / PostgreSQL', 88, 'Database', 5),
  ('Tailwind CSS / ShadCN', 90, 'Frontend', 6),
  ('Git / Docker / CI-CD', 85, 'DevOps', 7),
  ('JWT / OAuth / RBAC', 82, 'Security', 8);

INSERT INTO public.experiences (title, company, period, description, technologies, sort_order) VALUES
  ('Full Stack Developer','Buildby (Formely Nextedge labs)','July 2024 - Present',
   'Developed and optimized the "Know Your Donation" feature, reducing API response time by 72%. Engineered a scalable Admin Dashboard using NextJS, TypeScript, and MongoDB, improving data processing efficiency by 40%. Built responsive, cross-platform web applications for Recycclink, ensuring 99.9% uptime.',
   ARRAY['NextJS','TypeScript','Node.js','MongoDB','REST APIs'], 1);

INSERT INTO public.certifications (name, issuer, year, sort_order) VALUES
  ('Full Stack Web Development', 'Internshala', '2024', 1),
  ('B.E. Computer Science', 'Chandigarh University', '2024', 2),
  ('530+ DSA Problems', 'LeetCode', '2024', 3);
