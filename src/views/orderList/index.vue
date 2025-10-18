<template>
  <div class="order-list">
    <div class="search-form">
      <el-form :model="searchForm" inline label-position="right" label-width="120px">
        <el-form-item label="赛事：">
          <el-select
            style="width: 260px"
            v-model="searchForm.matchId"
            placeholder="请选择赛事"
            clearable
          >
            <el-option
              v-for="match in matchList"
              :key="match.id"
              :label="match.name"
              :value="match.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单开始时间：">
          <el-date-picker
            style="width: 240px"
            v-model="searchForm.beginTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>
        <el-form-item label="下单结束时间：">
          <el-date-picker
            style="width: 240px"
            v-model="searchForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>

        <el-form-item label="订单编号：">
          <el-input
            style="width: 260px"
            v-model="searchForm.orderNo"
            placeholder="请输入订单编号"
            clearable
          />
        </el-form-item>
        <el-form-item label="订单状态：">
          <el-select
            style="width: 240px"
            v-model="searchForm.orderStatus"
            placeholder="请选择订单状态"
            clearable
          >
            <el-option label="待支付" value="WAIT_PAY" />
            <el-option label="已取消" value="CANCEL" />
            <el-option label="支付成功" value="PAY_SUCCESS" />
            <el-option label="退款中" value="REFUND_ING" />
            <el-option label="退款成功" value="REFUND_SUCCESS" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table style="width: 100%" :data="orderList" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="name" label="购买人姓名" width="120">
          <template #default="{ row }">{{
            row.orderInfo?.map((item: any) => item.name).join(',')
          }}</template>
        </el-table-column>
        <el-table-column prop="buyNum" label="购买数量" width="100" />
        <el-table-column prop="totalPrice" label="总价" width="100">
          <template #default="{ row }"> ¥{{ (row.totalPrice / 100).toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)">
              {{ getOrderStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="180">
          <template #default="{ row }">
            {{ row.payTime ? formatDateTime(row.payTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="refundTime" label="退款时间" width="180">
          <template #default="{ row }">
            {{ row.refundTime ? formatDateTime(row.refundTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="refundPrice" label="退款金额" width="120">
          <template #default="{ row }">
            {{ row.refundPrice ? `¥${(row.refundPrice / 100).toFixed(2)}` : '-' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column> -->
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNumber"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { orderListAPI, matchListAPI, getActivityListAPI } from '@/service/index'
import type { OrderInfo, OrderListParams, OrderStatusEnum, ActivityInfo } from '@/types/index'
import { BASE_URL } from '@/utils/constant'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
// 搜索表单
const searchForm = reactive<Partial<OrderListParams>>({
  beginTime: '',
  endTime: '',
  matchId: undefined,
  name: '',
  orderNo: '',
  orderStatus: undefined,
})

// 分页信息
const pagination = reactive({
  pageNumber: 1,
  pageSize: 20,
  total: 0,
})

// 数据
const orderList = ref<OrderInfo[]>([])
const matchList = ref<ActivityInfo[]>([])
const loading = ref(false)

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const params: OrderListParams = {
      ...searchForm,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    }

    // 去除params中空值
    Object.keys(params).forEach((key) => {
      if (!params[key as keyof OrderListParams]) {
        delete params[key as keyof OrderListParams]
      }
    })
    const response = await orderListAPI(params)
    response.data?.forEach((item) => {
      item.orderInfo = JSON.parse(item.orderInfo)
    })
    orderList.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取赛程列表
const getMatchList = async () => {
  try {
    const response = await getActivityListAPI({ pageNumber: 1, pageSize: 1000 })
    matchList.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('获取赛程列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNumber = 1
  getOrderList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    beginTime: '',
    endTime: '',
    matchId: undefined,
    name: '',
    orderNo: '',
    orderStatus: undefined,
  })
  pagination.pageNumber = 1
  getOrderList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNumber = 1
  getOrderList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.pageNumber = page
  getOrderList()
}


// 获取订单状态类型
const getOrderStatusType = (status: OrderStatusEnum) => {
  const statusMap = {
    WAIT_PAY: 'warning',
    CANCEL: 'info',
    PAY_SUCCESS: 'success',
    REFUND_ING: 'warning',
    REFUND_SUCCESS: 'info',
  }
  return statusMap[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status: OrderStatusEnum) => {
  const statusMap = {
    WAIT_PAY: '待支付',
    CANCEL: '已取消',
    PAY_SUCCESS: '支付成功',
    REFUND_ING: '退款中',
    REFUND_SUCCESS: '退款成功',
  }
  return statusMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  getMatchList()
  getOrderList()
})
</script>

<style scoped lang="less">
.order-list {
  width: 100%;
  overflow: hidden;
  padding: 20px;
}

.search-form {
  width: 100%;
  overflow: hidden;
}

.table-container {
  width: 100%;
  padding-top: 20px;
  overflow: hidden;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
