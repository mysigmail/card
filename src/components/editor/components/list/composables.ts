import { ref } from 'vue'

const showList = ref(false)
export function useList() {
  return {
    showList,
  }
}
