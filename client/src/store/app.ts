import { defineStore } from 'pinia'
import type { State } from './types/app'

export const useAppStore = defineStore('app', {
  state: () =>
    ({
      layout: 'Default',
      isInit: false
    } as State)
})
