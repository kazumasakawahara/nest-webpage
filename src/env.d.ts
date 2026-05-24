/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly RESEND_API_KEY: string;
  readonly MAIL_FROM: string;
  readonly PUBLIC_SITE_URL: string;
  readonly SESSION_COOKIE_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    member?: {
      id: string;
      email: string;
      display_name: string | null;
      role: 'member' | 'family';
      is_staff: boolean;
    };
  }
}
