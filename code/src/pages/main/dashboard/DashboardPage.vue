<template>
    <div class="dashboard-page">
        <!-- Top Metric KPI Bar -->
        <div class="dashboard-kpi-grid">
            <div class="kpi-card glass-panel">
                <div class="kpi-icon is-blue">
                    <Bot :size="24" />
                </div>
                <div class="kpi-info">
                    <span class="kpi-label">통합 운영 로봇</span>
                    <div class="kpi-value">
                        <strong>7</strong><sub>대</sub>
                        <span class="kpi-sub green">정상 6대 · 주의 1대</span>
                    </div>
                </div>
            </div>

            <div class="kpi-card glass-panel">
                <div class="kpi-icon is-green">
                    <ShieldCheck :size="24" />
                </div>
                <div class="kpi-info">
                    <span class="kpi-label">방사선 구역 피폭 위험도</span>
                    <div class="kpi-value">
                        <strong>0.02</strong><sub>mSv</sub>
                        <span class="kpi-sub green">안전 범위 (기준 이하)</span>
                    </div>
                </div>
            </div>

            <div class="kpi-card glass-panel">
                <div class="kpi-icon is-purple">
                    <Workflow :size="24" />
                </div>
                <div class="kpi-info">
                    <span class="kpi-label">진행 중 융합 미션</span>
                    <div class="kpi-value">
                        <strong>65</strong><sub>%</sub>
                        <span class="kpi-sub blue">폐기물 이송 및 장입</span>
                    </div>
                </div>
            </div>

            <div class="kpi-card glass-panel">
                <div class="kpi-icon is-orange">
                    <BellRing :size="24" />
                </div>
                <div class="kpi-info">
                    <span class="kpi-label">24시 이벤트 감시</span>
                    <div class="kpi-value">
                        <strong>2</strong><sub>건</sub>
                        <span class="kpi-sub yellow">경고 발생 및 조치 완료</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Dashboard Content Grid -->
        <div class="dashboard-main-grid">
            <!-- Left Panel: Real-time Robot Telemetry (1s interval) -->
            <Panel title="실시간 로봇 7대 현황" subtitle="1초 주기 위치/배터리/통신 실시간 동기화">
                <template #headerRight>
                    <StatusBadge label="1초 실시간 수신" variant="success" />
                </template>

                <div class="robot-status-list">
                    <div
                        v-for="robot in robots"
                        :key="robot.id"
                        class="robot-telemetry-item"
                        :class="{ 'is-stale': robot.communicationStatus === 'STALE' }"
                        @click="goToMonitoring(robot)"
                    >
                        <div class="robot-head">
                            <span class="robot-name">{{ robot.name }}</span>
                            <StatusBadge
                                :label="robot.communicationStatus === 'ONLINE' ? '정상' : '지연'"
                                :variant="robot.communicationStatus === 'ONLINE' ? 'success' : 'warning'"
                            />
                        </div>
                        <div class="robot-metrics">
                            <span>배터리 {{ robot.batteryPercent }}%</span>
                            <span>상태: {{ robot.status }}</span>
                        </div>
                        <div class="robot-coord">
                            <span>X: {{ robot.x.toFixed(2) }}m</span>
                            <span>Y: {{ robot.y.toFixed(2) }}m</span>
                            <span>각도: {{ robot.heading }}°</span>
                        </div>
                    </div>
                </div>
            </Panel>

            <!-- Center Panel: 2D Live Control Map & Fused Mission Timeline -->
            <div class="dashboard-center-panel">
                <Panel title="통합 실시간 2D 관제 지도" subtitle="처분용기 장입 실내 1층 및 외곽 순찰 도면">
                    <template #headerRight>
                        <el-button type="primary" size="small" @click="goToIntegrated">관제 화면 전체보기</el-button>
                    </template>
                    <div class="live-map-wrapper">
                        <svg class="live-map-svg" viewBox="0 0 1200 800">
                            <rect width="100%" height="100%" fill="#0f172a" />
                            <image href="/sample_map/map.png" width="100%" height="100%" preserveAspectRatio="none" opacity="0.75" />
                            <!-- Grid -->
                            <line v-for="i in 12" :key="'h'+i" :x1="i*100" y1="0" :x2="i*100" y2="800" stroke="#334155" stroke-dasharray="4" />
                            <line v-for="i in 8" :key="'v'+i" x1="0" :y1="i*100" x2="1200" :y2="i*100" stroke="#334155" stroke-dasharray="4" />

                            <!-- Robot Markers -->
                            <g
                                v-for="robot in indoorRobots"
                                :key="robot.id"
                                :transform="`translate(${robot.x * 15 + 100}, ${robot.y * 15 + 100})`"
                                class="map-robot-marker"
                            >
                                <circle r="14" fill="#3b82f6" stroke="#fff" stroke-width="2.5" />
                                <text x="18" y="5" fill="#fff" font-size="14" font-weight="700">{{ robot.name }}</text>
                            </g>
                        </svg>
                    </div>
                </Panel>

                <Panel title="폐기물 이송 및 장입 융합 미션 진행 상황" subtitle="무인지게차 → AMR 1·2호기 → 산업용 로봇 교대 순차 연계">
                    <div class="fused-mission-timeline">
                        <div class="timeline-step is-done">
                            <span class="step-num">1</span>
                            <span class="step-title">무인지게차</span>
                            <span class="step-desc">팰릿 상차 완료</span>
                        </div>
                        <div class="timeline-arrow">➔</div>
                        <div class="timeline-step is-active">
                            <span class="step-num">2</span>
                            <span class="step-title">AMR 1호기</span>
                            <span class="step-desc">처분용기 앞 이동 중</span>
                        </div>
                        <div class="timeline-arrow">➔</div>
                        <div class="timeline-step">
                            <span class="step-num">3</span>
                            <span class="step-title">산업용 로봇</span>
                            <span class="step-desc">드럼 정밀 장입 대기</span>
                        </div>
                        <div class="timeline-arrow">➔</div>
                        <div class="timeline-step">
                            <span class="step-num">4</span>
                            <span class="step-title">AMR 2호기</span>
                            <span class="step-desc">다음 팰릿 교대 대기</span>
                        </div>
                    </div>
                </Panel>

                <Panel title="실행 중인 미션 목록" subtitle="현재 진행 중인 Mission/Task와 담당 로봇">
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
                                <span>담당 {{ mission.robotName }}</span>
                                <span>진행률 {{ mission.progress }}%</span>
                                <span>ETA {{ mission.eta }}</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            <!-- Right Panel: Charts & Emergency Action -->
            <div class="dashboard-right-panel">
                <Panel title="로봇 가동 상태 분포">
                    <DonutStatusChart
                        :normal="6"
                        :warning="1"
                        :total="7"
                        normal-label="정상 작동"
                        warning-label="통신 지연"
                        summary-label="가동률 85%"
                    />
                </Panel>

                <Panel title="시간별 로봇 가동률 트렌드">
                    <TrendAreaChart
                        :data="trendData"
                        name="가동률"
                        unit="%"
                    />
                </Panel>

                <Panel title="안전 이벤트/알람 피드" subtitle="최근 안전 이벤트 및 조치 상태">
                    <div class="safety-event-feed">
                        <div v-for="event in safetyEvents" :key="event.id" class="safety-event-item" :class="`is-${event.severity}`">
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

                <Panel title="긴급 비상 조치 툴바">
                    <div class="emergency-toolbar">
                        <el-button type="danger" style="width: 100%" @click="triggerSafeStop">
                            전체 로봇 Safe Stop 발송
                        </el-button>
                        <el-button type="warning" style="width: 100%" @click="triggerEStop">
                            원격 E-Stop 비상정지
                        </el-button>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Panel from '@/components/Panel.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DonutStatusChart from '@/components/charts/DonutStatusChart.vue'
