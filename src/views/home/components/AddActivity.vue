<template>
  <el-dialog v-model="dialogActivity" title="新增活动" @close="clearForm">
    <el-form
      ref="activityRef"
      :model="activity"
      :rules="rules"
      label-width="150"
      label-position="left"
    >
      <el-form-item label="活动名称：" prop="name">
        <el-input v-model="activity.name" placeholder="请输入活动名称"></el-input>
      </el-form-item>
      <el-form-item label="活动类型：" prop="type">
        <ElRadioGroup v-model="activity.type">
          <ElRadio v-for="item in Object.entries(ActivityType)" :key="item[0]" :value="item[0]">{{
            item[1]
          }}</ElRadio>
        </ElRadioGroup>
      </el-form-item>
      <el-form-item label="活动时间：" prop="startTime">
        <ElDatePicker
          v-model="dateRanage"
          @change="dateChange"
          type="datetimerange"
          start-placeholder="请选择活动开始时间"
          end-placeholder="请选择活动结束时间"
          format="YYYY-MM-DD HH:mm:ss"
        ></ElDatePicker>
      </el-form-item>
      <el-form-item label="活动范围：" prop="mapInfo">
        <div>
          <ElButton @click="setActivityRange('range')">设置</ElButton>
          <span>{{ activity.mapInfo?.center }}</span>
        </div>
      </el-form-item>
      <el-form-item label="活动出发点：" prop="mapInfo">
        <div>
          <ElButton :disabled="!activity.mapInfo?.center?.lng" @click="setActivityRange('point')"
            >设置</ElButton
          >
          <span v-if="activity?.startPointLat"
            >{{ activity?.startPointLat }},{{ activity?.startPointLng }}</span
          >
        </div>
      </el-form-item>
      <el-form-item label="&nbsp;&nbsp;活动详情：" prop="detail">
        <el-input v-model="activity.detail" type="textarea" placeholder="请输入活动详情"></el-input>
      </el-form-item>
    </el-form>

    <div class="frm-btns">
      <ElButton @click="clearForm">取消</ElButton>
      <ElButton @click="submit" :loading="subLoading" type="primary">保存</ElButton>
    </div>
  </el-dialog>
  <MapActivity
    v-model="dialogMap"
    v-model:map-info="activity.mapInfo"
    :ract="ract"
    :type="mapType"
    :marker-center="markerCenter"
    @point-callback="mapCallbck"
  ></MapActivity>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElButton,
  ElMessage,
  ElRadioGroup,
  ElRadio,
} from 'element-plus'
import MapActivity from '@/components/MapActivity.vue'
import dayjs from 'dayjs'
import { addActivityAPI, editActivityAPI } from '@/service/index'
import { ActivityType } from '@/utils/constant'
import type { ActivityInfo, LatLng } from '@/types/index'
import type { FormInstance, FormRules } from 'element-plus'

interface IProps {
  activityInfo: Partial<ActivityInfo>
}

// interface B {
//   b1: number;
//   b2: number;
// }

// interface A extends B {
//   a1: string;
//   a2: string;
// }

// type keys = Pick<B, 'b1'>
// const str: keys = ''

const dialogActivity = defineModel({ default: false })
const props = defineProps<IProps>()
const emit = defineEmits(['addSuccess'])
const activityRef = ref<FormInstance>()
const activity = ref<Partial<ActivityInfo>>({ type: 'SINGLE' })
const dateRanage = ref()
const dialogMap = ref<boolean>(false)
const subLoading = ref<boolean>(false)
const mapType = ref<'point' | 'range'>('range')
const markerCenter = ref<LatLng | null>(null)
const ract = ref<ActivityInfo['mapInfo']>()
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入活动名称' }],
  type: [{ required: true, message: '请选择活动类型' }],
  startTime: [{ required: true, message: '请选择活动时间范围', trigger: 'change' }],
  mapInfo: [{ required: true, message: '请设置活动范围', trigger: 'change' }],
})

const mapCallbck = (res: LatLng) => {
  if (res) {
    activity.value.startPointLat = res.lat
    activity.value.startPointLng = res.lng
    activityRef.value?.validate()
  }
}

watch(
  () => props.activityInfo,
  (newInfo) => {
    if (newInfo.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const mapInfo = JSON.parse(newInfo.mapInfo || '{}')
      activity.value = { ...newInfo, mapInfo }
      dateRanage.value = [newInfo.startTime, newInfo.endTime]
    } else {
      activity.value = { type: 'SINGLE' }
    }
  },
)

const dateChange = () => {
  activity.value.startTime = dayjs(dateRanage.value[0]).format('YYYY-MM-DD HH:mm:ss')
  activity.value.endTime = dayjs(dateRanage.value[1]).format('YYYY-MM-DD HH:mm:ss')
}

const setActivityRange = (type: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mapType.value = type
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ract.value = { ...activity.value?.mapInfo }
  if (type === 'point') {
    markerCenter.value = {
      lng: activity.value?.startPointLng as number,
      lat: activity.value?.startPointLat as number,
    }
  }

  dialogMap.value = true
}

const clearForm = () => {
  dialogActivity.value = false
  dateRanage.value = []
  activityRef.value?.resetFields()
  activity.value = { type: 'SINGLE' }
}

const submit = () => {
  activityRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    subLoading.value = true
    const params = {
      name: activity.value.name,
      detail: activity.value.detail,
      startTime: activity.value.startTime,
      endTime: activity.value.endTime,
      mapInfo: JSON.stringify(activity.value.mapInfo),
      startPointLng: activity.value.startPointLng,
      startPointLat: activity.value.startPointLat,
      type: activity.value.type,
    }
    if (activity.value.id) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      params.id = activity.value.id
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      editActivityAPI(params)
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
    addActivityAPI(params)
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
