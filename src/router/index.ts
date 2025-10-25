// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { markRaw } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../layout/index.vue'
import { House, OfficeBuilding, TrendCharts, Tickets } from '@element-plus/icons-vue'

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
        {
          path: '/home/ticketInfo',
          name: '票务信息',
          component: () => import('../views/ticketInfo/index.vue'),
          isHideMenu: false,
        },
        {
          path: '/venue',
          name: '场馆列表',
          icon: markRaw(OfficeBuilding),
          component: () => import('../views/venue/index.vue'),
        },
        {
          path: '/orderList',
          name: '订单列表',
          icon: markRaw(Tickets),
          component: () => import('../views/orderList/index.vue'),
        },
        {
          path: '/sta',
          name: '统计',
          icon: markRaw(TrendCharts),
          isHideMenu: false,
          component: () => import('../views/sta/index.vue'),
        },
      ],
    },
    {
      path: '/agreement',
      name: 'agreement',
      isHideMenu: false,
      component: () => import('../views/agreement/index.vue'),
    },
    {
      path: '/share',
      name: 'share',
      isHideMenu: true,
      component: () => import('../views/share/index.vue'),
    },
  ],
})

export default router
