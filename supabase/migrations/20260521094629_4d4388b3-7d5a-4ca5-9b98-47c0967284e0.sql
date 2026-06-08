
-- =========================================================
-- CONTACTS
-- =========================================================
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new', -- new | read | archived
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact" ON public.contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contacts" ON public.contacts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.contacts
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contacts" ON public.contacts
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_contacts_created_at ON public.contacts (created_at DESC);

-- =========================================================
-- NOTIFICATIONS (per-user)
-- =========================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- comment | like | view | system | warning | success | contact | review
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
-- inserts only via SECURITY DEFINER trigger funcs

CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- =========================================================
-- NOTIFICATION SETTINGS (per-user)
-- =========================================================
CREATE TABLE public.notification_settings (
  user_id uuid PRIMARY KEY,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT false,
  weekly_digest boolean NOT NULL DEFAULT true,
  notify_new_contact boolean NOT NULL DEFAULT true,
  notify_new_like boolean NOT NULL DEFAULT true,
  notify_new_review boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notification settings" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notification settings" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_notification_settings_updated
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- ACTIVITY LOG (admin-visible audit feed)
-- =========================================================
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- create | edit | delete | publish | view | like | login | settings | comment | contact | review
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text, -- success | pending | error | null
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view activity log" ON public.activity_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete activity log" ON public.activity_log
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
-- inserts via SECURITY DEFINER trigger funcs

CREATE INDEX idx_activity_log_created ON public.activity_log (created_at DESC);

-- =========================================================
-- HELPERS / TRIGGERS
-- =========================================================

-- broadcast a notification to every admin (respecting per-user settings)
CREATE OR REPLACE FUNCTION public.notify_admins(_type text, _title text, _message text, _link text, _setting text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid;
BEGIN
  FOR _uid IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    -- ensure a settings row exists
    INSERT INTO public.notification_settings (user_id) VALUES (_uid)
      ON CONFLICT (user_id) DO NOTHING;
    -- respect the named per-setting toggle (notify_new_contact / notify_new_like / notify_new_review)
    IF _setting IS NULL OR EXISTS (
      SELECT 1 FROM public.notification_settings s
      WHERE s.user_id = _uid
        AND ((_setting = 'notify_new_contact' AND s.notify_new_contact)
          OR (_setting = 'notify_new_like'    AND s.notify_new_like)
          OR (_setting = 'notify_new_review'  AND s.notify_new_review))
    ) THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (_uid, _type, _title, _message, _link);
    END IF;
  END LOOP;
END;
$$;

-- create profile on signup (already exists) + seed notification_settings
CREATE OR REPLACE FUNCTION public.seed_notification_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_notification_settings();

-- ensure existing admins have settings rows
INSERT INTO public.notification_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- contact insert -> activity + notify admins
CREATE OR REPLACE FUNCTION public.on_contact_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_log (type, title, description, status)
  VALUES ('contact', 'New contact message', NEW.name || ' <' || NEW.email || '>: ' || COALESCE(NEW.subject,''), 'pending');

  PERFORM public.notify_admins(
    'contact',
    'New contact message',
    NEW.name || ' just messaged you' || CASE WHEN NEW.subject <> '' THEN ' — ' || NEW.subject ELSE '' END,
    '/dashboard',
    'notify_new_contact'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_on_contact_insert
  AFTER INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.on_contact_insert();

-- blog like -> activity + notify
CREATE OR REPLACE FUNCTION public.on_blog_like_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _title text;
BEGIN
  SELECT title INTO _title FROM public.blog_posts WHERE id = NEW.post_id;
  INSERT INTO public.activity_log (type, title, description, actor_id, status)
  VALUES ('like', 'New like', 'Post liked: ' || COALESCE(_title,'(deleted)'), NEW.user_id, 'success');
  PERFORM public.notify_admins('like', 'New like', 'Someone liked "' || COALESCE(_title,'a post') || '"', '/blog', 'notify_new_like');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_on_blog_like_insert
  AFTER INSERT ON public.blog_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_blog_like_insert();

-- project like -> activity + notify
CREATE OR REPLACE FUNCTION public.on_project_like_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _title text;
BEGIN
  SELECT title INTO _title FROM public.projects WHERE id = NEW.project_id;
  INSERT INTO public.activity_log (type, title, description, actor_id, status)
  VALUES ('like', 'Project liked', _title, NEW.user_id, 'success');
  PERFORM public.notify_admins('like', 'Project liked', 'Someone liked "' || COALESCE(_title,'a project') || '"', '/projects', 'notify_new_like');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_on_project_like_insert
  AFTER INSERT ON public.project_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_project_like_insert();

-- project review -> activity + notify
CREATE OR REPLACE FUNCTION public.on_project_review_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _title text;
BEGIN
  SELECT title INTO _title FROM public.projects WHERE id = NEW.project_id;
  INSERT INTO public.activity_log (type, title, description, actor_id, status)
  VALUES ('comment', 'New review', NEW.author_name || ' rated "' || COALESCE(_title,'') || '" ' || NEW.rating || '/5', NEW.author_id, 'pending');
  PERFORM public.notify_admins('comment', 'New review', NEW.author_name || ' rated "' || COALESCE(_title,'a project') || '" ' || NEW.rating || '/5', '/projects', 'notify_new_review');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_on_project_review_insert
  AFTER INSERT ON public.project_reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_project_review_insert();
