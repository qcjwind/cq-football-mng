// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { markRaw } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../layout/index.vue'
import { House } from '@element-plus/icons-vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      isHideMenu: false,
      component: Login,
    },
    {
      path: '/',
      name: '首页',
      component: Layout,
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: '赛事管理',
          icon: markRaw(House),
          component: () => import('../views/home/index.vue'),
        },
      ],
    },
  ],
})

export default router
