import type { MaybeRefOrGetter } from 'vue'
import { computed, reactive, ref, toValue } from 'vue'

const sectionState = reactive(new Map<string, boolean>())

export function useInspectorSectionState(
  stateKey: MaybeRefOrGetter<string | undefined>,
  defaultOpen: MaybeRefOrGetter<boolean>,
) {
  const localOpen = ref(toValue(defaultOpen))

  return computed({
    get() {
      const key = toValue(stateKey)
      return key ? (sectionState.get(key) ?? toValue(defaultOpen)) : localOpen.value
    },
    set(value: boolean) {
      const key = toValue(stateKey)
      if (key)
        sectionState.set(key, value)
      else localOpen.value = value
    },
  })
}
