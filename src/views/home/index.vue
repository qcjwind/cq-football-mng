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
              >开启</ElButton
            >
            <ElButton
              v-if="scope.row.status === 'ENABLE'"
              type="warning"
              @click="updateActivityStatus(scope.row.id, 'DISABLE')"
              size="small"
              >关闭</ElButton
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="赛事详情" align="center">
        <template #default="scope">
          <ElButton type="success" @click="openActivityUser(scope.row)" text size="small"
            >查看</ElButton
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
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
            <ElButton type="success" @click="editActivity(scope.row)" text size="small"
              >修改</ElButton
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
import { getActivityListAPI, deleteActivityAPI, updateActivityStatusAPI } from '@/service/index'
import { ActivityType, ActivityStatus } from '@/utils/constant'
import { useActivityInfoStore } from '@/stores/index'
import type { ActivityInfo, Pageing, ActivityEnum, ActivityStatusEnum } from '@/types/index'

const router = useRouter()
const activityInfoStore = useActivityInfoStore()
const table = ref<ActivityInfo[]>([])
const dialogActivity = ref<boolean>(false)
const tabLoading = ref<boolean>(false)
const activityInfo = ref<Partial<ActivityInfo>>({})
const page = reactive<Pageing>({
  pageNumber: 1,
  pageSize: 10,
})

const jumpDarge = (item: ActivityInfo) => {
  activityInfoStore.setActivityInfo(item)
  const routerData = router.resolve({
    path: '/screen',
    query: { activityId: item.id },
  })
  window.open(routerData.href, '_blank')
}

const addActivity = () => {
  activityInfo.value = {}
  dialogActivity.value = true
}

const addSuccess = () => {
  getActivityList()
}

const openDevices = (id: number) => {
  router.push({ path: '/devices', query: { id } })
}

const openActivityUser = (item: ActivityInfo) => {
  activityInfoStore.setActivityInfo(item)
  router.push({ path: '/user', query: { id: item.id } })
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
  activityInfo.value = { ...item }
  dialogActivity.value = true
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
</style>
