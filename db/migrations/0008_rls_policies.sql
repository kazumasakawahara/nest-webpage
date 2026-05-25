-- 0008_rls_policies.sql
-- Row Level Security ポリシー
-- 注意: Astro サーバ側は service_role キーで RLS をバイパスするため、
--       これらのポリシーは Supabase 管理画面経由・anon キー経由のアクセス時に効く

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- デフォルトは全 deny。Astro 側は service_role でアクセスする前提。
-- service_role キーは Row Level Security をバイパスするため、明示的な policy は不要。

-- 将来 anon キー経由で読み取りを許可したい場合のための雛形（コメントアウト）：
-- CREATE POLICY members_read_self
--     ON members FOR SELECT
--     USING (auth.uid() = id);
