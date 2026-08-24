<script setup lang="ts">
import { Heart, Star } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
</script>

<template>
  <div
    data-slot="sidebar-support-card"
    class="rounded-lg border border-border bg-muted/30 p-3"
  >
    <div class="mb-1 font-medium leading-4 text-foreground">
      Keep email design open
    </div>
    <p class="mb-3 leading-4">
      Card is the production-grade, open-source alternative to commercial email builders.
    </p>

    <Button
      as="a"
      size="sm"
      class="mb-1 w-full"
      href="https://github.com/mysigmail/card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Star class="fill-current" />
      Star Card on GitHub
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="w-full text-muted-foreground hover:text-foreground"
        >
          <Heart />
          Support development
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="center"
        class="w-56"
      >
        <DropdownMenuLabel>Support Card development</DropdownMenuLabel>
        <DropdownMenuItem as-child>
          <a
            href="https://opencollective.com/mysigmail"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="flex flex-col">
              <span>Open Collective</span>
              <span class="text-xs text-muted-foreground">Transparent funding</span>
            </span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem as-child>
          <a
            href="https://paypal.me/antongithub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="flex flex-col">
              <span>PayPal</span>
              <span class="text-xs text-muted-foreground">One-time donation</span>
            </span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
