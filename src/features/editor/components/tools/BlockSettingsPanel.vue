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
  blockLayoutTools,
  blockAppearanceTools,
  rowLayoutTools,
  rowAppearanceTools,
  cellLayoutTools,
  cellAppearanceTools,
  cellLinkTools,
  atomContentTools,
  atomLayoutTools,
  atomAppearanceTools,
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
  onRowHiddenOnMobileChange,
  onRowCollapseOnMobileChange,
  onCellHiddenOnMobileChange,
  onAtomHiddenOnMobileChange,
} = useSettingsTools()
</script>

<template>
  <div data-slot="block-settings-panel">
    <BlockSettings
      v-if="selectionLevel === 'block' && selectedBlock"
      :block="selectedBlock"
      :layout-tools="blockLayoutTools"
      :appearance-tools="blockAppearanceTools"
    />

    <RowSettings
      v-if="selectionLevel === 'row' && selectedRow && selectedBlock"
      :hidden-on-mobile="rowHiddenOnMobile"
      :collapse-on-mobile="rowCollapseOnMobile"
      :layout-tools="rowLayoutTools"
      :appearance-tools="rowAppearanceTools"
      @update:hidden-on-mobile="onRowHiddenOnMobileChange"
      @update:collapse-on-mobile="onRowCollapseOnMobileChange"
    />

    <CellSettings
      v-if="selectionLevel === 'cell' && selectedCell && selectedBlock"
      :hidden-on-mobile="cellHiddenOnMobile"
      :cell="selectedCell"
      :layout-tools="cellLayoutTools"
      :appearance-tools="cellAppearanceTools"
      :link-tools="cellLinkTools"
      :width-mode="cellWidthMode"
      :height-mode="cellHeightMode"
      @update:width-mode="onItemWidthModeChange"
      @update:height-mode="onItemHeightModeChange"
      @update:width="onItemWidthChange"
      @update:height="onItemHeightChange"
      @update:vertical-align="onItemVerticalAlignChange"
      @update:horizontal-align="onItemHorizontalAlignChange"
      @update:hidden-on-mobile="onCellHiddenOnMobileChange"
    />

    <AtomSettings
      v-if="selectionLevel === 'atom' && selectedAtom"
      :hidden-on-mobile="atomHiddenOnMobile"
      :atom="selectedAtom"
      :content-tools="atomContentTools"
      :layout-tools="atomLayoutTools"
      :appearance-tools="atomAppearanceTools"
      @update:hidden-on-mobile="onAtomHiddenOnMobileChange"
    />
  </div>
</template>
