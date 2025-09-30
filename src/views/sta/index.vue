<template>
  <div class="sta-container">
    <ElCard body-style="display: flex; gap: 10px; justify-content: space-between;">
      <template #header>
        <span>总票数：{{ totalTickets }}</span>
        <span style="margin-left: 30px;">当前注册人数：{{ userCountNum }}</span>
      </template>
      <ElCard style="width: 45%">
        <template #header>
          <span>已售票数</span>
        </template>
        <span>{{ soldTickets }}</span>
      </ElCard>
      <ElCard style="width: 45%">
        <template #header>
          <span>剩余票数</span>
        </template>
        <span>{{ remainingTickets }}</span>
      </ElCard>

    </ElCard>

    <!-- // 超出自动换行 -->
    <ElCard body-style="display: flex; flex-wrap: wrap; gap: 10px;">
      <template #header>
        <span>购票详情</span>
      </template>
      <ElCard v-for="sku in saleSkuList" :key="sku.id" style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>{{ sku.area }}</span>
        </template>
        <div class="sta-item">
          <span>已售票数：{{ sku.totalTicket - sku.stockTicket }}</span>
          <span>剩余票数：{{ sku.stockTicket }}</span>
        </div>
      </ElCard>
    </ElCard>

        <ElCard body-style="display: flex; flex-wrap: wrap; gap: 10px;">
      <template #header>
        <span>赠票详情</span>
      </template>
      <ElCard v-for="sku in giftSkuList" :key="sku.id" style="width: 24%; flex-shrink: 0;">
        <template #header>
          <span>{{ sku.area }}</span>
        </template>
        <div class="sta-item">
          <span>已售票数：{{ sku.totalTicket - sku.stockTicket }}</span>
          <span>剩余票数：{{ sku.stockTicket }}</span>
        </div>
      </ElCard>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElCard } from 'element-plus'
import { getActivityInfoAPI } from '@/service/index'
import type { SkuInfo } from '@/types/index'

const route = useRoute()
const matchId = ref<string | number>('')

// 数据状态
const totalTickets = ref<number>(0)
const soldTickets = ref<number>(0)
const remainingTickets = ref<number>(0)
const saleSkuList = ref<SkuInfo[]>([])
const giftSkuList = ref<SkuInfo[]>([])
const userCountNum = ref<number>(0)

// 计时器
let timer: NodeJS.Timeout | null = null

// 获取数据的函数
const fetchData = async () => {
  try {
    const { data: { skuList = [], ticket, venue, userCount } = {} } = await getActivityInfoAPI(Number(matchId.value))
    console.log('当前赛事ID:', matchId.value)

    // 分离购票和赠票数据
    saleSkuList.value = skuList.filter(sku => sku.skuType === 'SALE_TICKET')
    giftSkuList.value = skuList.filter(sku => sku.skuType === 'GIFT_TICKET')

    // 计算总票数、已售票数、剩余票数
    totalTickets.value = skuList.reduce((total, sku) => total + sku.totalTicket, 0)
    soldTickets.value = skuList.reduce((total, sku) => total + (sku.totalTicket - sku.stockTicket), 0)
    remainingTickets.value = skuList.reduce((total, sku) => total + sku.stockTicket, 0)

    userCountNum.value = userCount as number
    console.log('统计数据更新:', {
      totalTickets: totalTickets.value,
      soldTickets: soldTickets.value,
      remainingTickets: remainingTickets.value,
      saleSkuList: saleSkuList.value,
      giftSkuList: giftSkuList.value
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 启动计时器
const startTimer = () => {
  timer = setInterval(() => {
    fetchData()
  }, 10000) // 每10秒更新一次
}

// 停止计时器
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(async () => {
  // 获取路由传递的 matchId
  matchId.value = route.query.matchId

  // 立即获取一次数据
  await fetchData()

  // 启动定时器
  startTimer()
})

onUnmounted(() => {
  // 组件卸载时清除计时器
  stopTimer()
})
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
