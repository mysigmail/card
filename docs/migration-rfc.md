# RFC: Миграция редакторского UI с Element Plus на shadcn-vue + Tailwind CSS 4

## Статус
Предложено (уточнено 2026-02-11)

## Автор
Anton Reshetov / Codex

---

## 1. Контекст
Текущая версия проекта:
- `vue@3.3.7`
- `vite@4.5.0`
- `typescript@5.2.2`
- `element-plus@2.4.1`
- `unplugin-icons + @iconscout/unicons`
- глобальные стили на CSS (`src/assets/css/*`)

Фактический объем миграции на 2026-02-11:
- 11 файлов в `src/components/editor/**` используют `El*` компоненты.
- `ElementPlusResolver` подключен в `vite.config.ts`.
- `src/assets/css/element-plus.css` переопределяет CSS-переменные Element Plus.

## 2. Цель
- Убрать зависимость от `element-plus`.
- Внедрить `shadcn-vue` + `Tailwind CSS 4` для UI редактора.
- Обновить базовый стек (Vite/Vue/TypeScript) до актуального поддерживаемого уровня.
- Снизить связанность UI со сторонней библиотекой за счет локальных компонентов в `src/components/ui`.

## 3. Архитектурные ограничения (обязательно)
- Контракт `tools + schema` не меняется.
- Рендер email остается единым через:
  - `src/components/email-components/SchemaEmailComponent.vue`
  - `src/components/editor/EditorCanvas.vue`
- Shadow DOM превью остается обязательным:
  - `src/components/editor/TheEditor.vue`
  - `src/utils/index.ts` (`renderToShadowDom`)
- Технические классы превью `p-*` сохраняются в `src/assets/css/preview.css`.
- Не добавлять альтернативный runtime-рендер блоков.

## 4. Non-goals (вне рамок RFC)
- Переписывание block schema DSL, `toolBuilder`, `f.*`, `gp(...)`.
- Изменение данных блоков или формата сериализации шаблона письма.
- Редизайн email-контента внутри превью (меняется только UI редактора).

## 5. Предлагаемое решение

### 5.1. Обновление стека
- `vite` -> `6.x`
- `vue` -> `3.5+`
- `typescript` -> `5.7+`
- Подключение `tailwindcss@4` в редакторском UI.

### 5.2. Миграция UI
- Внедрить `shadcn-vue` и держать UI-компоненты в `src/components/ui`.
- Поэтапно заменить `El*` в редакторских инструментах.
- Предварительное соответствие:
  - `ElButton` -> `Button`
  - `ElInput` -> `Input` / `Textarea`
  - `ElSelect`, `ElOption` -> `Select`
  - `ElSwitch` -> `Switch`
  - `ElPopover` -> `Popover`
  - `ElRadioGroup`, `ElRadioButton` -> `ToggleGroup` / `RadioGroup`
  - `ElColorPicker` -> локальный `ColorPicker` (Popover + input type="color" + text input)
  - `ElButtonGroup` -> композиция `Button` + контейнер-класс
  - `ElConfigProvider` -> удалить, размер/варианты задавать на уровне локальных компонентов

### 5.3. Иконки
- Миграция с `unplugin-icons/@iconscout/unicons` на `lucide-vue-next`.
- Кастомный `~icons/svg/strikethrough` можно сохранить как локальный SVG-компонент.

### 5.4. Стили
- Tailwind используется для UI редактора.
- В scoped-стилях допускаются точечные правила, если они проще utility-классов.
- В проекте не должно быть SCSS:
  - использовать только `.css` файлы и `<style>` без `lang="scss"`.
  - `sass` не должен использоваться и не должен быть зависимостью проекта.

## 6. План внедрения (этапы)
1. Подготовка и upgrade стека.
2. Подключение Tailwind 4 + база `shadcn-vue`.
3. Поштучная миграция editor tools с Element Plus на локальные UI-компоненты.
4. Миграция иконок на Lucide.
5. Удаление `element-plus`, `ElementPlusResolver`, `element-plus.css` и финальная чистка.

Подробный план задач: `docs/migration-plan.md`.

## 7. Риски и меры
- Риск: визуальные регрессии в инструментах редактора.
  - Мера: мигрировать по файлам, проверять parity после каждого PR.
- Риск: сложность `TextEditorActions.vue` (popover + форматирование + color picker).
  - Мера: выделить как отдельный этап и не объединять с массовой миграцией.
- Риск: конфликт Tailwind с текущими глобальными стилями.
  - Мера: ограничить область Tailwind UI-частью редактора, не трогать Shadow DOM превью.

## 8. Критерии приемки
- В `src/**` нет `El*` компонентов и импорта из `element-plus`.
- В `vite.config.ts` удален `ElementPlusResolver`.
- Зависимость `element-plus` удалена из `package.json`.
- Все editor tools работают функционально как до миграции.
- Архитектурный контракт (`tools + schema`, единый renderer, Shadow DOM) не нарушен.
- Проверки проходят:
  - `pnpm -s vue-tsc --noEmit --skipLibCheck`
  - `pnpm -s eslint <changed-files>`
