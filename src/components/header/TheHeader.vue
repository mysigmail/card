<template>
  <div class="header">
    <div class="logo">
      <SvgLogoWhite
        height="19"
        width="90"
      />
    </div>
    <div class="tools">
      tools
    </div>
    <div class="actions">
      actions
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  background-color: var(--color-contrast-high);
  color: var(--color-contrast-low);
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;
  }
}
</style>
