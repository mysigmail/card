import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('general', {
  state: () => ({
    background: {
      color: '#F5F5F5',
      image: '',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
    },
    componentStyle: 'card',
    font: 'Arial, Helvetica, sans-serif',
    preHeaderText: '',
  }),
})
