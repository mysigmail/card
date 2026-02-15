export const COLOR = {
  theme: {
    light: '#FFFFFF',
    dark: '#222222',
  },
  divider: {
    light: '#DDDDDD',
    dark: '#444444',
  },
}

export const EMAIL_RESPONSIVE_CSS = `
@media only screen and (max-width: 600px) {
  td.e-col-mobile-collapse {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  td.e-col-gap-mobile-collapse {
    display: block !important;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    height: var(--e-row-gap, 0px) !important;
    min-height: var(--e-row-gap, 0px) !important;
    line-height: 0 !important;
  }

  .e-mobile-hidden {
    display: none !important;
    max-height: 0 !important;
    overflow: hidden !important;
    mso-hide: all !important;
  }
}
`
