# План реализации: миграция UI с Element Plus на shadcn-vue + Tailwind CSS 4

## Дата
2026-02-11

## Цель
Реализовать RFC `docs/migration-rfc.md` поэтапно, без нарушения архитектурного контракта редактора (`tools + schema`, единый renderer, Shadow DOM превью).

## Легенда
- `[x]` выполнено
- `[ ]` не выполнено

## Базовые ограничения (всегда)
- [x] Не менять контракт `tools + schema`.
- [x] Не добавлять альтернативный путь рендера email-блоков.
- [x] Сохранять Shadow DOM превью через `renderToShadowDom`.
- [x] Держать технические `p-*` классы в `src/assets/css/preview.css`.

## Этап 0. Подготовка (PR-1) [ ] не закрыт
- [x] Зафиксировать RFC в `docs/migration-rfc.md`.
- [x] Зафиксировать план миграции в `docs/migration-plan.md`.
- [ ] Снять baseline parity артефакты (скриншоты/видео).
- [ ] Зафиксировать owner для `ColorPicker` и `TextEditorActions`.

Критерий этапа:
- [ ] Документация согласована, baseline parity артефакты сохранены.

## Этап 1. Обновление платформы (PR-2) [ ] не закрыт
- [x] Обновить базовые версии `vite`, `vue`, `typescript`.
- [x] Обновить связанные зависимости сборки/типизации.
- [ ] Подтвердить стабильность type/runtime проверками.

Проверки этапа:
- [ ] `pnpm -s vue-tsc --noEmit --skipLibCheck`
- [ ] `pnpm build`

Критерий этапа:
- [ ] Приложение стабильно работает на новых версиях без функциональных изменений UI.

## Этап 2. Tailwind + shadcn база (PR-3) [x] закрыт
- [x] Подключить Tailwind CSS 4 в UI редактора.
- [x] Инициализировать shadcn-vue (`components.json`, `src/lib/utils.ts`, токены в `global.css`).
- [x] Убрать legacy reset/base/fonts слой из глобального UI-CSS (`global.css` использует Tailwind + shadcn токены).
- [x] Сгенерировать базовые компоненты:
  - [x] `Button`
  - [x] `Input`
  - [x] `Textarea`
  - [x] `Switch`
  - [x] `Select`
  - [x] `Popover`
  - [x] `ToggleGroup`
  - [x] `Tooltip`
  - [x] `Dialog`
- [x] Использовать shadcn-компоненты в не-критичном месте редактора (`InputTool`, `ToggleTool`, `GridTool`, `MultiTool`).
- [x] Свести `variables.css` к layout-переменным (`header/sidebar/canvas widths`), убрать legacy color/spacing/text vars.
- [x] Не удалять Element Plus на этом этапе.

Критерий этапа:
- [x] Tailwind классы применяются в редакторе.
- [x] Базовые shadcn-компоненты доступны и используются в редакторе.

## Этап 3. Миграция editor tools (PR-4..PR-7) [ ] в работе

### 3.1 Низкая сложность (PR-4) [x] закрыт
- [x] `src/components/editor/components/tools/InputTool.vue`
- [x] `src/components/editor/components/tools/SelectTool.vue`
- [x] `src/components/editor/components/tools/ToggleTool.vue`
- [x] `src/components/editor/components/tools/GridTool.vue`
- [x] `src/components/editor/components/tools/MultiTool.vue`

### 3.2 Средняя сложность (PR-5) [x] закрыт
- [x] `src/components/editor/components/tools/AlignTool.vue`
- [x] `src/components/editor/components/tools/PaddingTool.vue`
- [x] `src/components/editor/components/tools/ImageTool.vue`
- [x] `src/components/editor/EditorGeneralTools.vue`

### 3.3 Высокая сложность (PR-6) [x] закрыт
- [x] `src/components/editor/components/tools/ColorPickerTool.vue`
- [x] `src/components/editor/components/tools/text/TextEditorActions.vue`

Для каждого PR:
- [x] Заменить `El*` компоненты на `src/components/ui/*`.
- [x] Сохранить текущий `v-model` и пользовательское поведение.
- [x] Перенести стили на Tailwind/минимальные scoped-правила.
- [ ] Проверить parity по baseline сценариям.

Критерий этапа:
- [x] В перечисленных файлах нет `El*`.
- [ ] Поведение инструментов соответствует baseline.

## Этап 4. Иконки (PR-8) [ ] в работе
- [x] Подключить `lucide-vue-next`.
- [x] Перенести `Unicons*` на Lucide в редакторских файлах.
- [x] Удалить `@iconscout/unicons`.
- [ ] Удалить `unplugin-icons` (можно только после замены `SvgLogoWhite`/custom svg loader).

Критерий этапа:
- [x] Нет импортов `Unicons*`.
- [ ] Визуально кнопки/иконки читаемы и консистентны.

## Этап 5. Удаление Element Plus и cleanup (PR-9) [ ] в работе
- [x] Удалить `element-plus` из `package.json`.
- [x] Удалить `ElementPlusResolver` из `vite.config.ts`.
- [x] Удалить `src/assets/css/element-plus.css` и импорт из `src/assets/css/global.css`.
- [ ] Обновить dev-документацию при изменении команд/зависимостей.

Проверки этапа:
- [ ] `pnpm -s vue-tsc --noEmit --skipLibCheck`
- [ ] `pnpm -s eslint <changed-files>`
- [ ] `pnpm build`

Критерий этапа:
- [ ] Полная сборка и запуск без Element Plus.

## Сквозной чеклист качества
- [x] Нет изменений в schema renderer:
  - `src/components/email-components/SchemaEmailComponent.vue`
  - `src/components/editor/EditorCanvas.vue`
- [x] `renderToShadowDom` и `preview.css` не тронуты критично.
- [x] Формат данных блоков в store/schema не менялся.
- [ ] Type-check и lint проходят на измененных файлах.

## Основные риски
- [ ] UX-регресс в `TextEditorActions` при миграции popover/color/link toolbar.
- [ ] Конфликт Tailwind с legacy reset/base стилями редактора.
- [ ] Слишком крупные PR и усложнение review.
