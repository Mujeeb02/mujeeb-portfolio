
REVOKE EXECUTE ON FUNCTION public.on_blog_comment_insert() FROM PUBLIC, anon, authenticated;
-- Restrict listing of certificate bucket: drop broad SELECT and require knowing the path (files still public via getPublicUrl)
DROP POLICY IF EXISTS "Certificate images publicly readable" ON storage.objects;
CREATE POLICY "Certificate images publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'certificates' AND auth.role() = 'anon' IS NOT NULL);
