<template>
  <div>
    <el-dialog v-model="dialogAgreement" title="SKU设置" width="700px" @close="clearForm">
      <el-form :model="sku" label-position="top" ref="skuRef">
        <el-form-item label="SKU名称" prop="skuName">
          <el-input v-model="sku.skuName" placeholder="请输入SKU名称" />
        </el-form-item>
        <el-form-item label="SKU备注" prop="remark">
          <el-input v-model="sku.remark" placeholder="请输入SKU备注" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="sku.price"
            placeholder="请输入价格"
            :precision="2"
            :min="0"
            :max="999999.99"
          />
        </el-form-item>
        <el-form-item label="SKU详情" prop="description">
          <AiEditor
            v-model="sku.description"
            height="500px"
            placeholder="请输入SKU详情"
            ref="aiEditorRef"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogAgreement = false">取消</el-button>
        <el-button @click="submit" type="primary" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInputNumber, ElButton, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import AiEditor from '@/components/AiEditor.vue'
import type { SkuInfo } from '@/types'
import { editSkuAPI } from '@/service'

const skuRef = ref<FormInstance>()
const props = defineProps<{
  skuData: SkuInfo | null
}>()
const loading = ref(false)
const dialogAgreement = defineModel({ default: false })
const sku = ref<Partial<SkuInfo>>({})
const emit = defineEmits(['success'])

const aiEditorRef = ref<InstanceType<typeof AiEditor>>()

watch(
  () => props.skuData,
  (newVal) => {
    if (newVal) {
      sku.value = { ...newVal, price: newVal.price / 100 }
    }
  },
  { immediate: true },
)

const submit = () => {
  loading.value = true
  skuRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    editSkuAPI({
      ...toRaw(sku.value),
      price: sku.value.price ? sku.value.price * 100 : 0,
    }).then(() => {
      ElMessage.success('操作成功')
      clearForm()
      emit('success')
    }).finally(() => {
      loading.value = false
    })
  })
}

const clearForm = () => {
  sku.value = {}
  aiEditorRef.value?.clearContent()
  dialogAgreement.value = false
  skuRef.value?.resetFields()
}
</script>

<style lang="less" scoped></style>
