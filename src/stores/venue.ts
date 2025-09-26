import { getVenueListAPI } from '@/service'
import type { Pageing, VenueInfo } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVenueStore = defineStore('venue', () => {
  const venueList = ref<VenueInfo[]>()
  const venueAll = ref<VenueInfo[]>()

  const getVenueList = async (page: Pageing) => {
    let total = 0
    const res = await getVenueListAPI({ pageNumber: page.pageNumber, pageSize: page.pageSize })
    venueList.value = res.data
    total = res.total
    return { venueList: venueList.value, total }
  }

  const getVenueAllList = async () => {
    const res = await getVenueListAPI({ pageNumber: 1, pageSize: 10000 })
    venueAll.value = res.data
    return { venueAll: venueAll.value }
  }

  return { venueList, venueAll, getVenueList, getVenueAllList }
})
