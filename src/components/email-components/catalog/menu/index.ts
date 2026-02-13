import { menu1Composer } from './menu1'
import { menu2Composer } from './menu2'
import { menu3Composer } from './menu3'
import { menu4Composer } from './menu4'

export const menu = [
  menu1Composer('dark', 'Menu 1'),
  menu2Composer('dark', 'Menu 2'),
  menu3Composer('dark', 'Menu 3'),
  menu4Composer('dark', 'Menu 4'),
  menu1Composer('light', 'Menu 5'),
  menu2Composer('light', 'Menu 6'),
  menu3Composer('light', 'Menu 7'),
  menu4Composer('light', 'Menu 8'),
]
