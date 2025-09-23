<template>
  <div class="left-menu">
    <div class="logo-title">
      <img class="icon" src="../assets/images/logo.png" alt="" />
    </div>
    <el-menu router :default-active="activeIndex">
      <template v-for="item in menuArr">
        <el-menu-item
          v-if="!item.children || item.children?.length == 0"
          :index="item.path"
          :key="item.path"
        >
          <el-icon :size="15">
            <component :is="item.icon" markRaw></component>
          </el-icon>
          {{ item.name }}
        </el-menu-item>
        <el-sub-menu v-else :index="item.path" :key="item.path + '1'">
          <el-menu-item v-for="_item in item.children" :index="item.path" :key="_item.path">{{
            _item.name
          }}</el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElSubMenu, ElIcon } from 'element-plus'
import type { RouteRecordRaw } from 'vue-router'

type IMenus = {
  isHideMenu: boolean
  icon: Component
} & RouteRecordRaw

const route = useRoute()
const router = useRouter()
const menuArr = ref<IMenus[]>([])
const activeIndex = ref<string>()
const initMenu = () => {
  const menus: IMenus[] = (router.options.routes as IMenus[]) || []
  const renderMenu = (menuList: IMenus[]) => {
    return menuList
      ?.map((item) => {
        if (item.isHideMenu === false) {
          return null
        }
        if (item.children && item.children.length > 0) {
          item.children = renderMenu(item.children as IMenus[]) as IMenus[]
          // 移除空的 children 数组
          if (item.children.length === 0) {
            delete item.children
          }
        }
        return item
      })
      .filter((item) => item !== null)
  }
  menuArr.value = renderMenu(menus[1].children as IMenus[]) as IMenus[]
}

const setActiviMenu = () => {
  activeIndex.value = route.fullPath
}

onMounted(() => {
  initMenu()
  setActiviMenu()
})
</script>

<style lang="less">
.left-menu {
  width: 200px;
  height: 100%;
  flex-shrink: 0;
  background: rgba(29, 32, 36, 1);

  .logo-title {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    font-size: 24px;
    color: rgba(87, 153, 220, 1);

    .icon {
      width: 70px;
    }
  }
  .el-menu {
    border: none;
    .el-menu-item {
      &:hover {
        color: #e1f0ff;
      }
    }
    .is-active {
      background-color: #243146;
      border-right: 4px solid #5799dc;
    }
  }
}
</style>
