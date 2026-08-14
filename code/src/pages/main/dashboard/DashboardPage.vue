<template>
    <div class="dashboard-page">
        <section class="dashboard-kpi-strip" aria-label="핵심 운영 지표">
            <div v-for="item in kpiItems" :key="item.label" class="kpi-strip-item">
                <component :is="item.icon" class="kpi-strip-icon" :size="17" />
                <span class="kpi-strip-label">{{ item.label }}</span>
                <strong class="kpi-strip-value">{{ item.value }}</strong>
                <span class="kpi-strip-note" :class="item.variant">{{ item.note }}</span>
            </div>
        </section>

        <section class="dashboard-main-grid">
            <Panel
                class="dashboard-panel running-mission-panel"
                title="현재 진행 중인 미션"
                :total="runningMissions.length"
                fill
            >
                <template #headerRight>
                    <el-button size="small" text type="primary" @click="router.push('/robot-control')"
                        >제어 화면</el-button
                    >
                </template>
                <div class="running-mission-list">
                    <div v-for="mission in runningMissions" :key="mission.id" class="running-mission-item">
                        <div class="mission-row mission-row--top">
                            <div class="mission-title-group">
                                <strong>{{ mission.name }}</strong>
                                <span>{{ mission.currentStep }}</span>
                            </div>
                            <StatusBadge :label="mission.statusLabel" :variant="missionStatusVariant(mission.status)" />
                        </div>
                        <div class="mission-progress-track">
                            <span class="mission-progress-fill" :style="{ width: `${mission.progress}%` }"></span>
                        </div>
                        <div class="mission-row mission-row--meta">
                            <span>{{ mission.robotName }}</span>
                            <span>{{ mission.progress }}%</span>
                            <span>ETA {{ mission.eta }}</span>
                        </div>
                    </div>
                </div>
            </Panel>

            <div class="dashboard-center-column">
                <Panel title="폐기물 처리 통계" class="dashboard-panel">
                    <div class="waste-overview">
                        <div class="waste-summary-grid">
                            <div class="waste-summary-card">
                                <span>오늘 처리</span>
                                <strong>18건</strong>
                            </div>
                            <div class="waste-summary-card">
                                <span>목표 대비</span>
                                <strong>75%</strong>
                            </div>
                            <div class="waste-summary-card">
                                <span>평균 소요</span>
                                <strong>11분</strong>
                            </div>
                        </div>
                        <TrendAreaChart
                            :data="wasteTrendData"
                            name="처리량"
                            unit="건"
                            :grid-top="12"
                            :grid-bottom="16"
                            :show-peak="false"
                        />
                    </div>
                </Panel>

                <div class="center-chart-grid">
                    <Panel title="미션 통계" class="dashboard-panel">
                        <CategoryBarChart :data="missionStats" name="미션" unit="건" />
                    </Panel>
                    <Panel title="이상 감지 통계" class="dashboard-panel">
                        <CategoryBarChart :data="anomalyStats" name="이상 감지" unit="건" />
                    </Panel>
                </div>
            </div>

            <Panel
                class="dashboard-panel robot-overview-panel"
                title="전체 로봇 실시간 상태"
                :total="robots.length"
                fill
            >
                <div class="robot-state-card-list">
                    <button
                        v-for="robot in robots"
                        :key="robot.id"
                        type="button"
                        class="robot-state-card"
                        :class="{ 'is-stale': robot.communicationStatus !== 'ONLINE' }"
                        @click="openRobotDetail(robot)"
                    >
                        <span class="robot-card-head">
                            <span class="robot-name-cell">
                                <strong>{{ robot.name }}</strong>
                                <small>{{ robot.robotType === 'WORK' ? '작업' : '감시' }}</small>
                            </span>
                            <span class="robot-card-head-actions" @click.stop>
                                <button type="button" class="robot-action-btn" @click="goToMonitoring(robot)">
                                    관제
                                </button>
                                <button
                                    v-if="robot.robotType === 'SURVEILLANCE'"
                                    type="button"
                                    class="robot-action-btn"
                                    @click="openCameraModal(robot)"
                                >
                                    카메라
                                </button>
                                <StatusBadge
                                    :label="communicationLabel(robot.communicationStatus)"
                                    :variant="communicationVariant(robot.communicationStatus)"
                                    min-width="44px"
                                />
                            </span>
                        </span>

                        <span class="battery-cell">
                            <span class="battery-track">
                                <span class="battery-fill" :style="{ width: `${robot.batteryPercent}%` }"></span>
                            </span>
                            <strong>{{ robot.batteryPercent }}%</strong>
                        </span>

                        <span class="robot-card-meta">
                            <span>{{ areaLabel(robot) }}</span>
                            <strong class="coord-cell">{{ robot.x.toFixed(1) }}, {{ robot.y.toFixed(1) }}</strong>
                            <span>{{ operationLabel(robot.status) }}</span>
                        </span>
                    </button>
                </div>
            </Panel>
        </section>

        <section class="dashboard-bottom-grid">
            <Panel
                class="dashboard-panel event-feed-panel"
                title="안전 이벤트/알람 피드"
                :total="safetyEvents.length"
                fill
            >
                <div class="safety-event-feed">
                    <div
                        v-for="event in safetyEvents"
                        :key="event.id"
                        class="safety-event-item"
                        :class="`is-${event.severity}`"
                    >
                        <div class="event-head">
                            <strong>{{ event.title }}</strong>
                            <StatusBadge :label="event.statusLabel" :variant="eventStatusVariant(event.severity)" />
                        </div>
                        <div class="event-message">{{ event.message }}</div>
                        <div class="event-meta">
                            <span>{{ event.area }}</span>
                            <time>{{ event.occurredAt }}</time>
                        </div>
                    </div>
                </div>
            </Panel>

            <Panel class="dashboard-panel" title="알림 처리 상태">
                <div class="equipment-error-chart">
                    <CategoryBarChart :data="alertProcessStats" name="알림 처리" unit="건" />
                </div>
            </Panel>

            <Panel class="dashboard-panel" title="장비 에러 통계">
                <div class="equipment-error-chart">
                    <CategoryBarChart :data="equipmentErrors" name="장비 에러" unit="건" />
                </div>
            </Panel>

            <Panel class="dashboard-panel donut-dashboard-panel" title="로봇 통신 상태">
                <DonutStatusChart
                    :normal="communicationCounts.online"
                    :warning="communicationCounts.warning"
                    :total="robots.length || 1"
                    layout="horizontal"
                    :size="158"
                    normal-label="정상"
                    warning-label="지연/오프라인"
                    :summary-label="`정상 ${communicationRate}%`"
                />
            </Panel>

            <Panel class="dashboard-panel donut-dashboard-panel" title="로봇 가동 상태">
                <DonutStatusChart
                    :normal="operationCounts.running"
                    :warning="operationCounts.notRunning"
                    :total="robots.length || 1"
                    layout="horizontal"
                    :size="158"
                    normal-label="운행/작업"
                    warning-label="대기/충전/오류"
                    :summary-label="`가동 ${operationRate}%`"
                />
            </Panel>
        </section>

        <el-dialog
            v-model="robotDetailVisible"
            :title="selectedRobot ? `${selectedRobot.name} 상세 상태` : '로봇 상세 상태'"
            width="560px"
            class="robot-detail-dialog"
        >
            <div v-if="selectedRobot" class="robot-detail-body">
                <div class="robot-detail-summary">
                    <StatusBadge
                        :label="communicationLabel(selectedRobot.communicationStatus)"
                        :variant="communicationVariant(selectedRobot.communicationStatus)"
                    />
                    <StatusBadge :label="operationLabel(selectedRobot.status)" variant="info" />
                </div>
                <dl class="robot-detail-grid">
                    <div>
                        <dt>유형</dt>
                        <dd>{{ selectedRobot.robotType === 'WORK' ? '작업 로봇' : '감시 로봇' }}</dd>
                    </div>
                    <div>
                        <dt>구역</dt>
                        <dd>{{ areaLabel(selectedRobot) }}</dd>
                    </div>
                    <div>
                        <dt>좌표</dt>
                        <dd>X {{ selectedRobot.x.toFixed(2) }} / Y {{ selectedRobot.y.toFixed(2) }}</dd>
                    </div>
                    <div>
                        <dt>방향</dt>
                        <dd>{{ selectedRobot.heading }}°</dd>
                    </div>
                    <div>
                        <dt>배터리</dt>
                        <dd>{{ selectedRobot.batteryPercent }}%</dd>
                    </div>
                    <div>
                        <dt>최근 수신</dt>
                        <dd>
                            {{ selectedRobot.lastSeenAt ? formatDateTime(selectedRobot.lastSeenAt) : '실시간 수신 중' }}
                        </dd>
                    </div>
                </dl>
            </div>
            <template #footer>
                <el-button @click="robotDetailVisible = false">닫기</el-button>
                <el-button type="primary" @click="selectedRobot && goToMonitoring(selectedRobot)"
                    >관제 화면 이동</el-button
                >
                <el-button
                    v-if="selectedRobot?.robotType === 'SURVEILLANCE'"
                    type="primary"
                    plain
                    @click="selectedRobot && openCameraModal(selectedRobot)"
                >
                    카메라 보기
                </el-button>
            </template>
        </el-dialog>

        <RobotCameraDialog v-model:visible="cameraModalVisible" :robot="activeCameraRobot" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DonutStatusChart from '@/components/charts/DonutStatusChart.vue'
