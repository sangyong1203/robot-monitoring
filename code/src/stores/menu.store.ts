import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppIconName } from '@/constants/appIcons'
import type { RoleLevel } from '@/types/accessControl'
import { fetchApi } from '@/http'
import { useNavStore } from './nav.store'

export type Menu = {
    id: number
    parentId: number
    screenId?: string
    title: string
    path: string
    icon: AppIconName
    useYn: 'Y' | 'N'
    children: Menu[]
}

const KORAD_MENUS: Menu[] = [
    {
        id: 90,
        parentId: 0,
        title: '시스템 설정',
        path: '',
        icon: 'IconSetting',
        useYn: 'Y',
        children: [
            { id: 91, parentId: 90, title: '기관 및 사이트 관리', path: '/admin/organizations', icon: 'IconDevice', useYn: 'Y', children: [] },
            { id: 92, parentId: 90, title: '사용자 관리', path: '/admin/users', icon: 'IconDevice', useYn: 'Y', children: [] },
        ],
    },
    {
        id: 50,
        parentId: 0,
        title: '공간 관리',
        path: '',
        icon: 'IconMap',
        useYn: 'Y',
        children: [
            { id: 51, parentId: 50, title: '지역 / 구역 / 지도 관리', path: '/admin/maps', icon: 'IconDevice', useYn: 'Y', children: [] },
            { id: 53, parentId: 50, title: '목적지 관리', path: '/admin/destinations', icon: 'IconDevice', useYn: 'Y', children: [] },
        ],
    },
    {
        id: 60,
        parentId: 0,
        title: '로봇 자산 관리',
        path: '',
        icon: 'IconDeviceManagement',
        useYn: 'Y',
        children: [
            { id: 61, parentId: 60, title: '로봇 모델 관리', path: '/admin/robot-models', icon: 'IconDevice', useYn: 'Y', children: [] },
            { id: 62, parentId: 60, title: '운영 로봇 관리', path: '/admin/operating-robots', icon: 'IconDevice', useYn: 'Y', children: [] },
        ],
    },
    {
        id: 20,
        parentId: 0,
        title: '실시간 관제',
        path: '',
        icon: 'IconMonitoring',
        useYn: 'Y',
        children: [
            { id: 21, parentId: 20, title: '통합 관제 모니터링', path: '/monitoring/integrated', icon: 'IconDevice', useYn: 'Y', children: [] },
            { id: 22, parentId: 20, title: '작업 로봇 관제', path: '/monitoring/work', icon: 'IconDevice', useYn: 'Y', children: [] },
            { id: 23, parentId: 20, title: '감시 로봇 관제', path: '/monitoring/surveillance', icon: 'IconDevice', useYn: 'Y', children: [] },
        ],
    },
]

type NavigationMenuItem = {
    id: number
    screenId: string
    name: string
    path: string
    parentScreenId: string
    sortOrder: number
    isActive: boolean
}

export const useMenuStore = defineStore(
    'menu',
    () => {
        const data = ref<Menu[]>([])

        const init = () => {
            data.value = []
        }

        const getMenu = (): Menu[] => data.value

        const setMenu = (menus: Menu[]) => {
            data.value = menus
        }

        const setTempMenu = (_role?: RoleLevel) => {
            data.value = KORAD_MENUS
        }

        const loadMenu = async (role: RoleLevel) => {
            if (import.meta.env.VITE_API_MODE === 'mock') {
                setTempMenu(role)
                return
            }
            try {
                const response = await fetchApi().get<NavigationMenuItem[]>('/api/v1/system/navigation')
                if (response.data && response.data.length > 0) {
                    // Custom menu mapping if backend provides it
                } else {
                    setTempMenu(role)
                }
            } catch {
                setTempMenu(role)
            }
        }

        const searchRecursive = (items: Menu[], path: string): Array<{ name: string; path: string }> => {
            for (const item of items) {
                if (item.path === path) return [{ name: item.title, path: item.path }]
                const descendants = searchRecursive(item.children, path)
                if (descendants.length) return [{ name: item.title, path: item.path }, ...descendants]
            }
            return []
        }

        const handleClickMenu = (path: string, menus: Menu[]) => {
            const navStore = useNavStore()
            navStore.setNav(searchRecursive(menus, path))
            navStore.setRoute(path)
        }

        return { data, init, getMenu, setMenu, setTempMenu, loadMenu, handleClickMenu }
    },
    { persist: true },
)
