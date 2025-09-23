<template>
  <ElIcon :size="25" :color="props.color">
    <LocationFilled></LocationFilled>
  </ElIcon>
</template>

<script setup lang="ts">
import { LocationFilled } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
const props = defineProps(['color'])
</script>
<style lang="less"></style>
