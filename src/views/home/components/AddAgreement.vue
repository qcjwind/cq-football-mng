<template>
  <div>
    <el-dialog v-model="dialogAgreement" title="添加协议" width="50%" @close="clearForm">
      <el-form :model="agreement" :rules="rules" label-position="top" ref="agreementRef">
        <el-form-item label="协议名称" prop="name">
          <el-input v-model="agreement.name" placeholder="请输入协议名称" />
        </el-form-item>
        <el-form-item label="协议内容" prop="text">
          <AiEditor
            v-model="agreement.text"
            height="500px"
            placeholder="请输入协议内容"
            ref="aiEditorRef"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogAgreement = false">取消</el-button>
        <el-button @click="submit" type="primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import AiEditor from '@/components/AiEditor.vue'

const agreementRef = ref<FormInstance>()
const props = defineProps<{
  agreementData: { name: string; text: string } | null
}>()
const dialogAgreement = defineModel({ default: false })
const agreement = ref<{ name: string; text: string }>({ name: '', text: '' })
const emit = defineEmits(['success'])
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入协议名称' }],
  text: [{ required: true, message: '请输入协议内容' }],
})
const aiEditorRef = ref<InstanceType<typeof AiEditor>>()

  watch(() => props.agreementData, (newVal) => {
    if (newVal) {
      agreement.value = { ...newVal }
    }
  }, { immediate: true })

const submit = () => {
  agreementRef.value?.validate((valid) => {
    if (!valid) {
      return
    }
    if (agreement.value.text === '<p></p>') {
      ElMessage.error('请输入协议内容')
      return
    }
    emit('success', toRaw(agreement.value))
    clearForm()
  })
}

const clearForm = () => {
  agreement.value = { name: '', text: '' }
  aiEditorRef.value?.clearContent()
  dialogAgreement.value = false
  agreementRef.value?.resetFields()
}
</script>

<style lang="less" scoped></style>
