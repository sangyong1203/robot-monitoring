<template>
    <div class="meter-bar">
        <span v-if="hasLabel" class="meter-bar__label">{{ label }}</span>
        <div class="meter-bar__track" :style="{ height: height }">
            <div
                class="meter-bar__fill"
                :style="{ width: `${clampedPercent}%`, background: barColor }"
            ></div>
        </div>
        <strong v-if="hasValue" class="meter-bar__value">{{ value }}</strong>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        percent: number
        label?: string
        value?: string | number
        color?: string
        height?: string
    }>(),
    {
        label: undefined,
        value: undefined,
        color: undefined,
        height: '5px',
    },
)

const hasLabel = computed(() => props.label !== undefined && props.label !== null && props.label !== '')
const hasValue = computed(() => props.value !== undefined && props.value !== null && props.value !== '')

const clampedPercent = computed(() => Math.max(0, Math.min(100, props.percent)))

const barColor = computed(() => {
    if (props.color) return props.color
    if (clampedPercent.value > 50) return 'linear-gradient(90deg, #22c55e, #10b981)'
    if (clampedPercent.value > 20) return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return 'linear-gradient(90deg, #ef4444, #dc2626)'
})
</script>

<style scoped lang="scss">
.meter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    &__label {
        font-size: 11px;
        color: var(--text-color--secondary, #94a3b8);
        white-space: nowrap;
    }

    &__track {
        flex: 1;
        background: var(--surface-color, rgba(255, 255, 255, 0.08));
        border-radius: 999px;
        overflow: hidden;
    }

    &__fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.3s ease;
    }

    &__value {
        font-size: 11px;
        color: var(--text-color--white, #f8fafc);
        white-space: nowrap;
        min-width: 28px;
        text-align: right;
    }
}
</style>
