import { defineStore } from 'pinia'
import type { State } from './types/app'

export const useAppStore = defineStore('app', {
  state: (): State => ({
    layout: 'Default',
    isInit: false,
  }),
})