import TrendAreaChart from '@/components/charts/TrendAreaChart.vue'
import { Bot, ShieldCheck, Workflow, BellRing } from '@lucide/vue'
import { simulationService } from '@/services/simulation.service'
import type { MonitoringRobot } from '@/features/monitoring/service/integrated/integratedMonitoring.types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const robots = ref<MonitoringRobot[]>([])
let unsubscribeSim: (() => void) | null = null

onMounted(() => {
    unsubscribeSim = simulationService.subscribe((updatedRobots) => {
        robots.value = updatedRobots
    })
})

onBeforeUnmount(() => {
    if (unsubscribeSim) unsubscribeSim()
})

const indoorRobots = computed(() => robots.value.filter(r => r.mapId === 1))

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
        robotName: '4족 보행 로봇 1호기 (Spot)',
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

const trendData = ref([
    { measured_at: '09:00', metric_value: 80 },
    { measured_at: '09:05', metric_value: 85 },
    { measured_at: '09:10', metric_value: 90 },
    { measured_at: '09:15', metric_value: 88 },
    { measured_at: '09:20', metric_value: 92 },
    { measured_at: '09:25', metric_value: 87 },
])

const goToIntegrated = () => {
    router.push('/monitoring/integrated')
}

const goToMonitoring = (robot: MonitoringRobot) => {
    if (robot.robotType === 'WORK') router.push('/monitoring/work')
    else router.push('/monitoring/surveillance')
}

