<template>
    <span class="status-badge" :class="variantClass" :style="{ minWidth }">
        {{ label || '-' }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'progress' | 'muted'

const props = withDefaults(
    defineProps<{
        label: string
        variant?: StatusBadgeVariant
        minWidth?: string
    }>(),
    {
        variant: 'muted',
        minWidth: '52px',
    },
)

const variantClass = computed(() => `is-${props.variant}`)
</script>

<style scoped lang="scss">
.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
}

.status-badge.is-success {
    color: var(--secondary-color);
    border: 1px solid color-mix(in srgb, var(--secondary-color) 42%, transparent);
    background: color-mix(in srgb, var(--secondary-color) 10%, transparent);
}

.status-badge.is-warning {
    color: var(--warning-color);
    border: 1px solid color-mix(in srgb, var(--warning-color) 44%, transparent);
    background: color-mix(in srgb, var(--warning-color) 10%, transparent);
}

.status-badge.is-danger {
    color: var(--danger-color);
    border: 1px solid color-mix(in srgb, var(--danger-color) 46%, transparent);
    background: color-mix(in srgb, var(--danger-color) 10%, transparent);
}

.status-badge.is-info {
    color: var(--info-color);
    border: 1px solid color-mix(in srgb, var(--info-color) 38%, transparent);
    background: color-mix(in srgb, var(--info-color) 10%, transparent);
}

.status-badge.is-progress {
    color: var(--primary-color);
    border: 1px solid color-mix(in srgb, var(--primary-color) 46%, transparent);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
}

.status-badge.is-muted {
    color: var(--text-color--secondary);
    border: 1px solid color-mix(in srgb, #ffffff 18%, transparent);
    background: color-mix(in srgb, #ffffff 6%, transparent);
}
</style>
