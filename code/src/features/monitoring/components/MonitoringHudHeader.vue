<template>
    <Panel class="hud-header-panel">
        <div class="hud-header-content">
            <div class="hud-left">
                <div class="live-badge">
                    <span class="pulse-dot"></span>
                    <span class="live-text">LIVE</span>
                </div>
                <div class="hud-title-wrap">
                    <span class="hud-subtitle">{{ updatedLabel }}</span>
                </div>
            </div>

            <div class="hud-metrics">
                <div class="hud-chip">
                    <div class="chip-info">
                        <Bot class="chip-icon text-blue" :size="18" />
                        <span class="chip-label">운영 로봇</span>
                    </div>
                    <strong class="chip-val">{{ snapshot?.counts.total ?? 7 }}대</strong>
                </div>
                <div class="hud-chip">
                    <div class="chip-info">
                        <Radio class="chip-icon text-green" :size="18" />
                        <span class="chip-label">정상 통신</span>
                    </div>
                    <strong class="chip-val text-green">{{ snapshot?.counts.online ?? 6 }}</strong>
                </div>
                <div class="hud-chip">
                    <div class="chip-info">
                        <Zap class="chip-icon text-amber" :size="18" />
                        <span class="chip-label">통신 지연</span>
                    </div>
                    <strong class="chip-val text-amber">{{ snapshot?.counts.stale ?? 1 }}</strong>
                </div>
                <div class="hud-chip">
                    <div class="chip-info">
                        <ShieldAlert class="chip-icon text-red" :size="18" />
                        <span class="chip-label">비상 정지</span>
                    </div>
                    <strong class="chip-val text-red">0</strong>
                </div>
            </div>

            <div class="hud-actions">
                <DropdownList
                    :model-value="selectedMapIds"
                    @update:model-value="$emit('update:selectedMapIds', $event)"
                    :list="snapshot?.maps ?? []"
                    option-label="name"
                    option-value="id"
                    placeholder="관제 지도 선택 (최대 4개)"
                    selection-width="260px"
                    :multiple="true"
                    :multiple-limit="4"
                    :clearable="false"
                />
                <el-button type="danger" class="btn-estop-card" @click="$emit('globalEstop')">
                    <ShieldAlert :size="16" /> 전체 E-STOP (일괄 정지)
                </el-button>
            </div>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import Panel from '@/components/Panel.vue'
import DropdownList from '@/components/DropdownList.vue'
import { Bot, Radio, Zap, ShieldAlert } from '@lucide/vue'
import type { IntegratedMonitoringSnapshot } from '../service/integrated/integratedMonitoring.types'

defineProps<{
    snapshot: IntegratedMonitoringSnapshot | null
    updatedLabel: string
    selectedMapIds: number[]
}>()

defineEmits<{
    (e: 'update:selectedMapIds', ids: number[]): void
    (e: 'globalEstop'): void
}>()
</script>

<style scoped lang="scss">
.hud-header-panel {
    padding: 10px 16px;
    flex-shrink: 0;

    :deep(.panel__body) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
}

.hud-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.hud-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.live-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid #22c55e;
    border-radius: 20px;

    .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 10px #22c55e;
        animation: pulse 1.5s infinite;
    }

    .live-text {
        font-size: 11px;
        font-weight: 700;
        color: #22c55e;
        letter-spacing: 0.5px;
    }
}

@keyframes pulse {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
}

.hud-subtitle {
    display: inline-block;
    font-size: 12px;
    width: 180px;
    color: #94a3b8;
}

.hud-metrics {
    display: flex;
    gap: 10px;
}

.hud-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 6px 12px;
    background: #182238;
    border: 1px solid #283654;
    border-radius: 8px;
    width: 130px;

    .chip-info {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .chip-label { font-size: 12px; color: #cbd5e1; }
    .chip-val { font-size: 15px; font-weight: 700; color: #ffffff; }

    .text-green { color: #22c55e; }
    .text-amber { color: #f59e0b; }
    .text-red { color: #ef4444; }
    .text-blue { color: #3b82f6; }
}

.hud-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-estop-card {
    background: rgba(255, 138, 138, 0.18) !important;
    border: 1px solid #ff8a8a !important;
    color: #ff8a8a !important;
    font-weight: 700 !important;
    transition: all 0.2s ease !important;

    &:hover {
        background: #ff8a8a !important;
        color: #0f172a !important;
    }
}
</style>
