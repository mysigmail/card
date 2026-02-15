<h1 align="center">MySigMail Card</h1>
<p align="center">An open source html email template builder with drag & drop editor</p>
<img src="./hero.jpg">

<p align="center">
  <a href="https://card.mysigmail.com/app">Live Demo</a>
  ·
  <a href="https://github.com/mysigmail/card/releases">Releases</a>
  ·
  <a href="https://github.com/mysigmail/card/discussions">Discussions</a>
</p>

## Motivation

We live in an era of increasing vendor lock-in and centralized control. We have seen instances where entire regions are cut off from services due to geopolitical reasons, leaving developers and users stranded. Software should be accessible and reliable, regardless of borders.

Driven by a passion for open source, I want to provide a truly independent alternative. I am releasing the core of my commercial project, [MySigMail Card](https://card.mysigmail.com), to the community to ensure that everyone has access to a powerful, self-hosted email builder. 

## Features

- Visual drag-and-drop editor
- Component catalog with ready-to-use blocks: **Menu**, **Header**, **Content**, **Feature**, **Call to Action**, **E-Commerce**, **Footer**
- Spot editing with a component tree (`Block -> Row -> Cell -> Atom`)
- Atom types: `text`, `button`, `divider`, `image`, `menu`
- JSON export/import from the UI
- Import modes: `replace` and `append`
- Template validation + sanitization on import
- Auto-persist to `localStorage` and hydration on reload
- Preview rendered in Shadow DOM to isolate editor styles

## Roadmap

The original codebase served well for years, but the web has evolved. I am currently rewriting the core from scratch to leverage modern web standards and architectural patterns. This ensures the project remains performant, maintainable, and easy to extend for years to come. 

## Support

MySigMail Card is an open source project and completely free to use.

However, the amount of effort needed to maintain and develop new features for the project is not sustainable without proper financial backing. You can support MySigMail Card development via the following methods:

<div align="center">

[![Donate via Open Collective](https://img.shields.io/badge/donate-Open%20Collective-blue.svg?style=popout&logo=opencollective)](https://opencollective.com/mysigmail)
[![Donate via PayPal](https://img.shields.io/badge/donate-PayPal-blue.svg?style=popout&logo=paypal)](https://paypal.me/antongithub)

</div>

## Development

```sh
pnpm i
pnpm dev
```

## How can I help?

Since the project is undergoing a major rewrite, architectural decisions are still in flux. Direct code contributions might be tricky at this stage, but I welcome feedback and discussions.

**The best way to help right now is to star the repository ⭐** and share it with others. Visibility helps the project grow!

![](./subscribe.gif)

## Follow

- News and updates on [Twitter](https://twitter.com/mysigmail).
- [Discussions](https://github.com/mysigmail/card/discussions)

## Commercial Usage

This project is licensed under the **AGPL-3.0**. This means if you include this editor in your own software and make it available to users over a network (SaaS), you must also make your software open source under the same license.

**Need a commercial license?**

If you want to use this editor in a proprietary application without open-sourcing your code, please [contact me](mailto:reshetov.art@gmail.com) for a commercial license.

## License

[AGPL-3.0](https://github.com/mysigmail/card/blob/master/LICENSE)

Copyright (c) 2022-present, Anton Reshetov.
