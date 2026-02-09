import { initYM } from '@/services/telemetry/ym'

export function useTelemetry() {
  if (import.meta.env.VITE_APP_TELEMETRY !== 'true')
    return

  initYM()
}