import TrendAreaChart from '@/components/charts/TrendAreaChart.vue'
import CategoryBarChart from '@/components/charts/CategoryBarChart.vue'
import RobotCameraDialog from '@/features/monitoring/components/RobotCameraDialog.vue'
import { Bot, BellRing, Radio, Workflow, PackageCheck } from '@lucide/vue'
import { simulationService } from '@/services/simulation.service'
import { formatDateTime } from '@/utils/date.util'
import type {
    CommunicationStatus,
    MonitoringRobot,
} from '@/features/monitoring/service/integrated/integratedMonitoring.types'

const router = useRouter()
const robots = ref<MonitoringRobot[]>([])
const robotDetailVisible = ref(false)
const selectedRobot = ref<MonitoringRobot | null>(null)
const cameraModalVisible = ref(false)
const activeCameraRobot = ref<MonitoringRobot | null>(null)
let unsubscribeSim: (() => void) | null = null

onMounted(() => {
    unsubscribeSim = simulationService.subscribe(updatedRobots => {
        robots.value = updatedRobots
        if (selectedRobot.value) {
            selectedRobot.value =
                updatedRobots.find(robot => robot.id === selectedRobot.value?.id) ?? selectedRobot.value
        }
    })
})

onBeforeUnmount(() => {
    if (unsubscribeSim) {
        unsubscribeSim()
    }
})

