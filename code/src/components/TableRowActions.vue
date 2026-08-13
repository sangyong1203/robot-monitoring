<template>
    <div class="table-row-actions">
        <button
            class="table-row-actions__button"
            type="button"
            aria-label="수정"
            title="수정"
            @click.stop="emit('edit')"
        >
            <el-icon><Pencil /></el-icon>
        </button>
        <button
            class="table-row-actions__button is-danger"
            type="button"
            aria-label="삭제"
            title="삭제"
            @click.stop="emit('delete')"
        >
            <el-icon><Trash2 /></el-icon>
        </button>
    </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'

const emit = defineEmits<{
    edit: []
    delete: []
}>()
</script>

<style scoped lang="scss">
.table-row-actions {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 48px;
}

.table-row-actions__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--secondary-color);
    font-size: 16px;
    cursor: pointer;
    transition:
        background 0.18s ease,
        color 0.18s ease;
}

.table-row-actions__button.is-danger {
    color: var(--danger-color);
}

.table-row-actions__button:hover {
    background: color-mix(in srgb, var(--secondary-color) 16%, transparent);
}

.table-row-actions__button.is-danger:hover {
    background: color-mix(in srgb, var(--danger-color) 16%, transparent);
}
</style>
