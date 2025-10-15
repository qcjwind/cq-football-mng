<template>
  <div class="c-tit">
    <span>赛事管理</span>
    <div class="c-tit-bts">
      <el-button @click="addActivity" type="primary">新增</el-button>
    </div>
  </div>
  <div class="c-body" v-loading="tabLoading">
    <el-table style="width: 100%" :data="table" stripe>
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="name" label="赛事名称" align="center"></el-table-column>
      <el-table-column label="赛事封面" align="center">
        <template #default="scope">
          <img :src="scope.row.cover" alt="赛事封面" style="height: 50px" />
        </template>
      </el-table-column>
      <el-table-column label="赠票二维码" align="center">
        <template #default="scope">
          <span v-if="!scope.row.giftTicketUrl">正在生成中...</span>
          <a style="color: #409eff" v-else :href="scope.row.giftTicketUrl" target="_blank">下载</a>
        </template>
      </el-table-column>
      <el-table-column prop="startSaleTime" label="开始售票时间" align="center"></el-table-column>
      <el-table-column prop="startTime" label="赛事开始时间" align="center"></el-table-column>
      <el-table-column prop="endTime" label="赛事结束时间" align="center"></el-table-column>

      <el-table-column prop="type" label="赛事状态" align="center">
        <template #default="scope">
          <div class="flexf-c-c">
            <span style="font-size: 14px; margin-right: 5px">{{
              ActivityStatus[scope.row.status as ActivityStatusEnum]
            }}</span>
            <ElButton
              v-if="scope.row.status === 'DISABLE'"
              type="primary"
              @click="updateActivityStatus(scope.row.id, 'ENABLE')"
              size="small"
              >上架</ElButton
            >
            <ElButton
              v-if="scope.row.status === 'ENABLE'"
              type="warning"
              @click="updateActivityStatus(scope.row.id, 'DISABLE')"
              size="small"
              >下架</ElButton
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="票务信息" align="center">
        <template #default="scope">
          <ElButton type="primary" @click="openTicketInfo(scope.row.id)" text size="small"
            >查看</ElButton
          >
        </template>
      </el-table-column>
      <el-table-column label="售票数据" align="center">
        <template #default="scope">
          <ElButton type="primary" @click="exportTicket(scope.row.id)" text size="small"
            >导出</ElButton
          >
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="150">
        <template #default="scope">
          <div class="act-btns">
            <ElPopconfirm
              title="你确定要删除这条数据吗？"
              @confirm="deleteActivity(scope.$index, scope.row.id)"
            >
              <template #reference>
                <ElButton type="danger" :loading="scope.row.delLoading" text size="small"
                  >删除</ElButton
                >
              </template>
            </ElPopconfirm>
            <ElButton
              type="success"
              :loading="scope.row.editLoading"
              @click="editActivity(scope.row)"
              text
              size="small"
              >修改</ElButton
            >
            <ElButton type="primary" @click="goToStatistics(scope.row.id)" text size="small"
              >数据</ElButton
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      layout="prev, pager, next"
      :page-size="page.pageSize"
      :current-page="page.pageNumber"
      @current-change="pageChange"
      :total="page.total"
    ></el-pagination>
  </div>

  <AddActivity
    v-model="dialogActivity"
    :activity-info="activityInfo"
    @add-success="addSuccess"
  ></AddActivity>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElPagination,
  ElPopconfirm,
  ElMessage,
} from 'element-plus'
import AddActivity from './components/AddActivity.vue'
import {
  getActivityListAPI,
  deleteActivityAPI,
  updateActivityStatusAPI,
  getMatchInfoAPI,
} from '@/service/index'
import { ActivityStatus, BASE_URL } from '@/utils/constant'
import type { ActivityInfo, Pageing, ActivityStatusEnum } from '@/types/index'
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const table = ref<ActivityInfo[]>([])
const dialogActivity = ref<boolean>(false)
const tabLoading = ref<boolean>(false)
const activityInfo = ref<Partial<ActivityInfo>>({})
const page = reactive<Pageing>({
  pageNumber: 1,
  pageSize: 10,
})

const addActivity = () => {
  activityInfo.value = {}
  dialogActivity.value = true
}

const addSuccess = () => {
  getActivityList()
}

const deleteActivity = (index: number, id: number) => {
  table.value[index].delLoading = true
  deleteActivityAPI(id)
    .then(() => {
      ElMessage.success('删除成功')
      getActivityList()
    })
    .finally(() => {
      table.value[index].delLoading = false
    })
}

const openTicketInfo = (matchId: number) => {
  router.push({
    path: '/home/ticketInfo',
    query: {
      matchId: matchId,
    },
  })
}

const downloadTemplate = () => {
  window.open(
    `${BASE_URL}mng/sku/uploadBatchDemo?token=${encodeURIComponent(userStore.user?.token || '')}`,
    '_blank',
  )
}

const exportTicket = (matchId: number) => {
  window.open(
    `${BASE_URL}mng/ticket/export?token=${encodeURIComponent(userStore.user?.token || '')}&matchId=${matchId}`,
    '_blank',
  )
}

const updateActivityStatus = (id: number, status: string) => {
  updateActivityStatusAPI(id, status).then(() => {
    ElMessage.success('操作成功')
    getActivityList()
  })
}

const pageChange = (pageNum: number) => {
  page.pageNumber = pageNum
  getActivityList()
}

const editActivity = (item: ActivityInfo) => {
  item.editLoading = true
  getMatchInfoAPI(item.id)
    .then((res) => {
      activityInfo.value = { ...res.data.match }
      dialogActivity.value = true
    })
    .finally(() => {
      item.editLoading = false
    })
}

const goToStatistics = (matchId: number) => {
  router.push({
    path: '/sta',
    query: {
      matchId: matchId,
    },
  })
}

const getActivityList = () => {
  const param = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
  }
  tabLoading.value = true
  getActivityListAPI(param)
    .then((res) => {
      page.total = res.total
      const list = res.data?.map((item) => ({ ...item, delLoading: false }))
      table.value = list
    })
    .finally(() => {
      tabLoading.value = false
    })
}

onMounted(() => {
  getActivityList()
})
</script>

<style lang="less">
.act-btns {
  .el-button {
    padding: 0 5px;
    margin-left: 0;
  }
}
.c-body {
  width: 100%;
}
</style>
