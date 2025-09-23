import './assets/main.css'
import 'element-plus/dist/index.css'
// import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/index'
import App from './App.vue'
import router from './router'

router.beforeEach((to) => {
  const userStore = useUserStore()
  const ignorePath = ['/login']
  if (!userStore.user?.token && !ignorePath.includes(to.path)) {
    return '/login'
  }
  return true
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
