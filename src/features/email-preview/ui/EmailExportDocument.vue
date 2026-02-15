<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { CanvasBlockInstance, GeneralTool } from '@/entities/template'
import { MBody, MContainer, MHead, MHtml, MPreview } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import { EMAIL_RESPONSIVE_CSS } from '@/features/email-preview/constants'
import ExportBlockRenderer from '@/features/email-preview/ui/ExportBlockRenderer.vue'

interface Props {
  components: CanvasBlockInstance[]
  general: GeneralTool
}

const props = defineProps<Props>()

const EMAIL_TEMPLATE_WIDTH = 600
const HEAD_STYLE_TAG = 'style'

const container: CSSProperties = {
  width: `${EMAIL_TEMPLATE_WIDTH}px`,
  maxWidth: '100%',
  margin: '0 auto',
  tableLayout: 'fixed',
}

const bodyStyle = computed<CSSProperties>(() => {
  return {
    backgroundImage: props.general.background.image ? `url(${props.general.background.image})` : '',
    backgroundRepeat: props.general.background.repeat,
    backgroundColor: props.general.background.color,
    backgroundSize: props.general.background.size,
    backgroundPosition: props.general.background.position,
    fontFamily: props.general.font,
    padding: props.general.padding.map(i => `${i}px`).join(' '),
  }
})

function isCanvasBlockInstance(component: CanvasBlockInstance): component is CanvasBlockInstance {
  return component.version === 2
}
</script>

<template>
  <MHtml>
    <MHead>
      <component :is="HEAD_STYLE_TAG">
        {{ EMAIL_RESPONSIVE_CSS }}
      </component>
    </MHead>
    <MPreview :text="general.previewText" />
    <MBody :style="bodyStyle">
      <MContainer :style="container">
        <template
          v-for="component in components"
          :key="component.id"
        >
          <ExportBlockRenderer
            v-if="isCanvasBlockInstance(component)"
            :block="component.block"
          />
        </template>
      </MContainer>
    </MBody>
  </MHtml>
</template>
