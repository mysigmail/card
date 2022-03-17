import type { RouteLayout } from '.'

declare module 'vue-router' {
  interface RouteMeta {
    layout: RouteLayout
  }
}
