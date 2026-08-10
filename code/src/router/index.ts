import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(to => {
    const authStore = useAuthStore()

    if (to.meta.public) {
        return true
    }

    if (!authStore.isAuthenticated) {
        return { name: 'login' }
    }

    return true
})

export default router
