<template>
  <el-dialog v-model="dialogVisible" title="生成物料码" width="800px" @close="clearForm">
    <div class="material-code-container">
      <!-- 上传底图 -->
      <div class="upload-section">
        <el-form-item label="上传底图：">
          <el-upload
            class="bg-uploader"
            :http-request="uploadBgImage"
            :show-file-list="false"
            :before-upload="beforeBgUpload"
            accept="image/*"
          >
            <img v-if="bgImageUrl" :src="bgImageUrl" class="bg-image" />
            <div v-else class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <div>点击上传底图</div>
            </div>
          </el-upload>
        </el-form-item>
      </div>

      <div class="text-size-control">
        <el-form-item label="本次生码范围：">
          <el-radio-group v-model="ticketType">
            <el-radio value="SALE_TICKET">售票</el-radio>
            <el-radio value="GIFT_TICKET">赠票</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- 元素选择 -->
      <div class="element-selection">
        <el-form-item label="选择元素：">
          <el-checkbox-group v-model="selectedElements">
            <el-checkbox value="qrcode">二维码</el-checkbox>
            <el-checkbox value="area">大区</el-checkbox>
            <el-checkbox value="subArea">小区</el-checkbox>
            <el-checkbox value="row">排</el-checkbox>
            <el-checkbox value="seat">号</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <!-- 画布容器 -->
      <div class="canvas-container" v-if="bgImageUrl">
        <div class="canvas-wrapper" ref="canvasWrapper">
          <img :src="bgImageUrl" class="bg-canvas" ref="bgCanvas" @load="initCanvas" />

          <!-- 可拖拽元素 -->
          <div
            v-if="selectedElements.includes('qrcode')"
            class="draggable-element qrcode-element"
            :style="{
              left: qrcodePosition.x + 'px',
              top: qrcodePosition.y + 'px',
              width: qrcodeSize.width + 'px',
              height: qrcodeSize.height + 'px',
            }"
            @mousedown="startDrag('qrcode', $event)"
            @click="console.log('qrcode element clicked')"
          >
            <div class="element-content">二维码</div>
            <div
              class="resize-handle"
              @mousedown.stop="startResize('qrcode', $event)"
              @click="console.log('resize handle clicked')"
            ></div>
          </div>

          <div
            v-if="selectedElements.includes('area')"
            class="draggable-element text-element"
            :style="{
              left: areaPosition.x + 'px',
              top: areaPosition.y + 'px',
            }"
            @mousedown="startDrag('area', $event)"
          >
            <div class="element-content" :style="{ fontSize: textSize + 'px', color: fontColor }">
              大区
            </div>
          </div>

          <div
            v-if="selectedElements.includes('subArea')"
            class="draggable-element text-element"
            :style="{
              left: subAreaPosition.x + 'px',
              top: subAreaPosition.y + 'px',
            }"
            @mousedown="startDrag('subArea', $event)"
          >
            <div class="element-content" :style="{ fontSize: textSize + 'px', color: fontColor }">
              小区
            </div>
          </div>

          <div
            v-if="selectedElements.includes('row')"
            class="draggable-element text-element"
            :style="{
              left: rowPosition.x + 'px',
              top: rowPosition.y + 'px',
            }"
            @mousedown="startDrag('row', $event)"
          >
            <div class="element-content" :style="{ fontSize: textSize + 'px', color: fontColor }">
              排
            </div>
          </div>

          <div
            v-if="selectedElements.includes('seat')"
            class="draggable-element text-element"
            :style="{
              left: seatPosition.x + 'px',
              top: seatPosition.y + 'px',
            }"
            @mousedown="startDrag('seat', $event)"
          >
            <div class="element-content" :style="{ fontSize: textSize + 'px', color: fontColor }">
              号
            </div>
          </div>
        </div>
      </div>

      <!-- 二维码大小控制 -->
      <div class="size-control" v-if="selectedElements.includes('qrcode')">
        <el-form-item label="二维码大小：">
          <div class="size-inputs">
            <el-input-number v-model="qrcodeSize.width" :min="20" :max="600" placeholder="宽度" />
            <span>×</span>
            <el-input-number v-model="qrcodeSize.height" :min="20" :max="600" placeholder="高度" />
          </div>
        </el-form-item>
      </div>

      <!-- 文字大小控制 -->
      <div class="text-size-control">
        <el-form-item label="文字大小：">
          <el-input-number v-model="textSize" :min="12" :max="48" placeholder="文字大小" />
        </el-form-item>
      </div>

      <!-- 文字颜色控制 -->
      <div class="text-color-control">
        <el-form-item label="文字颜色：">
          <div class="color-inputs">
            <el-color-picker v-model="fontColor" :predefine="predefineColors" />
            <el-input
              v-model="fontColor"
              placeholder="请输入颜色值"
              style="width: 120px; margin-left: 10px"
            />
          </div>
        </el-form-item>
        <img style="width: 100%" v-if="prevewImageUrl" :src="prevewImageUrl" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="clearForm">取消</el-button>
        <el-button type="primary" @click="previewCode" :loading="prevewLoading">预览</el-button>
        <el-button type="primary" @click="generateCode" :loading="generating">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import {
  ElDialog,
  ElFormItem,
  ElUpload,
  ElIcon,
  ElCheckboxGroup,
  ElCheckbox,
  ElInputNumber,
  ElButton,
  ElMessage,
  ElColorPicker,
  ElInput,
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { generateMaterialCodeAPI, previewMaterialCodeAPI } from '@/service/index'
import type { UploadRequestOptions } from 'element-plus'

interface IProps {
  matchId: number
}

const props = defineProps<IProps>()
const emit = defineEmits(['success'])

const dialogVisible = defineModel({ default: false })
const canvasWrapper = ref<HTMLElement>()
const bgCanvas = ref<HTMLImageElement>()
const prevewLoading = ref(false)
const prevewImageUrl = ref<string>('')
const ticketType = ref<'SALE_TICKET' | 'GIFT_TICKET'>('GIFT_TICKET')
// 表单数据
const bgImageUrl = ref('')
const selectedElements = ref<string[]>(['qrcode'])
const textSize = ref(30)
const fontColor = ref('#000000')
const generating = ref(false)

// 预定义颜色
const predefineColors = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
  '#808080',
  '#C0C0C0',
  '#800000',
  '#808000',
]

