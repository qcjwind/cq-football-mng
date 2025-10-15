<template>
  <div class="c-tit">
    <span>票务信息</span>
    <div class="c-tit-bts">
      <el-button @click="downloadTemplate" style="margin-right: 20px" type="text"
        >下载模版</el-button
      >
      <el-upload
        :http-request="uploadOss"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <el-button @click="uploadTicket" type="primary" :loading="uploadLoading"
          >上传票务</el-button
        >
      </el-upload>
    </div>
  </div>
  <div class="c-body" v-loading="tabLoading">
    <el-table style="width: 100%" :data="table" stripe>
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="skuName" label="SKU名称" align="center"></el-table-column>
      <el-table-column prop="area" label="大区" align="center"></el-table-column>
      <el-table-column prop="skuType" label="票类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.skuType === 'SALE_TICKET' ? '售票' : '赠票' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalTicket" label="总票数" align="center"></el-table-column>
      <el-table-column prop="stockTicket" label="余票" align="center"></el-table-column>
      <el-table-column prop="price" label="票价（元）" align="center">
        <template #default="scope">
          <span>{{ scope.row.price / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="skuStatus" label="状态" align="center">
        <template #default="scope">
          <div class="flexf-c-c">
            <span style="margin-right: 10px">{{
              scope.row.skuStatus === 'ENABLE' ? '上架' : '下架'
            }}</span>
            <ElButton
              v-if="scope.row.skuStatus === 'DISABLE'"
              type="primary"
              @click="updateActivityStatus(scope.row.id, 'ENABLE')"
              size="small"
              >上架</ElButton
            >
            <ElButton
              v-if="scope.row.skuStatus === 'ENABLE'"
              type="warning"
              @click="updateActivityStatus(scope.row.id, 'DISABLE')"
              size="small"
              >下架</ElButton
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="220">
        <template #default="scope">
          <div class="flexf-c-c">
            <el-button type="primary" @click="editTicket(scope.row)" text size="small"
              >修改</el-button
            >
            <el-upload
              :http-request="uploadSku"
              :show-file-list="false"
              :data="{ skuId: scope.row.id, index: scope.$index }"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button type="warning" :loading="scope.row.uploadLoading" text size="small">追加座位</el-button>
            </el-upload>
            <ElPopconfirm title="你确定要删除这条数据吗？" @confirm="deleteTicketSku(scope.row.id)">
              <template #reference>
                <ElButton type="danger" :loading="scope.row.delLoading" text size="small"
                  >删除</ElButton
                >
              </template>
            </ElPopconfirm>
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

    <EditSku v-model="editSku" :skuData="skuData" @success="getSkuList" />
  </div>
</template>

<script setup lang="ts">
import { BASE_URL } from '@/utils/constant'
import { useUserStore } from '@/stores/index'
import { reactive, ref, onMounted } from 'vue'
import type { Pageing, SkuInfo } from '@/types'
import { deleteSkuAPI, getMatchSkuLitAPI, updateSkuStatusAPI, uploadBatchAPI, uploadSeatsAPI } from '@/service'
import { useRoute } from 'vue-router'
import { ElMessage, type UploadRequestOptions } from 'element-plus'
import EditSku from './components/EditSku.vue'

const route = useRoute()
const userStore = useUserStore()
const tabLoading = ref(false)
const table = ref<SkuInfo[]>([])
const editSku = ref(false)
const skuData = ref<SkuInfo | null>(null)
const uploadLoading = ref(false)
const page = reactive<Pageing>({
  pageNumber: 1,
  pageSize: 50,
})

const getSkuList = () => {
  const param = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    matchId: route.query.matchId as number,
  }
  getMatchSkuLitAPI(param).then((res) => {
    table.value = res.data
    page.total = res.total
  })
}

const editTicket = (row: SkuInfo) => {
  skuData.value = { ...row }
  editSku.value = true
}

const pageChange = (pageNum: number) => {
  page.pageNumber = pageNum
}
const downloadTemplate = () => {
  window.open(
    `${BASE_URL}mng/sku/uploadBatchDemo?token=${encodeURIComponent(userStore.user?.token || '')}`,
    '_blank',
  )
}

const updateActivityStatus = (id: number, status: string) => {
  updateSkuStatusAPI(id, status).then(() => {
    ElMessage.success('操作成功')
    getSkuList()
  })
}

const deleteTicketSku = (id: number) => {
  deleteSkuAPI(id).then(() => {
    ElMessage.success('操作成功')
    getSkuList()
  })
}

const uploadSku = (option: UploadRequestOptions | { file: File }) => {
  uploadLoading.value = true
  return new Promise((resolve, reject) => {
    table.value[option?.data?.index as number].uploadLoading = true
    const formData = new FormData()
    formData.append('file', option.file)
    formData.append('skuId', option?.data?.skuId as string)
    uploadSeatsAPI(formData)
      .then(() => {
        resolve(true)
      })
      .catch((err) => {
        reject(err)
      })
      .finally(() => {
        uploadLoading.value = false
        table.value[option?.data?.index as number].uploadLoading = false
      })
  })
}

const uploadOss = (option: UploadRequestOptions | { file: File }) => {
  uploadLoading.value = true
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', option.file)
    formData.append('matchId', route.query?.matchId as number)
    uploadBatchAPI(formData)
      .then(() => {
        resolve(true)
      })
      .catch((err) => {
        reject(err)
      })
      .finally(() => {
        uploadLoading.value = false
      })
  })
}

const handleAvatarSuccess = () => {
  getSkuList()
}

const beforeAvatarUpload = (file: File) => {
  console.log(file)
  return true
}

const uploadTicket = () => {
  console.log('uploadTicket')
}

onMounted(() => {
  getSkuList()
})
</script>

<style scoped lang="less">
.c-body {
  width: 100%;
}
</style>
