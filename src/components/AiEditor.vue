<template>
  <div ref="editorRef" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, onMounted } from 'vue'
import { AiEditor } from 'aieditor'
import 'aieditor/dist/style.css'
import { getOssStsAPI, uploadOssAPI } from '@/service/index'
import type { OssSts } from '@/types/index'
import type { UploadRequestOptions } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

interface IProps {
  modelValue?: string
  height?: string
  placeholder?: string
}

interface IEmits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: '',
  height: '500px',
  placeholder: '请输入内容'
})

const emit = defineEmits<IEmits>()

let editor: AiEditor | null = null
const editorRef = ref<HTMLDivElement>()
const ossSts = ref<OssSts | null>(null)
let contentTimer: number | null = null

// 初始化OSS配置
const getOssSts = () => {
  getOssStsAPI().then((res) => {
    ossSts.value = res.data
  })
}

// 生成文件名
const getFileName = (fileName: string) => {
  const arr = fileName?.split('.')
  return uuidv4() + '.' + arr[arr.length - 1]
}

// 构建上传表单数据
const buildUploadFormData = (file: File) => {
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

// OSS上传方法
const uploadOss = (option: UploadRequestOptions | { file: File }) => {
  return new Promise((resolve, reject) => {
    const { formData, key } = buildUploadFormData(option.file)
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

// 初始化编辑器
const initEditor = () => {
  if (editor || !editorRef.value) {
    return
  }

  editor = new AiEditor({
    element: editorRef.value as Element,
    placeholder: props.placeholder,
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

  // 设置初始内容
  if (props.modelValue) {
    editor.setContent(props.modelValue)
  }

  // 监听内容变化
  contentTimer = setInterval(() => {
    const content = editor?.getHtml() || ''
    emit('update:modelValue', content)
  }, 500)
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getHtml()) {
      editor.setContent(newValue || '')
    }
  }
)

// 组件挂载时初始化
onMounted(() => {
  getOssSts()
  nextTick(() => {
    initEditor()
  })
})

// 暴露方法给父组件
const setContent = (content: string) => {
  editor?.setContent(content)
}

const getContent = () => {
  return editor?.getHtml() || ''
}

const clearContent = () => {
  editor?.setContent('')
}

defineExpose({
  setContent,
  getContent,
  clearContent
})

// 组件卸载时清理编辑器
onUnmounted(() => {
  if (contentTimer) {
    clearInterval(contentTimer)
  }
  editor?.destroy()
})
</script>
