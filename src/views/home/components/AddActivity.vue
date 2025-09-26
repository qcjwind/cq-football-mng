<template>
  <el-dialog style="width: 1200px" v-model="dialogActivity" title="新增活动" @close="clearForm">
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
          v-model="imageUrl"
          class="avatar-uploader"
          :http-request="uploadOss"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="售票时间：" prop="startSaleTime">
        <ElDatePicker
          style="width: 100%"
          v-model="activity.startSaleTime"
          type="datetime"
          placeholder="请选择开始售票时间"
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
      <el-form-item label="赛事详情：" prop="detail">
        <div ref="editorRef" style="width: 100%; height: 500px"></div>
      </el-form-item>
    </el-form>

    <div class="frm-btns">
      <ElButton @click="clearForm">取消</ElButton>
      <ElButton @click="submit" :loading="subLoading" type="primary">保存</ElButton>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import {
  ElDialog,
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
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { AiEditor } from 'aieditor'
import 'aieditor/dist/style.css'
import dayjs from 'dayjs'
import { addActivityAPI, editActivityAPI, getOssStsAPI, uploadOssAPI } from '@/service/index'
import type { ActivityInfo, OssSts } from '@/types/index'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { useVenueStore } from '@/stores/venue'
import { v4 as uuidv4 } from 'uuid'

interface IProps {
  activityInfo: Partial<ActivityInfo>
}
let editor: AiEditor | null = null
const editorRef = ref<HTMLDivElement>()
const dialogActivity = defineModel({ default: false })
const props = defineProps<IProps>()
const emit = defineEmits(['addSuccess'])
const activityRef = ref<FormInstance>()
const activity = ref<Partial<ActivityInfo>>({})
const dateRanage = ref()
const subLoading = ref<boolean>(false)
const ossSts = ref<OssSts | null>(null)
const imageUrl = ref<string>()
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入赛事名称' }],
  cover: [{ required: true, message: '请上传赛事封面' }],
  startSaleTime: [{ required: true, message: '请选择开始售票时间' }],
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
      imageUrl.value = newInfo.cover || ''
      editor?.setContent(newInfo.detail || '')
    }
  },
)

// 监听对话框打开状态，初始化编辑器
watch(
  () => dialogActivity.value,
  async (isOpen) => {
    if (isOpen) {
      venueStore.getVenueAllList()
      getOssSts()
      await nextTick()
      initEditor()
    }
  },
  { immediate: true },
)

const beforeAvatarUpload = () => {}
const handleAvatarSuccess = (url: string) => {
  imageUrl.value = url
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

const initEditor = () => {
  if (editor || !editorRef.value) {
    return
  }
  editor = new AiEditor({
    element: editorRef.value as Element,
    placeholder: '请输入赛事详情',
    image: {
      defaultSize: '100%',
      uploader: (file: File) => {
        return new Promise((resolve, reject) => {
          uploadOss({ file })
            .then((url) => {
              resolve({ errorCode: 0, data: { src: url, alt: '图片 alt' } })
            })
            .catch((err) => {
              reject(err)
            })
        })
      },
    },
  })
  editor?.setContent(activity.value.detail || '')
}

const clearForm = () => {
  dialogActivity.value = false
  dateRanage.value = []
  activityRef.value?.resetFields()
  activity.value = {}
  imageUrl.value = ''
  // 清理编辑器内容
  if (editor) {
    editor.setContent('')
  }
}

const getOssSts = () => {
  getOssStsAPI().then((res) => {
    ossSts.value = res.data
  })
}

const submit = () => {
  const editorContent = editor?.getHtml() || ''
  if (editorContent && editorContent !== '<p></p>') {
    activity.value.detail = editorContent
  }
  activityRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    subLoading.value = true
    // 获取编辑器内容
    const params = {
      name: activity.value.name,
      detail: editorContent,
      cover: imageUrl.value,
      startTime: activity.value.startTime,
      endTime: activity.value.endTime,
      startSaleTime: dayjs(activity.value.startSaleTime).format('YYYY-MM-DD HH:mm:ss'),
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

// 组件卸载时清理编辑器
onUnmounted(() => {
  editor?.destroy()
})
</script>

<style>
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
