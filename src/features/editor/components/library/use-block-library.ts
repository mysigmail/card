import { ref } from 'vue'

const showLibrary = ref(false)

export function useBlockLibrary() {
  return {
    showLibrary,
  }
}
