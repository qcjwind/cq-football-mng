<template>
  <div class="layout-main">
    <left-menu></left-menu>
    <div class="layout-container">
      <Header></Header>
      <div class="layout-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import LeftMenu from '@/components/LeftMenu.vue'
import Header from '@/components/Header.vue'
</script>

<style lang="less">
.layout-main {
  display: flex;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;

  .layout-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0 20px;

    .layout-content {
      width: 100%;
      min-height: 300px;
      max-height: 90%;
      overflow-y: auto;
      background: #1d2024;
      border-radius: 10px;
    }
  }
}
</style>
