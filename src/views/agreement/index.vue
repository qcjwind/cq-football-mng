<template>
  <div class="agreement-container" v-html="htmTxt"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const buyTicket = ``
const securityCheck = ``
const admissionNoticead = ``
const type = route?.query?.type || ''
console.log('type', type);

const htmTxt = ref<string>('')

onMounted(() => {
  if (type === 'buyTicket') {
    htmTxt.value = buyTicket
  } else if (type === 'securityCheck') {
    htmTxt.value = securityCheck
  } else if (type === 'admissionNotice') {
    htmTxt.value = admissionNoticead
  }
})
</script>

<style scoped lang="less">
.agreement-container {
  width: 100%;
  height: 100vh;
  background: #fff;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