type RunningMissionStatus = 'RUNNING' | 'WAITING' | 'PAUSED'

type RunningMissionItem = {
    id: number
    name: string
    currentStep: string
    robotName: string
    progress: number
    eta: string
    status: RunningMissionStatus
    statusLabel: string
}

type SafetyEventSeverity = 'danger' | 'warning' | 'info'

type SafetyEventItem = {
    id: number
    title: string
    message: string
    area: string
    occurredAt: string
    severity: SafetyEventSeverity
    statusLabel: string
}

const runningMissions = ref<RunningMissionItem[]>([
    {
        id: 1,
        name: '[융합] 폐기물 이송 및 처분용기 자동 장입',
        currentStep: 'AMR 1호기 처분용기 앞 이동 중',
        robotName: '저상형 AMR 1호기',
        progress: 65,
        eta: '12분',
        status: 'RUNNING',
        statusLabel: '실행 중',
    },
    {
        id: 2,
        name: '외곽 험지 침입 감시 순찰',
        currentStep: '웨이포인트 #3 열화상 스캔',
        robotName: '4족 보행 로봇 1호기',
        progress: 42,
        eta: '18분',
        status: 'RUNNING',
        statusLabel: '실행 중',
    },
    {
        id: 3,
        name: '장입구역 다음 팰릿 교대 준비',
        currentStep: '무인지게차 상차 완료 대기',
        robotName: 'AMR 2호기',
        progress: 20,
        eta: '대기',
        status: 'WAITING',
        statusLabel: '대기',
    },
])

const safetyEvents = ref<SafetyEventItem[]>([
    {
        id: 1,
        title: '통신 지연 감지',
        message: '편심 자율주행 로봇 1호기 telemetry 지연 3.2초',
        area: 'ZONE C 시설 험지',
        occurredAt: '14:22:18',
        severity: 'warning',
        statusLabel: '확인 필요',
    },
    {
        id: 2,
        title: '저전압 경고',
        message: '감시 로봇 배터리 20% 임계치 접근',
        area: '외곽 순찰 구역',
        occurredAt: '14:18:04',
        severity: 'warning',
        statusLabel: '조치 중',
    },
    {
        id: 3,
        title: 'Safe Stop 테스트 완료',
        message: '정기 안전 점검용 Safe Stop 응답 정상',
        area: '통합 관제',
        occurredAt: '13:55:41',
        severity: 'info',
        statusLabel: '완료',
    },
])

