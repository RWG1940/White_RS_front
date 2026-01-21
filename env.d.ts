/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string
  readonly VITE_FROTEND_URL?: string
  readonly VITE_PORT?: string
  readonly VITE_BROWSER_TITLE?: string
  readonly VITE_BROWSER_NAME?: string
  readonly VITE_BOTTOM_TEXT?: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
