/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  // Add other client-exposed vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