const wasteTrendData = ref([
    { measured_at: '09:00', metric_value: 2 },
    { measured_at: '10:00', metric_value: 5 },
    { measured_at: '11:00', metric_value: 8 },
    { measured_at: '12:00', metric_value: 11 },
    { measured_at: '13:00', metric_value: 15 },
    { measured_at: '14:00', metric_value: 18 },
])

const anomalyStats = ref([
    { label: '통신 지연', value: 4 },
    { label: '경로 이탈', value: 1 },
    { label: '장애물 감지', value: 1 },
    { label: '위치 오차', value: 1 },
    { label: '임무 응답 지연', value: 1 },
])

const missionStats = ref([
    { label: '성공', value: 12 },
    { label: '진행', value: 3 },
    { label: '대기', value: 2 },
    { label: '실패', value: 1 },
])

const equipmentErrors = ref([
    { label: '모터/구동부', value: 1 },
    { label: '배터리', value: 2 },
    { label: '센서 모듈', value: 2 },
    { label: '통신 모듈', value: 1 },
    { label: '카메라/PTZ', value: 1 },
])

const alertProcessStats = ref([
    { label: '미확인', value: 2 },
    { label: '조치 중', value: 1 },
    { label: '완료', value: 5 },
    { label: '에스컬레이션', value: 0 },
])

const communicationCounts = computed(() => {
    const online = robots.value.filter(robot => robot.communicationStatus === 'ONLINE').length
    return {
        online,
        warning: Math.max(robots.value.length - online, 0),
    }
})

const operationCounts = computed(() => {
    const running = robots.value.filter(robot => robot.status === 'RUNNING').length
    return {
        running,
        notRunning: Math.max(robots.value.length - running, 0),
    }
})

const communicationRate = computed(() => {
    if (robots.value.length === 0) {
        return 0
    }
    return Math.round((communicationCounts.value.online / robots.value.length) * 100)
})

const operationRate = computed(() => {
    if (robots.value.length === 0) {
        return 0
    }
    return Math.round((operationCounts.value.running / robots.value.length) * 100)
})

const kpiItems = computed(() => [
    { label: '전체 로봇', value: `${robots.value.length}대`, note: '실시간', icon: Bot, variant: 'info' },
    {
        label: '정상 통신',
        value: `${communicationCounts.value.online}대`,
        note: `${communicationRate.value}%`,
        icon: Radio,
        variant: 'success',
    },
    {
        label: '진행 미션',
        value: `${runningMissions.value.filter(mission => mission.status === 'RUNNING').length}건`,
        note: '진행 중',
        icon: Workflow,
        variant: 'info',
    },
    {
        label: '미확인 알림',
        value: `${safetyEvents.value.filter(event => event.statusLabel !== '완료').length}건`,
        note: '확인 필요',
        icon: BellRing,
        variant: 'warning',
    },
    { label: '오늘 처리량', value: '18건', note: '목표대비 75%', icon: PackageCheck, variant: 'success' },
])

const communicationLabel = (status: CommunicationStatus) =>
    ({ ONLINE: '정상', STALE: '지연', OFFLINE: '오프라인' })[status] ?? '정상'

const communicationVariant = (status: CommunicationStatus) =>
    (({ ONLINE: 'success', STALE: 'warning', OFFLINE: 'danger' }) as const)[status] ?? 'success'

const operationLabel = (status?: string) => {
    const labels: Record<string, string> = {
        RUNNING: '운행 중',
        IDLE: '대기',
        CHARGING: '충전 중',
        ERROR: '오류',
    }
    return labels[status ?? ''] ?? '운행 중'
}

const areaLabel = (robot: MonitoringRobot) => {
    if (robot.mapId === 1) {
        return '대표 지도'
    }
    if (robot.mapId === 2) {
        return '장입 구역'
    }
    if (robot.mapId === 3) {
        return '외곽 순찰'
    }
    return `구역 ${robot.mapId}`
}

const missionStatusVariant = (status: RunningMissionStatus) => {
    switch (status) {
        case 'RUNNING':
            return 'progress'
        case 'WAITING':
            return 'info'
        case 'PAUSED':
            return 'warning'
        default:
            return 'muted'
    }
}

const eventStatusVariant = (severity: SafetyEventSeverity) => {
    switch (severity) {
        case 'danger':
            return 'danger'
        case 'warning':
            return 'warning'
        case 'info':
            return 'info'
        default:
            return 'muted'
    }
}

