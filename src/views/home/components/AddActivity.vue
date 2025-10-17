<template>
  <el-drawer
    size="900px"
    class="activity-mode"
    v-model="dialogActivity"
    title="新增活动"
    @close="clearForm"
  >
    <el-form
      ref="activityRef"
      :model="activity"
      :rules="rules"
      label-width="150"
      label-position="left"
    >
      <el-form-item label="赛事名称：" prop="name">
        <el-input v-model="activity.name" placeholder="请输入赛事名称"></el-input>
      </el-form-item>
      <el-form-item label="赛事封面：" prop="cover">
        <el-upload
          class="avatar-uploader"
          :http-request="uploadOss"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="activity.cover" :src="activity.cover" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="售票开始时间：" prop="startSaleTime">
        <ElDatePicker
          style="width: 100%"
          v-model="activity.startSaleTime"
          type="datetime"
          placeholder="请选择开始售票时间"
          format="YYYY-MM-DD HH:mm:ss"
        ></ElDatePicker>
      </el-form-item>
      <el-form-item label="售票结束时间：" prop="endSaleTime">
        <ElDatePicker
          style="width: 100%"
          v-model="activity.endSaleTime"
          type="datetime"
          placeholder="请选择售票结束时间"
          format="YYYY-MM-DD HH:mm:ss"
        ></ElDatePicker>
      </el-form-item>
      <el-form-item label="赛事时间：" prop="startTime">
        <ElDatePicker
          v-model="dateRanage"
          @change="dateChange"
          type="datetimerange"
          start-placeholder="请选择赛事开始时间"
          end-placeholder="请选择赛事结束时间"
          format="YYYY-MM-DD HH:mm:ss"
        ></ElDatePicker>
      </el-form-item>
      <el-form-item label="赛事场馆：" prop="venueId">
        <el-select v-model="activity.venueId" placeholder="请选择赛事场馆">
          <el-option
            v-for="item in venueStore.venueAll"
            :key="item.id"
            :label="item.name"
            :value="item.id as number"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="购票协议：">
        <el-tag
          @click="editAgreement(item)"
          v-for="(item, index) in agreement"
          :key="index"
          style="margin-right: 10px"
          closable
          @close="rmoveTag(index)"
          >{{ item.name }}</el-tag
        >
        <ElButton type="primary" @click="addAgreementTag" size="small">+ 添加协议</ElButton>
      </el-form-item>
      <el-form-item label="单人限购张数：">
        <el-input v-model="activity.buyLimit" placeholder="请输入单人限购张数，默认2张"></el-input>
      </el-form-item>
      <el-form-item label="票据展示信息：">
        <el-checkbox-group v-model="ticketInfoList">
          <el-checkbox v-for="item in ticketInfo" :key="item.value" :value="item.value">{{
            item.label
          }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="是否可退票：">
        <el-checkbox style="margin-right: 20px" v-model="activity.allowRefund" true-value="Y" false-value="N"></el-checkbox>
        <el-form-item v-if="activity.allowRefund === 'Y'" label="退款截止时间：" prop="endTime">
          <ElDatePicker
          v-model="endTime"
          type="datetime"
          placeholder="请选择退款截止时间"
          format="YYYY-MM-DD HH:mm:ss"
        ></ElDatePicker>
        </el-form-item>
      </el-form-item>
      <el-form-item v-if="activity.allowRefund === 'Y'" label="退票规则：">
        <div style="display: flex; align-items: center; flex-direction: column">
          <el-table :data="refundRules" border style="width: 700px; background: #fff">
            <el-table-column label="距离截止时间(小时)" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.minBeforeEndHour"
                  :min="0"
                  :max="999"
                  placeholder="请输入小时数"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="扣款比例(%)" width="200">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.refundRate"
                  :min="0"
                  :max="100"
                  placeholder="请输入扣款比例"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="描述" width="200">
              <template #default="{ row }">
                <el-input v-model="row.timeDesc" placeholder="请输入描述" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="removeRefundRule($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
            <template #empty>
              <span>若无规则，则默认按按全额退款</span>
            </template>
          </el-table>
          <el-button type="primary" size="small" @click="addRefundRule" style="margin-top: 10px">
            + 添加规则
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="闸机url：" prop="gateUrl">
        <el-input v-model="activity.gateUrl" placeholder="请输入闸机url："></el-input>
      </el-form-item>
      <el-form-item label="闸机token：" prop="gateToken">
        <el-input v-model="activity.gateToken" placeholder="请输入闸机token"></el-input>
      </el-form-item>
      <el-form-item label="赛事详情：" prop="detail">
        <AiEditor
          v-model="activity.detail"
          height="500px"
          placeholder="请输入赛事详情"
          ref="aiEditorRef"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="frm-btns">
        <ElButton @click="clearForm">取消</ElButton>
        <ElButton @click="submit" :loading="subLoading" type="primary">保存</ElButton>
      </div>
    </template>
  </el-drawer>

  <!-- 添加协议对话框 -->
  <AddAgreement
    v-model="dialogAgreement"
    :agreementData="agreementData"
    @success="handleAgreementSuccess"
  />
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue'
import {
  ElDrawer,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElInput,
  ElDatePicker,
  ElButton,
  ElMessage,
  ElUpload,
  ElIcon,
  ElTag,
  ElCheckboxGroup,
  ElCheckbox,
  ElTable,
  ElTableColumn,
  ElInputNumber,
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { addActivityAPI, editActivityAPI, uploadOssAPI } from '@/service/index'
import type { ActivityInfo, OssSts } from '@/types/index'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { useVenueStore } from '@/stores/venue'
import { v4 as uuidv4 } from 'uuid'
import AiEditor from '@/components/AiEditor.vue'
import AddAgreement from './AddAgreement.vue'

interface IProps {
  activityInfo: Partial<ActivityInfo>
}

const aiEditorRef = ref<InstanceType<typeof AiEditor>>()
const dialogActivity = defineModel({ default: false })
const props = defineProps<IProps>()
const emit = defineEmits(['addSuccess'])
const ticketInfo = ref<{ label: string; value: string }[]>([
  { label: '大区', value: 'area' },
  { label: '小区', value: 'subArea' },
  { label: '排', value: 'seatRow' },
  { label: '号', value: 'seatNo' },
])
const activityRef = ref<FormInstance>()
const activity = ref<Partial<ActivityInfo>>({})
const ticketInfoList = ref<string[]>(['area', 'subArea', 'seatRow', 'seatNo'])
const dateRanage = ref()
const subLoading = ref<boolean>(false)
const ossSts = ref<OssSts | null>(null)
const agreement = ref<{ name: string; text: string }[]>([])
const agreementData = ref<{ name: string; text: string } | null>(null)
const endTime = ref<string>('')
const dialogAgreement = ref(false)
const refundRules = ref<{ minBeforeEndHour: number; refundRate: number; timeDesc: string }[]>([])
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入赛事名称' }],
  cover: [{ required: true, message: '请上传赛事封面' }],
  endTime: [{ required: true, message: '请选择退款截止时间' }],
  startSaleTime: [{ required: true, message: '请选择开始售票时间' }],
  endSaleTime: [{ required: true, message: '请选择售票结束时间' }],
  startTime: [{ required: true, message: '请选择活动时间范围', trigger: 'change' }],
  venueId: [{ required: true, message: '请选择赛事场馆', trigger: 'change' }],
  detail: [{ required: true, message: '请输入赛事详情', trigger: 'change' }],
})
const venueStore = useVenueStore()

