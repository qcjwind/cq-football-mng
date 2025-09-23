<template>
  <div class="layout-header">
    <div class="header-nav">
      <el-icon class="icon" :size="20" color="#6C7582"><LocationInformation /></el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumbItem v-for="(item, index) in menus" :key="item.path">
          <span :class="index === menus.length - 1 ? 'active' : ''">{{ item.name }}</span>
        </el-breadcrumbItem>
      </el-breadcrumb>
    </div>
    <el-dropdown placement="bottom">
      <div class="header-user">
        <el-icon class="icon" :size="24" color="#B9BFC8"><UserFilled /></el-icon>
        <span>{{ userStore.user?.username }}</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="loginOut">退出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
 
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElIcon, ElBreadcrumb, ElBreadcrumbItem, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { LocationInformation, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/index'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const menus = ref<RouteRecordRaw[]>([])
const userStore = useUserStore()

watch(
  () => route.fullPath,
  () => {
    menus.value = route.matched
  },
  { immediate: true },
)

const loginOut = () => {
  userStore.clearUserToken()
  location.reload()
}
</script>

<style lang="less">
.layout-header {
  display: flex;
  width: 100%;
  height: 67px;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;

  .header-nav {
    display: inline-flex;
    align-items: center;
  }

  .active {
    color: #5799dc;
  }

  .icon {
    margin-right: 10px;
  }

  .header-user {
    display: inline-flex;
    align-items: center;
    color: #565d65;
    cursor: pointer;
  }
}
</style>
