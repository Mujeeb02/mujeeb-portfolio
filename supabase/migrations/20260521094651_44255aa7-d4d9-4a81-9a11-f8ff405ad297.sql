
REVOKE EXECUTE ON FUNCTION public.notify_admins(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_notification_settings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_contact_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_blog_like_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_project_like_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_project_review_insert() FROM PUBLIC, anon, authenticated;
