/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PB_URL: string
  readonly VITE_PB_PRODUCTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
