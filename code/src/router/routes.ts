import { type RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/pages/login/LoginPage.vue'),
        meta: { public: true },
    },
    {
        path: '/password-reset/:verificationToken',
        name: 'passwordReset',
        component: () => import('@/pages/login/PasswordReset.vue'),
        meta: { public: true },
    },
    {
        path: '/',
        redirect: { name: 'dashboard' },
        name: 'main',
        component: () => import('@/pages/main/MainPage.vue'),
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/pages/main/dashboard/DashboardPage.vue'),
                meta: { screenId: 'IRCS_DB_01_P', title: '통합 관제 대시보드' },
            },
            {
                path: 'admin/organizations',
                alias: ['settings/institutions'],
                name: 'organizations',
                component: () => import('@/pages/main/admin/organizations/OrganizationManagementPage.vue'),
                meta: { screenId: 'IRCS_SS_01_P' },
            },
            {
                path: 'admin/users',
                alias: ['settings/users'],
                name: 'users',
                component: () => import('@/pages/main/admin/users/UserManagementPage.vue'),
                meta: { screenId: 'IRCS_SS_02_P' },
            },
            {
                path: 'admin/maps',
                alias: ['spaces/maps'],
                name: 'maps',
                component: () => import('@/pages/main/admin/maps/MapManagementPage.vue'),
                meta: { screenId: 'IRCS_SM_01_P' },
            },
            {
                path: 'admin/destinations',
                alias: ['spaces/pois'],
                name: 'destinations',
                component: () => import('@/pages/main/admin/destinations/DestinationManagementPage.vue'),
                meta: { screenId: 'IRCS_SM_03_P' },
            },
            {
                path: 'admin/robot-models',
                alias: ['robots/models'],
                name: 'robotModels',
                component: () => import('@/pages/main/admin/robotModels/RobotModelManagementPage.vue'),
                meta: { screenId: 'IRCS_RM_01_P' },
            },
            {
                path: 'admin/operating-robots',
                alias: ['robots/devices'],
                name: 'operatingRobots',
                component: () => import('@/pages/main/admin/operatingRobots/OperatingRobotManagementPage.vue'),
                meta: { screenId: 'IRCS_RM_02_P' },
            },
            {
                path: 'monitoring/integrated',
                name: 'integratedMonitoring',
                component: () => import('@/pages/main/monitoring/IntegratedMonitoringPage.vue'),
                meta: { screenId: 'IRCS_MC_01_P', title: '통합 관제 모니터링' },
            },
            {
                path: 'monitoring/work',
                name: 'workMonitoring',
                component: () => import('@/pages/main/monitoring/WorkRobotMonitoringPage.vue'),
                meta: { screenId: 'IRCS_MC_02_P', title: '작업 로봇 관제' },
            },
            {
                path: 'monitoring/surveillance',
                name: 'surveillanceMonitoring',
                component: () => import('@/pages/main/monitoring/SurveillanceRobotMonitoringPage.vue'),
                meta: { screenId: 'IRCS_MC_03_P', title: '감시 로봇 관제' },
            },
            {
                path: 'robot-control',
                name: 'robotControl',
                component: () => import('@/pages/main/robotControl/RobotControlPage.vue'),
                meta: { screenId: 'IRCS_RC_01_P', title: '로봇 제어' },
            },
            {
                path: 'admin/missions',
                name: 'missions',
                component: () => import('@/pages/main/admin/missions/MissionManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_MS_01_P',
                    title: '미션 관리',
                    description: 'Activity, Task, Mission 및 자동 수행 스케줄 관리',
                },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404',
    },
    { path: '/403', name: '403', component: () => import('@/pages/errorPage/ForbiddenPage.vue'), meta: { public: true } },
    { path: '/404', name: '404', component: () => import('@/pages/errorPage/NotFoundPage.vue'), meta: { public: true } },
    { path: '/500', name: '500', component: () => import('@/pages/errorPage/ServerErrorPage.vue'), meta: { public: true } },
]
