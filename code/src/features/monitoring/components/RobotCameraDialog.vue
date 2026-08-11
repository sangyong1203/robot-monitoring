<template>
    <BaseDialog
        :model-value="visible"
        @update:model-value="$emit('update:visible', $event)"
        class="camera-modal"
        :title="`${robot?.name ?? ''} 실시간 카메라 스트림`"
        width="780px"
    >
        <div class="camera-stream-grid">
            <div class="cam-box">
                <div class="cam-header">CAM 1: 전방 주행 카메라</div>
                <div class="cam-feed-mock">
                    <Camera :size="32" />
                    <span>LIVE STREAM (1080p)</span>
                </div>
            </div>
            <div class="cam-box">
                <div class="cam-header">CAM 2: 로봇 작업/페이로드 카메라</div>
                <div class="cam-feed-mock">
                    <Camera :size="32" />
                    <span>LIVE STREAM (1080p)</span>
                </div>
            </div>
        </div>
    </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@/components/BaseDialog.vue'
import { Camera } from '@lucide/vue'
import type { MonitoringRobot } from '../service/integrated/integratedMonitoring.types'

defineProps<{
    visible: boolean
    robot: MonitoringRobot | null
}>()

defineEmits<{
    (e: 'update:visible', visible: boolean): void
}>()
</script>

<style scoped lang="scss">
.camera-stream-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.cam-box {
    background: #080c14;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);

    .cam-header {
        padding: 8px 12px;
        background: rgba(255,255,255,0.05);
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
    }

    .cam-feed-mock {
        height: 240px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #38bdf8;

        span { font-size: 11px; color: #64748b; letter-spacing: 1px; }
    }
}
</style>
