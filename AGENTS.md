# AGENTS

Проект: визуальный email-конструктор на Vue 3 + TypeScript.

## Цель агента

- Ускорять добавление email-блоков без дублирования логики.
- Сохранять единый источник правды: `tools + schema`.
- Поддерживать единственный путь рендера без отдельных runtime-компонентов на блок.

## Архитектурный контракт (обязательно)

- `Component` всегда должен иметь `schema`:
  - `src/types/editor.ts`
- Рендер блоков идет через единый рендерер:
  - `src/components/email-components/SchemaEmailComponent.vue`
  - `src/components/editor/EditorCanvas.vue`
- Превью рендерится в `Shadow DOM`, чтобы изолировать стили редактора и содержимого письма:
  - `src/components/editor/TheEditor.vue`
  - `src/utils/index.ts` (`renderToShadowDom`)
- Конфиги блоков хранятся в `catalog/*/index.ts` и собираются через field DSL:
  - `src/components/email-components/fields.ts`
- Группы инструментов описываются только через `ToolGroupRef`:
  - `groupId`, `groupRole`, `groupLabel`
  - `src/types/editor.ts`
  - `src/components/email-components/schema/groups.ts`

## Как добавлять новый блок

1. Добавить/обновить декларацию в `src/components/email-components/catalog/<category>/index.ts`.
2. Создать группы через `createSchemaGroups()` и `group(...)`.
3. Описать `tools` через `f.*` helper-ы, передавая `ToolGroupRef`.
4. Описать `schema` через `defineEmailBlockSchema(...)` из:
   - `src/components/email-components/schema/types.ts`
5. Использовать `gp(group, 'field')` для путей вместо ручной конкатенации строк.
6. При необходимости добавить новый adapter по роли (не в renderer):
   - `src/components/email-components/schema/adapters.ts`

## Typed schema paths

- Использовать типизированные пути `groupId.property` через:
  - `gp(...)`
  - `defineEmailBlockSchema`
  - `SchemaGroupFields`

## Tools и ключи

- Использовать стабильные `key` для всех tools.
- Новые инструменты добавлять через `toolBuilder` и/или `f.*` DSL.

## Архитектурная чистота

- Не добавлять альтернативные пути рендера.
- Регистрировать adapters только по `groupRole`.

## UI-компоненты (shadcn-first)

- Для UI всегда использовать приоритет:
  1. Сначала проверить, есть ли готовый компонент в `src/components/ui/*`.
  2. Если нет, добавить компонент из `shadcn-vue`.
  3. Если в `shadcn-vue` компонента нет, создать свой в `src/components/ui/*`, следуя паттерну shadcn.
- Не дублировать уже существующие UI-компоненты под новыми именами.
- Не использовать прямые `reka-ui` примитивы в фичах, если уже есть обертка в `src/components/ui/*`.
- Для установки новых shadcn-компонентов использовать `pnpm dlx shadcn-vue@latest add <component>`.
- Кастомные стили поверх shadcn делать минимально; приоритет — штатные `variant`/`size` и `class`-расширения в местах использования.
- Новые кастомные компоненты в `src/components/ui/*` оформлять по паттерну:
  - `index.ts` с экспортами, `cva`-вариантами и `VariantProps` (если есть варианты).
  - `<Component>.vue` с типами из `index.ts`, `cn(...)`, `data-slot`, и совместимым API (`class`, `variant`, `size`, `v-model` где нужно).
  - Именование и структура должны быть консистентны с текущими `button`, `input`, `toggle`, `select`, `color-picker`.

## Shadow DOM и технические классы

- Технические классы с префиксом `p-` относятся к превью письма (например, `p-html`, `p-body`, `p-ghost`, `p-is-empty`).
- Стили для `p-*` должны жить в `src/assets/scss/preview.scss`, который инжектится в `Shadow DOM`.
- Не опираться на стили внешнего редактора внутри email-превью; если нужен новый технический класс для превью, добавлять его в формате `p-*` и описывать в `preview.scss`.

## Проверки перед завершением задачи

- Типы:
  - `pnpm -s vue-tsc --noEmit --skipLibCheck`
- Линт по измененным файлам:
  - `pnpm -s eslint <changed-files>`

## Что НЕ трогать без причины

- Автогенерируемые декларации:
  - `src/types/auto-imports.d.ts`
  - `src/types/components.d.ts`
- Ambient declarations:
  - `src/env.d.ts`
  - `src/types/extensions.d.ts`

## Формат изменений

- Предпочитать небольшие, изолированные патчи.
- В документации фиксировать архитектурные решения и ограничения.
