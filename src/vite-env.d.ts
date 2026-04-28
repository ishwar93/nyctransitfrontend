/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABRICKS_HOST: string
  readonly VITE_DATABRICKS_TOKEN: string
  readonly VITE_DATABRICKS_WAREHOUSE_ID: string
}
