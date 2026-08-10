<template>
    <div class="metric-card-row">
        <article v-for="item in items" :key="item.label" class="metric-card" :class="item.variant">
            <div class="metric-card__top">
                <span class="metric-card__label">{{ item.label }}</span>
                <span class="metric-card__unit">{{ item.unit }}</span>
            </div>
            <strong class="metric-card__value">{{ item.value }}</strong>
            <span class="metric-card__hint">{{ item.hint }}</span>
        </article>
    </div>
</template>

<script setup lang="ts">
export type MetricCardItem = {
    label: string
    value: string
    unit: string
    hint: string
    variant?: string
}

defineProps<{
    items: MetricCardItem[]
}>()
</script>

<style scoped lang="scss">
.metric-card-row {
    z-index: 1;
    display: flex;
    gap: 14px;
    margin-bottom: 16px;
}

.metric-card {
    position: relative;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 0;
    padding: 16px 20px;
    overflow: hidden;
    border: 1px solid rgb(61 61 61 / 24%);
    border-radius: 8px;
    box-shadow: var(--panel-shadow);
    background: var(--panel-bg-color);
}

.metric-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
}

.metric-card__label,
.metric-card__hint,
.metric-card__unit {
    color: var(--text-color--secondary);
    font-size: 13px;
}

.metric-card__hint {
    margin-top: 5px;
}

.metric-card__value {
    color: #ffffff;
    font-size: 30px;
    line-height: 34px;
}

@media (max-width: 1180px), (orientation: portrait) {
    .metric-card-row {
        flex-wrap: wrap;
    }
    .metric-card {
        min-width: 280px;
    }
}
</style>
