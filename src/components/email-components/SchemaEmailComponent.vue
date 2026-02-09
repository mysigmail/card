<script setup lang="ts">
import type { EmailBlockSchema } from '@/components/email-components/schema/types'
import type { AlignTool, Tool } from '@/types/editor'
import type { GridItem, Menu, Social } from '@/types/email-components/components'
import { MRow } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import {
  buildSchemaModel,
  resolveSchemaPath,
  resolveSchemaStyle,
} from '@/components/email-components/schema/model'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  index: number
  tools: Tool[]
  schema: EmailBlockSchema
}

const props = defineProps<Props>()

const { onEditTool } = useComponentsStore()

const model = computed(() => buildSchemaModel(props.tools))

const rootAttrs = computed<Record<string, unknown> | undefined>(() => {
  return resolve(props.schema.root?.attrs)
})

function resolve<T>(path?: string) {
  return resolveSchemaPath(model.value, path) as T | undefined
}

function resolveString(path?: string) {
  return resolve<string>(path)
}

function resolveAlign(path?: string) {
  return resolve<AlignTool['value']>(path)
}

function resolveWidth(path?: string) {
  return resolve<string | number>(path)
}

function resolveAttrs(path?: string) {
  return resolve<Record<string, unknown>>(path)
}

function resolveImageAttrs(path?: string) {
  return resolve<HTMLImageElement>(path)
}

function resolveMenuItems(path?: string) {
  return resolve<Menu[]>(path) || []
}

function resolveSocialItems(path?: string) {
  return resolve<Social[]>(path) || []
}

function resolveGridItems(path?: string) {
  return resolve<GridItem[]>(path) || []
}

function isVisible(path?: string) {
  if (!path)
    return true

  return Boolean(resolve<unknown>(path))
}

function nodeStyle(styleBindings?: Record<string, string>) {
  return resolveSchemaStyle(model.value, styleBindings)
}

function onNodeClick(group?: string) {
  if (!group)
    return

  onEditTool(group, props.index)
}

function onRootClick() {
  onNodeClick(props.schema.root?.clickGroup)
}
</script>

<template>
  <EmailBase
    :index="index"
    v-bind="rootAttrs"
    @click.self="onRootClick"
  >
    <template
      v-for="(node, nodeIndex) in schema.nodes"
      :key="nodeIndex"
    >
      <MRow
        v-if="node.type === 'row' && isVisible(node.if)"
        :style="nodeStyle(node.styleBindings)"
        @click.self="onNodeClick(node.clickGroup)"
      >
        <template
          v-for="(child, childIndex) in node.children"
          :key="`${nodeIndex}_${childIndex}`"
        >
          <EImg
            v-if="child.type === 'logo' && isVisible(child.if)"
            :id="id"
            :group="child.group"
            :align="resolveAlign(child.align)"
            :width="resolveWidth(child.width)"
            :img-attrs="resolveImageAttrs(child.attrs)"
            :link="resolveString(child.link)"
            @click="onEditTool(child.group, index)"
          />

          <EMenu
            v-if="child.type === 'menu' && isVisible(child.if)"
            :id="id"
            :group="child.group"
            :align="resolveAlign(child.align)"
            :width="resolveWidth(child.width)"
            :items="resolveMenuItems(child.items)"
            @click="onEditTool(child.group, index)"
          />

          <ESocial
            v-if="child.type === 'social' && isVisible(child.if)"
            :id="id"
            :group="child.group"
            :align="resolveAlign(child.align)"
            :width="resolveWidth(child.width)"
            :items="resolveSocialItems(child.items)"
            @click="onEditTool(child.group, index)"
          />

          <EText
            v-if="child.type === 'text' && isVisible(child.if)"
            :id="id"
            :group="child.group"
            :link="resolveString(child.link)"
            :width="resolveWidth(child.width)"
            :value="resolveString(child.value)"
            v-bind="resolveAttrs(child.attrs)"
            @click="onEditTool(child.group, index)"
          >
            <template
              v-for="(nestedChild, nestedIndex) in child.children || []"
              :key="`${nodeIndex}_${childIndex}_${nestedIndex}`"
            >
              <EButton
                v-if="nestedChild.type === 'button' && isVisible(nestedChild.if)"
                :id="id"
                :group="nestedChild.group"
                :align="resolveAlign(nestedChild.align)"
                :width="resolveWidth(nestedChild.width)"
                :text="resolveString(nestedChild.text)"
                :attrs="resolveAttrs(nestedChild.attrs)"
                inline
                @click.stop="onEditTool(nestedChild.group, index)"
              />
            </template>
          </EText>

          <EGrid
            v-if="child.type === 'grid' && isVisible(child.if)"
            :id="id"
            :group="child.group"
            :align="resolveAlign(child.align)"
            :gap="resolveWidth(child.gap)"
            :width="resolveWidth(child.width)"
            :items="resolveGridItems(child.items)"
            @click="onEditTool(child.group, index)"
          />

          <EButton
            v-if="child.type === 'button' && isVisible(child.if)"
            :id="id"
            :group="child.group"
            :align="resolveAlign(child.align)"
            :width="resolveWidth(child.width)"
            :text="resolveString(child.text)"
            :attrs="resolveAttrs(child.attrs)"
            @click.stop="onEditTool(child.group, index)"
          />
        </template>
      </MRow>

      <EDivider
        v-if="node.type === 'divider' && isVisible(node.if)"
        :id="id"
        :group="node.group"
        :color="resolveString(node.color)"
        :style="nodeStyle(node.styleBindings)"
        @click="onEditTool(node.group, index)"
      />
    </template>
  </EmailBase>
</template>

<style lang="scss" scoped></style>
