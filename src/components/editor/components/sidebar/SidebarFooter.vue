<template>
  <div class="footer">
    <div class="footer__item">
      <div class="cta">
        If you like this project,<br>please give it a
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 32 32"
        >
          <path
            d="m16 2l-4.55 9.22l-10.17 1.47l7.36 7.18L6.9 30l9.1-4.78L25.1 30l-1.74-10.13l7.36-7.17l-10.17-1.48Z"
          />
        </svg>
        on
        <a
          href="https://github.com/mysigmail/card"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>!
      </div>
    </div>
    <div class="footer__item">
      v{{ version }}&nbsp;•&nbsp;
      <a
        href="https://github.com/mysigmail/card/releases"
        target="_blank"
        rel="noopener noreferrer"
      >Changelog</a>
    </div>
    <div class="footer__item">
      ©{{ year }}&nbsp;•&nbsp;Anton Reshetov
    </div>
  </div>
</template>

<script setup lang="ts">
import { version } from '#/package.json'

const year = new Date().getFullYear()
</script>

<style lang="scss" scoped>
.footer {
  padding: var(--spacing-sm);
  color: var(--color-contrast-medium);
  font-size: var(--text-sm);
  &__item {
    line-height: 18px;
  }
  a {
    color: var(--color-contrast-medium);
  }
}

.cta {
  border: 1px solid #aaa;
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  border-radius: 6px;
  svg {
    fill: #e5c764;
    position: relative;
    top: 3px;
  }
}
</style>
