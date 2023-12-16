<template>
  <div class="text-editor-actions">
    <ElConfigProvider size="small">
      <div class="text-editor-actions__row">
        <ElButtonGroup>
          <ElButton
            :class="{ 'is-active': editor?.isActive('bold') }"
            @click="bold"
          >
            <UniconsBold />
          </ElButton>
          <ElButton
            :class="{ 'is-active': editor?.isActive('italic') }"
            @click="italic"
          >
            <UniconsItalic />
          </ElButton>
          <ElButton
            :class="{ 'is-active': editor?.isActive('underline') }"
            @click="underline"
          >
            <UniconsUnderline />
          </ElButton>
          <ElButton
            :class="{ 'is-active': editor?.isActive({ textDecoration: 'line-through' }) }"
            @click="strike"
          >
            <StrikeSvg class="strike" />
          </ElButton>
          <ElPopover trigger="click">
            <ElInput
              v-model="link"
              placeholder="Type a link"
            />
            <template #reference>
              <ElButton>
                <UniconsLinkH />
              </ElButton>
            </template>
          </ElPopover>
        </ElButtonGroup>
        <ElButtonGroup>
          <ElButton
            :class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }"
            @click="align('left')"
          >
            <UniconsAlignLeft />
          </ElButton>
          <ElButton
            :class="{ 'is-active': editor?.isActive({ textAlign: 'center' }) }"
            @click="align('center')"
          >
            <UniconsAlignCenter />
          </ElButton>
          <ElButton
            :class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }"
            @click="align('right')"
          >
            <UniconsAlignRight />
          </ElButton>
          <ElButton
            :class="{ 'is-active': editor?.isActive({ textAlign: 'justify' }) }"
            @click="align('justify')"
          >
            <UniconsAlignJustify />
          </ElButton>
        </ElButtonGroup>
      </div>
      <div class="text-editor-actions__row">
        <ElColorPicker
          id="text-color-picker"
          v-model="textColor"
        />
        <ElInput
          v-model="fontSize"
          type="number"
          style="width: 150px"
        >
          <template #prepend>
            <UniconsTextFields />
          </template>
          <template #append>
            px
          </template>
        </ElInput>
      </div>
    </ElConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { useEditor } from './composables'
import StrikeSvg from '~icons/svg/strikethrough'

const { align, bold, editor, fontSize, italic, link, strike, textColor, underline } = useEditor()

onMounted(() => {
  nextTick(() => {
    const el = document.getElementById('text-color-picker')
    el?.addEventListener('mousedown', (e) => {
      e.preventDefault()
    })
  })
})
</script>

<style lang="scss" scoped>
.text-editor-actions {
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-flow: wrap;
  gap: var(--spacing-xs);
  &__row {
    display: flex;
    flex-flow: wrap;
    gap: var(--spacing-xs);
  }
  .strike {
    position: relative;
    top: 1px;
  }
}

:deep(.el-button) {
  font-size: 14px;
  padding: 5px 9px;

  + .el-button {
    margin-left: 0;
  }
}

:deep(.el-input-group__prepend) {
  padding: 0 9px;
}

:deep(.el-input-group__append) {
  padding: 0 9px;
}
</style>
