<template>
    <article class="panel" :class="{ 'is-fill': fill }">
        <header v-if="title || subtitle || total !== undefined || value || $slots.headerRight" class="panel__header">
            <div class="panel__heading" :class="`panel__heading--${subtitlePosition}`">
                <div v-if="title || total !== undefined" class="panel__title-row">
                    <h2 v-if="title">{{ title }}</h2>
                    <span v-if="total !== undefined" class="total-items">총 {{ total }}개</span>
                </div>
                <span v-if="subtitle">{{ subtitle }}</span>
            </div>
            <div v-if="$slots.headerRight" class="panel__header-right">
                <slot name="headerRight"></slot>
            </div>
            <strong v-else-if="value">{{ value }}</strong>
        </header>
        <div class="panel__body">
            <slot></slot>
        </div>
    </article>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        title?: string
        subtitle?: string
        subtitlePosition?: 'right' | 'bottom'
        total?: number
        value?: string
        fill?: boolean
    }>(),
    {
        subtitlePosition: 'bottom',
        fill: false,
    },
)
</script>

<style scoped lang="scss">
.panel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 20px;
    overflow: hidden;
    border-radius: 8px;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);

    // border: 1px solid rgb(61 61 61 / 24%);
    // box-shadow:
    //     0 7px 12px rgba(0, 0, 0, 0.28),
    //     0 0 18px rgba(231, 109, 255, 0.08),
    //     inset 0 1px 0 rgb(255 255 255 / 10%);
    // background: #ffffff0a;
    background-color: var(--panel-bg-color);
    border: 1px solid var(--panel-border-color);
    box-shadow: var(--panel-shadow);
}

.panel.is-fill {
    flex: 1 1 auto;
}

.panel.is-fill :deep(.el-table) {
    flex: 1 1 auto;
    min-height: 0;
}

.panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 14px;
}

.panel__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.panel__title-row h2 {
    margin: 0;
    font-size: 18px;
    letter-spacing: 0;
}

.panel__heading > span {
    color: var(--text-color--secondary);
    font-size: 13px;
}

.total-items {
    color: var(--text-color--secondary);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.panel__header strong {
    color: var(--secondary-color);
    white-space: nowrap;
    margin-top: 2px;
}

.panel__header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
}

.panel__heading {
    display: flex;
    align-items: center;
    min-width: 0;
    min-height: 36px;
}

.panel__heading--bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
}

.panel__heading--right {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
}

.panel__heading--right h2,
.panel__heading--right span {
    white-space: nowrap;
}

.panel__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
}
</style>
