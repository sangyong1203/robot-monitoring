<template>
    <div class="table-actions">
        <slot />
    </div>
</template>

<style scoped lang="scss">
.table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
}

.table-actions :deep(.el-button) {
    min-width: auto;
    height: auto !important;
    padding: 4px 8px;
    font-size: 13px;
}

.table-actions :deep(.el-button + .el-button) {
    margin-left: 0;
}

.table-actions :deep(.el-button.is-text) {
    display: inline-grid;
    width: 28px;
    height: 28px !important;
    padding: 0;
    place-items: center;
    border: 1px solid transparent !important;
    border-radius: 7px !important;
    font-size: 15px;
    transition:
        color 160ms ease,
        border-color 160ms ease,
        background-color 160ms ease,
        box-shadow 160ms ease,
        transform 120ms ease;
}

.table-actions :deep(.el-button.is-text.el-button--primary) {
    border-color: color-mix(in srgb, var(--primary-color) 18%, transparent) !important;
    background: color-mix(in srgb, var(--primary-color) 8%, transparent) !important;
    color: var(--primary-color) !important;
}

.table-actions :deep(.el-button.is-text.el-button--primary:hover),
.table-actions :deep(.el-button.is-text.el-button--primary:focus-visible) {
    border-color: color-mix(in srgb, var(--primary-color) 48%, transparent) !important;
    background: color-mix(in srgb, var(--primary-color) 18%, transparent) !important;
    color: color-mix(in srgb, var(--primary-color) 70%, var(--slate-1)) !important;
    box-shadow: 0 0 12px color-mix(in srgb, var(--primary-color) 18%, transparent);
}

.table-actions :deep(.el-button.is-text.el-button--danger) {
    border-color: color-mix(in srgb, var(--danger-color) 18%, transparent) !important;
    background: color-mix(in srgb, var(--danger-color) 8%, transparent) !important;
    color: var(--danger-color) !important;
}

.table-actions :deep(.el-button.is-text.el-button--danger:hover),
.table-actions :deep(.el-button.is-text.el-button--danger:focus-visible) {
    border-color: color-mix(in srgb, var(--danger-color) 46%, transparent) !important;
    background: color-mix(in srgb, var(--danger-color) 18%, transparent) !important;
    color: color-mix(in srgb, var(--danger-color) 85%, var(--slate-1)) !important;
    box-shadow: 0 0 12px color-mix(in srgb, var(--danger-color) 16%, transparent);
}

.table-actions :deep(.el-button.is-text.el-button--success) {
    border-color: color-mix(in srgb, var(--secondary-color) 24%, transparent) !important;
    background: color-mix(in srgb, var(--secondary-color) 8%, transparent) !important;
    color: var(--secondary-color) !important;
}

.table-actions :deep(.el-button.is-text.el-button--success:hover),
.table-actions :deep(.el-button.is-text.el-button--success:focus-visible) {
    border-color: color-mix(in srgb, var(--secondary-color) 50%, transparent) !important;
    background: color-mix(in srgb, var(--secondary-color) 16%, transparent) !important;
    color: color-mix(in srgb, var(--secondary-color) 75%, var(--slate-1)) !important;
    box-shadow: 0 0 12px color-mix(in srgb, var(--secondary-color) 16%, transparent);
}

.table-actions :deep(.el-button.is-text:focus-visible) {
    outline: 2px solid color-mix(in srgb, var(--slate-1) 22%, transparent);
    outline-offset: 2px;
}

.table-actions :deep(.el-button.is-text:active:not(.is-disabled)) {
    transform: translateY(1px);
    box-shadow: none;
}

.table-actions :deep(.el-button.is-text.is-disabled) {
    border-color: var(--button-disabled-border-color) !important;
    background: var(--button-disabled-bg-color) !important;
    color: var(--button-disabled-text-color) !important;
    box-shadow: none;
    opacity: 0.48;
}
</style>
