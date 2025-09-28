<template>
  <el-dialog style="width: 800px" v-model="dialogActivity" title="新增场馆" @close="clearForm">
    <el-form ref="venueRef" :model="venue" :rules="rules" label-width="150" label-position="left">
      <el-form-item label="场馆名称：" prop="name">
        <el-input v-model="venue.name" placeholder="请输入场馆名称"></el-input>
      </el-form-item>
      <el-form-item label="省市区：" prop="codeArr">
        <el-cascader
          style="width: 100%"
          :options="generateProvinceCityAreaData()"
          v-model="venue.codeArr"
          placeholder="请选择省市区"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="赛事地址：" prop="venueAddress">
        <el-input v-model="venue.venueAddress" placeholder="请输入场馆地址"></el-input>
      </el-form-item>
      <el-form-item label="地图标点" prop="venueLat">
        <div>
          <ElButton @click="setVenueRange('point')">设置</ElButton>
          <span v-if="venue?.venueLat">{{ venue?.venueLat }},{{ venue?.venueLng }}</span>
        </div>
      </el-form-item>
    </el-form>

    <div class="frm-btns">
      <ElButton @click="clearForm">取消</ElButton>
      <ElButton @click="submit" :loading="subLoading" type="primary">保存</ElButton>
    </div>
  </el-dialog>
  <MapActivity
    v-model="dialogMap"
    v-model:point-info="markerCenter"
    type="point"
    :marker-center="markerCenter"
    @point-callback="mapCallbck"
  ></MapActivity>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElCascader,
  ElInput,
  ElButton,
  ElMessage,
} from 'element-plus'
import { editVenueAPI, addVenueAPI } from '@/service/index'
import type { LatLng, VenueInfo } from '@/types/index'
import type { FormInstance, FormRules } from 'element-plus'
import { generateProvinceCityAreaData } from '@/utils/util'
import MapActivity from '@/components/MapActivity.vue'

interface IProps {
  venueInfo: Partial<VenueInfo>
}

const dialogMap = ref<boolean>(false)
const dialogActivity = defineModel({ default: false })
const props = defineProps<IProps>()
const emit = defineEmits(['addSuccess'])
const venueRef = ref<FormInstance>()
const venue = ref<Partial<VenueInfo>>({})
const dateRanage = ref()
const subLoading = ref<boolean>(false)
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入活动名称' }],
  codeArr: [{ required: true, message: '请选择省市区', trigger: 'change' }],
  venueAddress: [{ required: true, message: '请输入场馆地址', trigger: 'change' }],
  venueLat: [{ required: true, message: '请标记场馆位置', trigger: 'change' }],
})
const markerCenter = ref<LatLng | null>(null)

watch(
  () => props.venueInfo,
  (newInfo) => {
    if (newInfo.id) {
      markerCenter.value = { lng: newInfo.venueLng as number, lat: newInfo.venueLat as number }
      venue.value = {
        ...newInfo,
        codeArr: [
          newInfo.provinceCode as string,
          newInfo.cityCode as string,
          newInfo.areaCode as string,
        ],
      }
    }
  },
)

const setVenueRange = () => {
  dialogMap.value = true
  markerCenter.value = { lng: venue.value.venueLng as number, lat: venue.value.venueLat as number }
}

const clearForm = () => {
  dialogActivity.value = false
  dateRanage.value = []
  venueRef.value?.resetFields()
  venue.value = {}
  markerCenter.value = null
}

const mapCallbck = (res: LatLng) => {
  if (res) {
    markerCenter.value = {
      lat: res.lat,
      lng: res.lng,
    }
    venue.value.venueLat = res.lat
    venue.value.venueLng = res.lng
    venueRef.value?.validate()
  }
}

const submit = () => {
  venueRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    subLoading.value = true
    const sku = [
      { skuName: 'A区', area: 'A区', price: 0, totalTicket: 542 },
      { skuName: 'B区', area: 'B区', price: 0, totalTicket: 541 },
      { skuName: 'C区', area: 'C区', price: 0, totalTicket: 624 },
      { skuName: 'E区', area: 'E区', price: 0, totalTicket: 1239 },
      { skuName: 'F区', area: 'F区', price: 0, totalTicket: 1416 },
      { skuName: 'G区', area: 'G区', price: 0, totalTicket: 1995 },
    ]

    const giftSku = [
      { skuName: 'A区', area: 'A区', price: 0, totalTicket: 567 },
      { skuName: 'B区', area: 'B区', price: 0, totalTicket: 567 },
      { skuName: 'C区', area: 'C区', price: 0, totalTicket: 386 },
      { skuName: 'D区', area: 'D区', price: 0, totalTicket: 2538 },
      { skuName: 'E区', area: 'E区', price: 0, totalTicket: 381 },
      { skuName: 'F区', area: 'F区', price: 0, totalTicket: 156 },
      { skuName: 'G区', area: 'G区', price: 0, totalTicket: 570 },
    ]
    const params = {
      ...toRaw(venue.value),
      provinceCode: venue.value.codeArr?.[0] || '',
      cityCode: venue.value.codeArr?.[1] || '',
      areaCode: venue.value.codeArr?.[2] || '',
      saleSkuInfo: JSON.stringify(sku),
      giftSkuInfo: JSON.stringify(giftSku),
    }
    delete params.codeArr
    if (venue.value.id) {
      params.id = venue.value.id
      editVenueAPI(params)
        .then(() => {
          ElMessage.success('修改成功')
          clearForm()
          emit('addSuccess')
        })
        .finally(() => {
          subLoading.value = false
        })
      return
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    addVenueAPI(params)
      .then(() => {
        ElMessage.success('添加成功')
        clearForm()
        emit('addSuccess')
      })
      .finally(() => {
        subLoading.value = false
      })
  })
}
</script>

<style></style>
