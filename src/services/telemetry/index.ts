import { initYM } from './ym'

export function useTelemetry() {
  if (import.meta.env.VITE_APP_TELEMETRY !== 'true')
    return

  initYM()
}
