<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-title">欢迎登录渝超管理系统</div>
      <el-form ref="loginRef" :model="login" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="login.username"
            placeholder="请输入账号"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="login.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            type="password"
          ></el-input>
        </el-form-item>
      </el-form>

      <el-button @click="submit(loginRef)" :loading="subLoading" class="sub-btn" type="primary"
        >登录</el-button
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import {} from 'pinia'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { loginAPI } from '@/service/index'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index'
import type { FormInstance, FormRules } from 'element-plus'

interface LoginForm {
  username: string
  password: string
}

const login = reactive<Partial<LoginForm>>({})
const subLoading = ref<boolean>(false)
const router = useRouter()
const userStore = useUserStore()
const rules = reactive<FormRules<LoginForm>>({
  username: [{ required: true, message: '账号不能为空！', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空！', trigger: 'blur' }],
})
const loginRef = ref<FormInstance | null>(null)

const submit = (formEl: FormInstance | null) => {
  formEl?.validate((valid) => {
    if (!valid) {
      return
    }
    const param: LoginForm = {
      username: login.username as string,
      password: login.password as string,
    }
    subLoading.value = true
    loginAPI(param)
      .then((res) => {
        userStore.setUserInfo({
          token: res.data.token as string,
          username: login.username as string,
          authorization: res.data.authorization as string,
        })
        router.push('/home')
      })
      .finally(() => {
        subLoading.value = false
      })
  })
}
</script>
<style lang="less">
.login-container {
  width: 100vw;
  height: 100vh;
  background: url(../assets/images/back.png) no-repeat;
  background-size: 100% 100%;

  .login-form {
    position: absolute;
    top: 50%;
    right: 210px;
    transform: translateY(-50%);
    width: 450px;
    padding: 50px 60px 70px 60px;
    color: #c6ced6;
    background: rgba(35, 42, 52, 1);
    box-shadow: 0px 10px 40px 0px rgba(21, 34, 52, 0.15);

    .login-title {
      font-size: 24px;
      text-align: center;
      margin-bottom: 50px;
    }

    .el-input__wrapper,
    .el-input__inner {
      background: transparent;
      height: 45px;
      color: #c6ced6;
    }

    .el-form-item__label {
      color: #c6ced6;
    }
  }

  .sub-btn {
    width: 100%;
    height: 50px;
    margin-top: 20px;
  }
}
</style>
