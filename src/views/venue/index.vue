<template>
  <div class="c-tit">
    <span>场馆列表</span>
    <div class="c-tit-bts">
      <el-button @click="addVenue" type="primary">新增</el-button>
    </div>
  </div>
  <div class="c-body" v-loading="tabLoading">
    <el-table style="width: 100%" :data="table" stripe>
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="name" label="场馆名称" align="center"></el-table-column>
      <el-table-column label="省市区" align="center">
        <template #default="scope">
          <span>{{
            getRegionNamesByCodes([scope.row.provinceCode, scope.row.cityCode, scope.row.areaCode])
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="venueAddress" label="场馆地址" align="center"></el-table-column>
      <el-table-column label="经纬度" align="center">
        <template #default="scope">
          <span>{{ scope.row.venueLat }},{{ scope.row.venueLng }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="scope">
          <div class="act-btns">
            <ElButton type="success" @click="editVenue(scope.row)" text size="small">修改</ElButton>
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

  <AddVenue :venue-info="venueInfo" v-model="dialogActivity" @add-success="addSuccess"></AddVenue>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElTable, ElTableColumn, ElButton, ElPagination } from 'element-plus'
import AddVenue from '@/components/AddVenue.vue'
import type { Pageing, VenueInfo } from '@/types/index'
import { getRegionNamesByCodes } from '@/utils/util'
import { useVenueStore } from '@/stores/venue'

const table = ref<VenueInfo[]>([])
const dialogActivity = ref<boolean>(false)
const tabLoading = ref<boolean>(false)
const venueInfo = ref<Partial<VenueInfo>>({})
const venueStore = useVenueStore()
const page = reactive<Pageing>({
  pageNumber: 1,
  pageSize: 10,
})

const addVenue = () => {
  venueInfo.value = {}
  dialogActivity.value = true
}

const addSuccess = () => {
  getVenueList()
}

const pageChange = (pageNum: number) => {
  page.pageNumber = pageNum
  getVenueList()
}

const editVenue = (item: VenueInfo) => {
  venueInfo.value = { ...item }
  dialogActivity.value = true
}

const getVenueList = async () => {
  const param = {
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
  }
  tabLoading.value = true
  try {
    const { venueList, total } = await venueStore.getVenueList(param)
    page.total = total
    table.value = venueList
    tabLoading.value = false
  } catch {
    tabLoading.value = false
  }
}

onMounted(() => {
  getVenueList()
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
