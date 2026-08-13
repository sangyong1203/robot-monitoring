<template>
    <div class="days-checkbox-group">
        <el-checkbox-group
            :model-value="modelValue"
            :disabled="disabled"
            size="small"
            class="days-checkbox-group__inner"
            @update:model-value="emit('update:modelValue', $event as string[])"
        >
            <el-checkbox-button
                v-for="day in options"
                :key="day"
                :value="day"
            >
                {{ day }}
            </el-checkbox-button>
        </el-checkbox-group>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        modelValue: string[]
        options?: string[]
        disabled?: boolean
    }>(),
    {
        options: () => ['월', '화', '수', '목', '금', '토', '일'],
        disabled: false,
    },
)

const emit = defineEmits<{
    'update:modelValue': [value: string[]]
}>()
</script>

<style scoped lang="scss">
.days-checkbox-group {
    display: flex;
    width: 100%;
}

.days-checkbox-group__inner {
    display: flex;
    width: 100%;
    background: var(--panel-bg-color);
    border: 1px solid var(--border-subtle-color);
    border-radius: 8px;
    padding: 3px;
    gap: 4px;

    :deep(.el-checkbox-button) {
        flex: 1;
        display: flex;

        .el-checkbox-button__inner {
            width: 100%;
            text-align: center;
            background: transparent;
            border: 1px solid transparent !important;
            border-radius: 6px !important;
            color: var(--text-color--secondary);
            box-shadow: none !important;
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
            padding: 8px 0;
            font-weight: 500;
        }

        &.is-checked .el-checkbox-button__inner {
            background: var(--primary-color-1) !important;
            color: var(--primary-color) !important;
            border-color: var(--border-glass-color) !important;
            font-weight: 700;
        }

        &.is-focus .el-checkbox-button__inner {
            border-color: transparent !important;
        }
    }
}
</style>
