/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  // Supabase (Tokyo region)
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;

  // Resend
  readonly RESEND_API_KEY: string;
  readonly MAIL_FROM: string;

  // Site
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    /**
     * Populated by `src/middleware.ts` from the session cookie.
     * `undefined` when the visitor is unauthenticated.
     */
    member?: {
      id: string;
      email: string;
      display_name: string | null;
      role: 'member' | 'family';
      is_staff: boolean;
    };
  }
}
