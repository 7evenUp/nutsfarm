/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENVIRONMENT: "PROD" | "DEV"
  readonly VITE_BOT_NAME: string
  readonly VITE_IS_DEV_LOCAL: boolean
  readonly VITE_TIME_BEFORE_CLAIMS: string
  readonly VITE_HARDCODE_QUERY_STRING: string
  readonly VITE_DEFAULT_REF_CODE: string
  readonly VITE_LANGUAGE_TO_REGION_MAP: string
  readonly VITE_CALENDAR_DESCRIPTION_RU: string
  readonly VITE_CALENDAR_DESCRIPTION_EN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
