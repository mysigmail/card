import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import './assets/scss/global.scss'

createApp(App).use(router).use(createPinia()).mount('#app')
