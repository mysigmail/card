import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from './store/app'

const history = createWebHistory()
const router = createRouter({
  linkActiveClass: 'active',
  history,
  routes: [
    {
      path: '/',
      meta: {
        layout: 'Default'
      },
      component: () => import('./views/Main.vue')
    }
  ]
})

router.beforeResolve(to => {
  const appStore = useAppStore()
  appStore.layout = to.meta.layout
  appStore.isInit = true
})

export default router
