<template>
  <div class="sta-container">
    <ElCard body-style="display: flex; gap: 10px; justify-content: space-between;">
      <template #header>
        <span>总票数：1000</span>
      </template>
      <ElCard style="width: 45%">
        <template #header>
          <span>已售票数</span>
        </template>
        <span>1000</span>
      </ElCard>
      <ElCard style="width: 45%">
        <template #header>
          <span>剩余票数</span>
        </template>
        <span>1000</span>
      </ElCard>

    </ElCard>

    <!-- // 超出自动换行 -->
    <ElCard body-style="display: flex; flex-wrap: wrap; gap: 10px;">
      <template #header>
        <span>各区详情</span>
      </template>
      <ElCard style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>A区</span>
        </template>
        <div class="sta-item">
          <span>已售票数：1000</span>
          <span>剩余票数：500</span>
        </div>
      </ElCard>
      <ElCard style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>B区</span>
        </template>
        <div class="sta-item">
          <span>已售票数：1000</span>
          <span>剩余票数：500</span>
        </div>
      </ElCard>
      <ElCard style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>C区</span>
        </template>
        <div class="sta-item">
          <span>已售票数：1000</span>
          <span>剩余票数：500</span>
        </div>
      </ElCard>
      <ElCard style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>D区</span>
        </template>
        <div class="sta-item">
          <span>已售票数：1000</span>
          <span>剩余票数：500</span>
        </div>
      </ElCard>
      <ElCard style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>D区</span>
        </template>
        <div class="sta-item">
          <span>已售票数：1000</span>
          <span>剩余票数：500</span>
        </div>
      </ElCard>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard } from 'element-plus'
</script>

<style lang="less">

.sta-container {
  background-color: #fff;

  .sta-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
}
.el-card__header {
  text-align: center;
}

.el-card__body {
  text-align: center;
}
</style>