watch(
  () => props.activityInfo,
  (newInfo) => {
    if (newInfo.id) {
      dateRanage.value = [newInfo.startTime, newInfo.endTime]
      activity.value = { ...newInfo }
      aiEditorRef.value?.setContent(newInfo.detail || '')
      agreement.value = JSON.parse(newInfo.agreementInfo || '[]')
      const refundRule = JSON.parse(newInfo.refundRule || '{}')
      refundRules.value = refundRule.refundRules || []
      endTime.value = refundRule.endTime || ''
      const ticketShowInfo = JSON.parse(newInfo.ticketShowInfo || '[]')
      if (ticketShowInfo && ticketShowInfo.length > 0) {
        const arr: string[] = []
        ticketShowInfo.forEach((item: { [key: string]: boolean }) => {
          const [key, value] = Object.entries(item)[0] as [string, boolean]
          if (value) {
            arr.push(key)
          }
        })
        ticketInfoList.value = arr
      }
    }
  },
)

// 监听对话框打开状态
watch(
  () => dialogActivity.value,
  async (isOpen) => {
    if (isOpen) {
      venueStore.getVenueAllList()
    }
  },
  { immediate: true },
)

const beforeAvatarUpload = () => {}
const handleAvatarSuccess = (url: string) => {
  // imageUrl.value = url
  activity.value.cover = url
}

const editAgreement = (item: { name: string; text: string }) => {
  dialogAgreement.value = true
  agreementData.value = { ...item }
}