const triggerSafeStop = async () => {
    try {
        await ElMessageBox.confirm('전체 운영 로봇에 Safe Stop을 발송하시겠습니까?', 'Safe Stop 경보', { type: 'warning' })
        ElMessage.warning('전체 로봇에 Safe Stop 명령이 발송되었습니다.')
    } catch {
        // Cancelled
    }
}

const triggerEStop = async () => {
    try {
        await ElMessageBox.confirm('원격 비상정지(E-Stop)를 즉시 집행하시겠습니까?', '원격 E-Stop 비상집행', { type: 'error' })
        ElMessage.error('원격 E-Stop 비상정지가 집행되었습니다.')
    } catch {
        // Cancelled
    }
}
</script>

<style scoped lang="scss">
.dashboard-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.dashboard-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
}

.glass-panel {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.is-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    &.is-green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    &.is-purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
    &.is-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
}

.kpi-info {
    display: flex;
    flex-direction: column;
}

.kpi-label {
    font-size: 13px;
    color: var(--text-color--secondary);
}

.kpi-value {
    display: flex;
    align-items: baseline;
    gap: 4px;

    strong { font-size: 26px; font-weight: 700; color: #fff; }
    sub { font-size: 14px; color: #94a3b8; }
}

.kpi-sub {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 500;

    &.green { color: #22c55e; }
    &.blue { color: #3b82f6; }
    &.yellow { color: #f59e0b; }
}

.dashboard-main-grid {
    display: grid;
    grid-template-columns: 340px 1fr 320px;
    gap: 16px;
}

.robot-status-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 640px;
    overflow-y: auto;
}

.robot-telemetry-item {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
    }
}

.robot-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .robot-name { font-weight: 600; font-size: 14px; color: #fff; }
}

.robot-metrics, .robot-coord {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}

.dashboard-center-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.live-map-wrapper {
    width: 100%;
    height: 380px;
    border-radius: 8px;
    overflow: hidden;
    background: #0f172a;
}

.live-map-svg {
    width: 100%;
    height: 100%;
}

.fused-mission-timeline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
}

.timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;

    .step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #334155;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
    }

    .step-title { font-weight: 600; font-size: 13px; color: #cbd5e1; }
    .step-desc { font-size: 11px; color: #64748b; }

    &.is-done .step-num { background: #22c55e; color: #fff; }
    &.is-active .step-num { background: #3b82f6; color: #fff; }
    &.is-active .step-title { color: #3b82f6; }
}

.timeline-arrow {
    color: #475569;
    font-size: 18px;
}

.running-mission-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.running-mission-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
}

.mission-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.mission-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;

    strong {
        color: #ffffff;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    span {
        color: #94a3b8;
        font-size: 12px;
    }
}

.mission-row--meta {
    color: #94a3b8;
    font-size: 12px;
}

.mission-progress-track {
    position: relative;
    height: 6px;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.9);
    border-radius: 999px;
}

.mission-progress-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: linear-gradient(90deg, #38bdf8, #a855f7);
    border-radius: inherit;
}

.dashboard-right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.safety-event-feed {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.safety-event-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 11px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-left-width: 3px;
    border-radius: 8px;

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

.event-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    strong {
        color: #ffffff;
        font-size: 13px;
    }
}

.event-message {
    color: #cbd5e1;
    font-size: 12px;
    line-height: 1.4;
}

.event-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: #64748b;
    font-size: 11px;
}

.emergency-toolbar {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
