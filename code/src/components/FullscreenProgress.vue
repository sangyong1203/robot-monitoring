<template>
    <div
        v-if="progressStore.isProgressing"
        class="fullscreen-progress"
        role="status"
        aria-live="polite"
        aria-label="파일 업로드 진행 상태"
    >
        <div class="fullscreen-progress__content">
            <el-progress
                class="fullscreen-progress__bar"
                :percentage="progressStore.percentCompleted"
                :stroke-width="10"
                striped
                striped-flow
                :duration="10"
            />
            <p class="fullscreen-progress__message">
                <span v-if="progressStore.percentCompleted !== 100">
                    파일을 업로드하고 있습니다.
                </span>
                <span v-if="progressStore.percentCompleted === 100">
                    업로드가 완료되어 서버 처리를 기다리고 있습니다.
                </span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useProgress } from '@/composables/useProgressBar'
const progressStore = useProgress()
</script>

<style lang="scss" scoped>
.fullscreen-progress {
    position: fixed;
    inset: 0;
    z-index: 5000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background-color: var(--overlay-backdrop-bg);
}

.fullscreen-progress__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: min(500px, calc(100vw - 48px));
    min-height: 160px;
    color: white;
}

.fullscreen-progress__bar {
    width: 100%;
}

.fullscreen-progress__message {
    margin: 16px 0 0;
    text-align: center;
}

:deep(.el-progress__text span) {
    color: white;
}
</style>
