import { images } from '@/components/email-components/catalog/images'
import { f } from '@/components/email-components/fields'

export function menuItems(color: string) {
  return [
    f.menuItem({
      name: 'Specs',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
    f.menuItem({
      name: 'Feature',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
    f.menuItem({
      name: 'Price',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
  ]
}

export function socialItems(theme: 'light' | 'dark') {
  const facebook = theme === 'dark' ? images.socials.facebook.white : images.socials.facebook.black
  const twitter = theme === 'dark' ? images.socials.twitter.white : images.socials.twitter.black
  const instagram
    = theme === 'dark' ? images.socials.instagram.white : images.socials.instagram.black

  return [
    f.socialItem({
      name: 'Facebook',
      link: 'https://example',
      image: {
        src: facebook,
        link: 'https://example.com',
        alt: 'Some alt',
        width: 16,
        height: 16,
      },
    }),
    f.socialItem({
      name: 'Twitter',
      link: 'https://example',
      image: {
        src: twitter,
        link: 'https://example.com',
        alt: 'Some alt',
        width: 16,
        height: 16,
      },
    }),
    f.socialItem({
      name: 'Instagram',
      link: 'https://example',
      image: {
        src: instagram,
        link: 'https://example.com',
        alt: 'Some alt',
        width: 16,
        height: 16,
      },
    }),
  ]
}