// 位置数据
const qrcodePosition = reactive({ x: 50, y: 50 })
const areaPosition = reactive({ x: 50, y: 100 })
const subAreaPosition = reactive({ x: 50, y: 130 })
const rowPosition = reactive({ x: 50, y: 160 })
const seatPosition = reactive({ x: 50, y: 190 })

// 二维码大小
const qrcodeSize = reactive({ width: 100, height: 100 })

// 拖拽相关
let isDragging = false
let isResizing = false
let dragElement = ''
let startX = 0
let startY = 0
let startElementX = 0
let startElementY = 0
let startWidth = 0
let startHeight = 0

const beforeBgUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const uploadBgImage = (option: UploadRequestOptions) => {
  const file = option.file
  const reader = new FileReader()
  reader.onload = (e) => {
    bgImageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return Promise.resolve()
}

const initCanvas = () => {
  nextTick(() => {
    if (bgCanvas.value && canvasWrapper.value) {
      const canvas = bgCanvas.value
      const wrapper = canvasWrapper.value

      // 设置画布大小
      wrapper.style.width = canvas.naturalWidth + 'px'
      wrapper.style.height = canvas.naturalHeight + 'px'

      // 重置元素位置
      resetElementPositions()
    }
  })
}

const resetElementPositions = () => {
  if (!bgCanvas.value) return

  const canvasWidth = bgCanvas.value.naturalWidth
  const canvasHeight = bgCanvas.value.naturalHeight

  qrcodePosition.x = Math.min(50, canvasWidth - qrcodeSize.width)
  qrcodePosition.y = Math.min(50, canvasHeight - qrcodeSize.height)
  areaPosition.x = 50
  areaPosition.y = 100
  subAreaPosition.x = 50
  subAreaPosition.y = 130
  rowPosition.x = 50
  rowPosition.y = 160
  seatPosition.x = 50
  seatPosition.y = 190
}

const startDrag = (element: string, event: MouseEvent) => {
  if (isResizing) return // 如果正在缩放，不启动拖拽

  isDragging = true
  dragElement = element
  startX = event.clientX
  startY = event.clientY

  const position = getElementPosition(element)
  startElementX = position.x
  startElementY = position.y

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}

const startResize = (element: string, event: MouseEvent) => {
  isResizing = true
  startX = event.clientX
  startY = event.clientY
  startWidth = qrcodeSize.width
  startHeight = qrcodeSize.height

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  event.stopPropagation()
  event.preventDefault()
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  const newX = startElementX + deltaX
  const newY = startElementY + deltaY

  updateElementPosition(dragElement, newX, newY)
}

const onResize = (event: MouseEvent) => {
  if (!isResizing) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  // 简单的缩放算法：基于拖拽距离
  const scaleFactor = 1 + (deltaX + deltaY) * 0.01

  // 限制缩放范围
  const minSize = 20
  const maxSize = 600
  const newWidth = Math.max(minSize, Math.min(maxSize, Math.round(startWidth * scaleFactor)))
  // 保持等比例
  const aspectRatio = startWidth / startHeight
  qrcodeSize.width = newWidth
  qrcodeSize.height = Math.round(newWidth / aspectRatio)
}

const stopDrag = () => {
  isDragging = false
  dragElement = ''
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const getElementPosition = (element: string) => {
  switch (element) {
    case 'qrcode':
      return qrcodePosition
    case 'area':
      return areaPosition
    case 'subArea':
      return subAreaPosition
    case 'row':
      return rowPosition
    case 'seat':
      return seatPosition
    default:
      return { x: 0, y: 0 }
  }
}

const updateElementPosition = (element: string, x: number, y: number) => {
  if (!bgCanvas.value) return

  const canvasWidth = bgCanvas.value.naturalWidth
  const canvasHeight = bgCanvas.value.naturalHeight

  // 限制在画布范围内
  const maxX = element === 'qrcode' ? canvasWidth - qrcodeSize.width : canvasWidth - 50
  const maxY = element === 'qrcode' ? canvasHeight - qrcodeSize.height : canvasHeight - 20

  const clampedX = Math.max(0, Math.min(x, maxX))
  const clampedY = Math.max(0, Math.min(y, maxY))

  switch (element) {
    case 'qrcode':
      qrcodePosition.x = clampedX
      qrcodePosition.y = clampedY
      break
    case 'area':
      areaPosition.x = clampedX
      areaPosition.y = clampedY
      break
    case 'subArea':
      subAreaPosition.x = clampedX
      subAreaPosition.y = clampedY
      break
    case 'row':
      rowPosition.x = clampedX
      rowPosition.y = clampedY
      break
    case 'seat':
      seatPosition.x = clampedX
      seatPosition.y = clampedY
      break
  }
}

const previewCode = () => {
  if (!bgImageUrl.value) {
    ElMessage.error('请先上传底图')
    return
  }

  if (selectedElements.value.length === 0) {
    ElMessage.error('请至少选择一个元素')
    return
  }

  prevewLoading.value = true

  const params: any = {
    matchId: props.matchId,
    bgImage: bgImageUrl.value,
    textSize: textSize.value,
    fontColor: fontColor.value,
    ticketType: ticketType.value,
  }

  if (selectedElements.value.includes('qrcode')) {
    params.qrcodeWidth = qrcodeSize.width
    params.qrcodeHeight = qrcodeSize.height
    params.qrcodeX = qrcodePosition.x
    params.qrcodeY = qrcodePosition.y
  }

  if (selectedElements.value.includes('area')) {
    params.areaX = areaPosition.x
    params.areaY = areaPosition.y + textSize.value + 5
  }

  if (selectedElements.value.includes('subArea')) {
    params.subAreaX = subAreaPosition.x
    params.subAreaY = subAreaPosition.y + textSize.value + 5
  }

  if (selectedElements.value.includes('row')) {
    params.rowX = rowPosition.x
    params.rowY = rowPosition.y + textSize.value + 5
  }

  if (selectedElements.value.includes('seat')) {
    params.seatX = seatPosition.x
    params.seatY = seatPosition.y + textSize.value + 5
  }

  previewMaterialCodeAPI(params)
    .then((res) => {
      prevewImageUrl.value = res.data
      ElMessage.success('预览成功')
    })
    .catch(() => {
      ElMessage.error('预览失败')
    })
    .finally(() => {
      prevewLoading.value = false
    })
}

const generateCode = () => {
  if (!bgImageUrl.value) {
    ElMessage.error('请先上传底图')
    return
  }

  if (selectedElements.value.length === 0) {
    ElMessage.error('请至少选择一个元素')
    return
  }

  generating.value = true

  const params: any = {
    matchId: props.matchId,
    bgImage: bgImageUrl.value,
    textSize: textSize.value,
    fontColor: fontColor.value,
    ticketType: ticketType.value,
  }

  if (selectedElements.value.includes('qrcode')) {
    params.qrcodeWidth = qrcodeSize.width
    params.qrcodeHeight = qrcodeSize.height
    params.qrcodeX = qrcodePosition.x
    params.qrcodeY = qrcodePosition.y
  }

  if (selectedElements.value.includes('area')) {
    params.areaX = areaPosition.x
    params.areaY = areaPosition.y + textSize.value + 5
  }

  if (selectedElements.value.includes('subArea')) {
    params.subAreaX = subAreaPosition.x
    params.subAreaY = subAreaPosition.y + textSize.value + 5
  }

  if (selectedElements.value.includes('row')) {
    params.rowX = rowPosition.x
    params.rowY = rowPosition.y + textSize.value + 5
  }

  if (selectedElements.value.includes('seat')) {
    params.seatX = seatPosition.x
    params.seatY = seatPosition.y + textSize.value + 5
  }

  generateMaterialCodeAPI(params)
    .then(() => {
      ElMessage.success('生成成功')
      emit('success')
      clearForm()
    })
    .catch(() => {
      ElMessage.error('生成失败')
    })
    .finally(() => {
      generating.value = false
    })
}

const clearForm = () => {
  dialogVisible.value = false
  bgImageUrl.value = ''
  prevewImageUrl.value = ''
  selectedElements.value = ['qrcode']
  textSize.value = 30
  fontColor.value = '#000000'
  resetElementPositions()
}
</script>

<style scoped>
.material-code-container {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 20px;
}

.bg-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: 0.2s;
}

.bg-uploader .el-upload:hover {
  border-color: #409eff;
}

.upload-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.bg-image {
  max-width: 300px;
  max-height: 200px;
  display: block;
}

.element-selection {
  margin-bottom: 20px;
}

.canvas-container {
  margin-bottom: 20px;
}

.canvas-wrapper {
  position: relative;
  border: 1px solid #ddd;
  display: inline-block;
}

.bg-canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.draggable-element {
  position: absolute;
  cursor: move;
  border: 2px dashed #409eff;
  background: rgba(64, 158, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  min-height: 20px;
}

.qrcode-element {
  background: rgba(64, 158, 255, 0.2);
}

.text-element {
  background: rgba(103, 194, 58, 0.2);
  border-color: #67c23a;
}

.element-content {
  font-size: 12px;
  color: #333;
  font-weight: bold;
}

.resize-handle {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background: #409eff;
  cursor: se-resize;
}

.size-control {
  margin-bottom: 20px;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-size-control {
  margin-bottom: 20px;
}

.text-color-control {
  margin-bottom: 20px;
}

.color-inputs {
  display: flex;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style>