const openRobotDetail = (robot: MonitoringRobot) => {
    selectedRobot.value = robot
    robotDetailVisible.value = true
}

const openCameraModal = (robot: MonitoringRobot) => {
    activeCameraRobot.value = robot
    cameraModalVisible.value = true
}

const goToMonitoring = (robot: MonitoringRobot) => {
    const route = robot.robotType === 'WORK' ? '/monitoring/work' : '/monitoring/surveillance'
    router.push(route)
}
</script>

<style scoped lang="scss">
.dashboard-page {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) 240px;
    gap: 8px;
    height: calc(100vh - 100px);
    min-height: 720px;
    overflow: hidden;
}

.dashboard-panel {
    min-height: 0;
    padding: 10px;

    :deep(.panel__body) {
        min-height: 0;
    }

    :deep(.panel__header) {
        margin-bottom: 8px;
    }

    :deep(.panel__title-row h2) {
        font-size: 16px;
    }
}

.dashboard-kpi-strip {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
}

.kpi-strip-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
        'icon label value'
        'icon note value';
    align-items: center;
    column-gap: 8px;
    min-width: 0;
    min-height: 58px;
    padding: 9px 12px;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    background: var(--panel-bg-color);
}

.kpi-strip-icon {
    grid-area: icon;
    color: var(--primary-color);
}

.kpi-strip-label {
    grid-area: label;
    color: var(--text-color--secondary, #94a3b8);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.kpi-strip-value {
    grid-area: value;
    color: var(--text-color--primary, #f8fafc);
    font-size: 22px;
    font-weight: 800;
    white-space: nowrap;
}

.kpi-strip-note {
    grid-area: note;
    font-size: 12px;
    font-weight: 700;

    &.success {
        color: var(--secondary-color);
    }
    &.warning {
        color: var(--warning-color);
    }
    &.info {
        color: var(--info-color);
    }
}

.dashboard-main-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    min-height: 0;
}

.dashboard-main-grid > .running-mission-panel {
    grid-column: span 1;
}

.dashboard-main-grid > .dashboard-center-column,
.dashboard-main-grid > .robot-overview-panel {
    grid-column: span 2;
}

.robot-overview-panel {
    :deep(.panel__body) {
        display: flex;
        flex-direction: column;
        height: 0;
        overflow: hidden;
    }
}

.robot-state-card-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 8px;
    min-height: 0;
    overflow-y: auto;
}

