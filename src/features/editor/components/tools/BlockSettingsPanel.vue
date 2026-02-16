<script setup lang="ts">
import { useSelection } from '@/features/editor/model'
import AtomSettings from './AtomSettings.vue'
import BlockSettings from './BlockSettings.vue'
import CellSettings from './CellSettings.vue'
import RowSettings from './RowSettings.vue'
import { useSettingsTools } from './use-settings-tools'

const { selectionLevel, selectedBlock, selectedRow, selectedCell, selectedAtom } = useSelection()

const {
  cellWidthMode,
  cellHeightMode,
  blockAppearanceTools,
  rowSpacingTools,
  rowAppearanceTools,
  cellSpacingTools,
  cellAppearanceTools,
  atomSpacingTools,
  atomTools,
  rowHiddenOnMobile,
  rowCollapseOnMobile,
  cellHiddenOnMobile,
  atomHiddenOnMobile,
  onItemWidthModeChange,
  onItemWidthChange,
  onItemHeightModeChange,
  onItemHeightChange,
  onItemVerticalAlignChange,
  onItemHorizontalAlignChange,
} = useSettingsTools()
</script>

<template>
  <div data-slot="block-settings-panel">
    <BlockSettings
      v-if="selectionLevel === 'block' && selectedBlock"
      :block="selectedBlock"
      :tools="blockAppearanceTools"
    />

    <RowSettings
      v-if="selectionLevel === 'row' && selectedRow && selectedBlock"
      v-model:hidden-on-mobile="rowHiddenOnMobile"
      v-model:collapse-on-mobile="rowCollapseOnMobile"
      :spacing-tools="rowSpacingTools"
      :appearance-tools="rowAppearanceTools"
    />

    <CellSettings
      v-if="selectionLevel === 'cell' && selectedCell && selectedBlock"
      v-model:hidden-on-mobile="cellHiddenOnMobile"
      :cell="selectedCell"
      :spacing-tools="cellSpacingTools"
      :appearance-tools="cellAppearanceTools"
      :width-mode="cellWidthMode"
      :height-mode="cellHeightMode"
      @update:width-mode="onItemWidthModeChange"
      @update:height-mode="onItemHeightModeChange"
      @update:width="onItemWidthChange"
      @update:height="onItemHeightChange"
      @update:vertical-align="onItemVerticalAlignChange"
      @update:horizontal-align="onItemHorizontalAlignChange"
    />

    <AtomSettings
      v-if="selectionLevel === 'atom' && selectedAtom"
      v-model:hidden-on-mobile="atomHiddenOnMobile"
      :atom="selectedAtom"
      :spacing-tools="atomSpacingTools"
      :tools="atomTools"
    />
  </div>
</template>
