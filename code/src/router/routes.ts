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
        redirect: { name: 'organizations' },
        name: 'main',
        component: () => import('@/pages/main/MainPage.vue'),
        children: [
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
