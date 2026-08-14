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
                meta: { screenId: 'IRCS_DB_01_P', title: '대시보드' },
            },
            {
                path: 'admin/organizations',
                alias: ['settings/institutions'],
                name: 'organizations',
                component: () => import('@/pages/main/admin/organizations/OrganizationManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_SS_01_P',
                    title: '기관 및 사이트 관리',
                    description: 'KORAD 본사, 지역 본부, 하위 시설 및 관제 사이트 조직 구조 관리',
                },
            },
            {
                path: 'admin/users',
                alias: ['settings/users'],
                name: 'users',
                component: () => import('@/pages/main/admin/users/UserManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_SS_02_P',
                    title: '사용자 관리',
                    description: '시스템 계정 생성, 소속 기관 배정 및 역할별 접근 권한 설정',
                },
            },
            {
                path: 'admin/maps',
                alias: ['spaces/maps'],
                name: 'maps',
                component: () => import('@/pages/main/admin/maps/MapManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_SM_01_P',
                    title: '지역 / 구역 / 지도 관리',
                    description: '2D 공간 도면 업로드, 스케일 해상도 및 레이어 기준점 설정',
                },
            },
            {
                path: 'admin/destinations',
                alias: ['spaces/pois'],
                name: 'destinations',
                component: () => import('@/pages/main/admin/destinations/DestinationManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_SM_03_P',
                    title: '목적지 관리',
                    description: '로봇 이동 목표 좌표(POI), 정지 충전 노드 및 주요 경유지 설정',
                },
            },
            {
                path: 'admin/robot-models',
                alias: ['robots/models'],
                name: 'robotModels',
                component: () => import('@/pages/main/admin/robotModels/RobotModelManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_RM_01_P',
                    title: '로봇 모델 관리',
                    description: '제조사별 로봇 제원, 통신 규격 및 제어 프로토콜 파라미터 등록',
                },
            },
            {
                path: 'admin/operating-robots',
                alias: ['robots/devices'],
                name: 'operatingRobots',
                component: () => import('@/pages/main/admin/operatingRobots/OperatingRobotManagementPage.vue'),
                meta: {
                    screenId: 'IRCS_RM_02_P',
                    title: '운영 로봇 관리',
                    description: '현장 배치 로봇 식별 ID, 시리얼 번호 및 IP/ROS 연결 상태 등록',
                },
            },
            {
                path: 'monitoring/integrated',
                name: 'integratedMonitoring',
                component: () => import('@/pages/main/monitoring/IntegratedMonitoringPage.vue'),
                meta: {
                    screenId: 'IRCS_MC_01_P',
                    title: '통합 관제 모니터링',
                    description: '전체 로봇 실시간 위치, 가동 상태 및 2D 맵 동시 모니터링',
                },
            },
            {
                path: 'monitoring/work',
                name: 'workMonitoring',
                component: () => import('@/pages/main/monitoring/WorkRobotMonitoringPage.vue'),
                meta: {
                    screenId: 'IRCS_MC_02_P',
                    title: '작업 로봇 관제',
                    description: '무인지게차·AMR·산업용 로봇 작업 프로세스 및 텔레메트리 관제',
                },
            },
            {
                path: 'monitoring/surveillance',
                name: 'surveillanceMonitoring',
                component: () => import('@/pages/main/monitoring/SurveillanceRobotMonitoringPage.vue'),
                meta: {
                    screenId: 'IRCS_MC_03_P',
                    title: '감시 로봇 관제',
                    description: 'Spot 4족 보행, 편심 및 실외 자율주행 순찰 영상 실시간 관제',
                },
            },
            {
                path: 'robot-control',
                name: 'robotControl',
                component: () => import('@/pages/main/robotControl/RobotControlPage.vue'),
                meta: {
                    screenId: 'IRCS_RC_01_P',
                    title: '로봇 제어',
                    description: '개별/그룹 로봇 수동 제어, 비상 정지(E-Stop) 및 제어 명령 집행',
                },
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
