import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginResult, ActivityInfo } from '@/types/index'
import { ALIAS } from '@/utils/constant'

export const useUserStore = defineStore('user', () => {
  const user = ref<LoginResult | null>()
  if (!user.value) {
    const res = JSON.parse(localStorage.getItem(ALIAS.user) || '{}')
    user.value = res
  }
  function setUserInfo(userInfo: LoginResult) {
    user.value = userInfo
    localStorage.setItem(ALIAS.user, JSON.stringify(userInfo))
  }

  function getUserToken() {
    return user.value?.token
  }

  function clearUserToken() {
    user.value = null
    localStorage.removeItem(ALIAS.user)
    location.reload()
  }

  return { user, setUserInfo, getUserToken, clearUserToken }
})

export const useActivityInfoStore = defineStore('activityInfo', () => {
  const activityInfo = ref<ActivityInfo>()

  const setActivityInfo = (info: ActivityInfo) => {
    activityInfo.value = { ...info }
    sessionStorage.setItem(ALIAS.activityInfo, JSON.stringify(info || {}))
  }

  const getActivityInfo = () => {
    if (activityInfo.value) {
      return activityInfo.value
    }
    const info = JSON.parse(sessionStorage.getItem(ALIAS.activityInfo) || '{}')
    if (info?.id) {
      activityInfo.value = info
    }
    return activityInfo.value
  }

  return { setActivityInfo, getActivityInfo }
})