const rmoveTag = (index: number) => {
  if (index > -1 && index < agreement.value.length) {
    agreement.value.splice(index, 1)
  }
}

const addAgreementTag = () => {
  dialogAgreement.value = true
}

const handleAgreementSuccess = (data: { name: string; text: string }) => {
  if (data.name && data.text) {
    agreement.value.push({ ...data })
  }
}

const addRefundRule = () => {
  refundRules.value.push({ minBeforeEndHour: 24, refundRate: 10, timeDesc: '' })
}

const removeRefundRule = (index: number) => {
  if (refundRules.value.length > 0) {
    refundRules.value.splice(index, 1)
  }
}
const getFileName = (fileName: string) => {
  const arr = fileName?.split('.')
  return uuidv4() + '.' + arr[arr.length - 1]
}

const uoloadFormData = (file: File) => {
  const formData = new FormData()
  const key = ossSts.value?.dir + getFileName(file.name)
  formData.append('success_action_status', '200')
  formData.append('policy', ossSts.value?.policy || '')
  formData.append('x-oss-signature', ossSts.value?.signature || '')
  formData.append('x-oss-signature-version', ossSts.value?.version || '')
  formData.append('x-oss-credential', ossSts.value?.x_oss_credential || '')
  formData.append('x-oss-date', ossSts.value?.x_oss_date || '')
  formData.append('key', key)
  formData.append('x-oss-security-token', ossSts.value?.security_token || '')
  formData.append('file', file)

  return { formData, key }
}

const uploadOss = (option: UploadRequestOptions | { file: File }) => {
  return new Promise((resolve, reject) => {
    const { formData, key } = uoloadFormData(option.file)
    uploadOssAPI(ossSts.value?.host || '', formData)
      .then(() => {
        const url = `${ossSts.value?.host}/${key}`
        resolve(url)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
const dateChange = () => {
  activity.value.startTime = dayjs(dateRanage.value[0]).format('YYYY-MM-DD HH:mm:ss')
  activity.value.endTime = dayjs(dateRanage.value[1]).format('YYYY-MM-DD HH:mm:ss')
}

const clearForm = () => {
  dialogActivity.value = false
  dateRanage.value = []
  activityRef.value?.resetFields()
  activity.value = {}
  // 清理编辑器内容
  aiEditorRef.value?.clearContent()
  // 重置退票规则
  refundRules.value = [{ minBeforeEndHour: 24, refundRate: 10, timeDesc: '' }]
  // 重置协议
  agreement.value = []
  // 重置票据信息
  ticketInfoList.value = ['area', 'subArea', 'seatRow', 'seatNo']
}

const submit = () => {
  console.log('refundRules==', refundRules.value)
  console.log('ticketInfoList==', ticketInfoList.value)
  console.log('agreement==', agreement.value)

  const editorContent = aiEditorRef.value?.getContent() || ''
  if (editorContent && editorContent !== '<p></p>') {
    activity.value.detail = editorContent
  }
  activityRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    subLoading.value = true
    // 获取编辑器内容
    const params: any = {
      name: activity.value.name,
      detail: editorContent,
      cover: activity.value.cover,
      startTime: activity.value.startTime,
      endTime: activity.value.endTime,
      startSaleTime: dayjs(activity.value.startSaleTime).format('YYYY-MM-DD HH:mm:ss'),
      gateUrl: activity.value.gateUrl,
      gateToken: activity.value.gateToken,
      venueId: activity.value.venueId,
      endSaleTime: dayjs(activity.value.endSaleTime).format('YYYY-MM-DD HH:mm:ss'),
      buyLimit: activity.value.buyLimit,
      allowRefund: activity.value.allowRefund,
    }
    if (agreement.value.length > 0) {
      params.agreementInfo = JSON.stringify(toRaw(agreement.value))
    }
    if (activity.value.allowRefund === 'Y') {
      params.refundRule = JSON.stringify({
        endTime: dayjs(endTime.value).format('YYYY-MM-DD HH:mm:ss'),
        refundRules: toRaw(refundRules.value)?.sort((a, b) => b.minBeforeEndHour - a.minBeforeEndHour),
      })
    }
    if (ticketInfoList.value.length > 0) {
      params.ticketShowInfo = JSON.stringify(
        ticketInfoList.value?.map((field) => ({ [field]: true })),
      )
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

<style>
.activity-mode {
  :deep(.table__header-wrapper) {
    th {
      color: #b7b9bb;
      border: none !important;
      background-color: #fff !important;
    }
  }
}
.avatar-uploader .el-upload {
  border: 1px dashed #4c4d4f;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.2s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
}
</style>