.robot-state-card {
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 5px;
    width: 100%;
    min-height: 82px;
    padding: 9px 10px 8px;
    appearance: none;
    background: var(--surface-elevated-color, rgba(30, 41, 59, 0.84));
    color: var(--text-color--secondary, #94a3b8);
    border-color: var(--border-color, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition:
        border-color 0.18s ease,
        background 0.18s ease;

    &:hover {
        background: var(--layout-menu-active-bg-color, rgba(203, 78, 255, 0.16));
        border-color: var(--primary-color, #d946ef);
    }

    &.is-stale {
        border-left: 3px solid var(--warning-color);
    }
}

.robot-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}

.robot-card-head-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    flex-shrink: 0;
}

.robot-name-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    strong {
        color: var(--text-color--primary, #f8fafc);
        font-size: 12px;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    small {
        color: var(--text-color--muted, #64748b);
        font-size: 10px;
    }
}

.battery-cell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 38px;
    align-items: end;
    gap: 8px;
    margin-top: 4px;

    strong {
        color: var(--text-color--primary, #f8fafc);
        font-size: 12px;
        text-align: right;
        line-height: 1;
    }
}

.battery-track {
    display: block;
    height: 5px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--surface-color, rgba(15, 23, 42, 0.9));
}

.battery-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #15e0b7, #4ca5d7);
}

.robot-card-meta {
    display: grid;
    grid-template-columns: minmax(62px, 0.78fr) minmax(72px, 0.88fr) minmax(50px, 0.68fr);
    align-items: center;
    gap: 6px;
    font-size: 11px;
    line-height: 1.2;
}

.coord-cell {
    color: var(--secondary-color);
    font-size: 11px;
    font-weight: 800;
}

.robot-action-btn {
    height: 24px;
    padding: 0 7px;
    border: 1px solid color-mix(in srgb, var(--primary-color, #e76dff) 70%, transparent);
    border-radius: 999px;
    background: var(--primary-color, #e76dff);
    color: #1b0d24;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;

    &:hover {
        background: color-mix(in srgb, var(--primary-color, #e76dff) 82%, #ffffff);
        border-color: color-mix(in srgb, var(--primary-color, #e76dff) 82%, #ffffff);
    }
}

.dashboard-center-column {
    display: grid;
    grid-template-rows: minmax(0, 1.28fr) minmax(0, 0.72fr);
    gap: 8px;
    min-height: 0;
}

.waste-overview {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    height: 100%;
    min-height: 230px;
}

.waste-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
}

.waste-summary-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 10px;
    border-radius: 8px;
    background: var(--surface-color, rgba(15, 23, 42, 0.9));

    span {
        color: var(--text-color--secondary, #94a3b8);
        font-size: 11px;
    }

    strong {
        color: var(--text-color--primary, #f8fafc);
        font-size: 17px;
        line-height: 1;
    }
}

.center-chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    min-height: 0;
}

.running-mission-panel {
    :deep(.panel__body) {
        display: flex;
        flex-direction: column;
        height: 0;
        overflow: hidden;
    }
}

.running-mission-list,
.safety-event-feed {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
    overflow-y: auto;
}

.running-mission-item,
.safety-event-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 9px 10px;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    background: var(--surface-elevated-color, rgba(30, 41, 59, 0.84));
}

.running-mission-item {
    min-height: 98px;
}

.mission-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.mission-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;

    strong {
        color: var(--text-color--primary);
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    span {
        color: var(--text-color--secondary);
        font-size: 12px;
    }
}

.mission-row--meta {
    color: var(--text-color--secondary);
    font-size: 12px;
}

.mission-progress-track {
    position: relative;
    height: 6px;
    overflow: hidden;
    background: var(--surface-color);
    border-radius: 999px;
}

.mission-progress-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: linear-gradient(90deg, #4ca5d7, #e76dff);
    border-radius: inherit;
}

.dashboard-bottom-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    min-height: 0;
}

.event-feed-panel {
    :deep(.panel__body) {
        height: 0;
        overflow: hidden;
    }
}

.donut-dashboard-panel {
    :deep(.panel__body) {
        align-items: center;
        justify-content: center;
        padding-top: 2px;
    }

    :deep(.donut-status-chart.is-horizontal) {
        flex: 0 0 auto;
        gap: 18px;
        min-width: 0;
        justify-content: center;
    }

    :deep(.donut-status-chart__visual) {
        flex: 0 0 158px !important;
        width: 158px !important;
        height: 158px !important;
    }

    :deep(.donut-status-chart__legend) {
        flex: 0 0 96px;
        min-width: 96px;
    }

    :deep(.donut-status-chart__legend li) {
        display: grid;
        grid-template-columns: 8px minmax(0, 1fr) 28px;
        gap: 7px;
        min-width: 0;
    }

    :deep(.donut-status-chart__legend li span:nth-child(2)) {
        white-space: normal;
        word-break: keep-all;
    }

    :deep(.donut-status-chart__legend strong) {
        margin-left: 0;
        text-align: right;
    }
}

.safety-event-item {
    min-height: 82px;
    border-left-width: 3px;

    &.is-danger {
        border-left-color: var(--danger-color);
    }

    &.is-warning {
        border-left-color: var(--warning-color);
    }

    &.is-info {
        border-left-color: var(--info-color);
    }
}

.event-head,
.event-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.event-head strong {
    color: var(--text-color--primary);
    font-size: 13px;
}

.event-message {
    color: var(--text-color--secondary);
    font-size: 12px;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.event-meta {
    color: var(--text-color--muted);
    font-size: 11px;
}

.equipment-error-chart {
    width: 100%;
    height: 100%;
    min-height: 150px;
}

.robot-detail-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.robot-detail-summary {
    display: flex;
    gap: 8px;
}

.robot-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 0;

    div {
        padding: 12px;
        border-radius: 8px;
        background: var(--surface-color);
    }

    dt {
        color: var(--text-color--secondary);
        font-size: 12px;
        margin-bottom: 6px;
    }

    dd {
        margin: 0;
        color: var(--text-color--primary);
        font-size: 14px;
        font-weight: 700;
    }
}

@media (max-width: 1500px) {
    .dashboard-page {
        height: auto;
        overflow: visible;
    }

    .dashboard-kpi-strip {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .dashboard-main-grid,
    .dashboard-bottom-grid {
        grid-template-columns: 1fr;
    }
}
</style>
