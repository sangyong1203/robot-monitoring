<template>
    <div class="radio-toggle-group">
        <el-radio-group
            :model-value="modelValue"
            :disabled="disabled"
            class="radio-toggle-group__inner"
            @update:model-value="onUpdate"
        >
            <el-radio-button
                v-for="opt in options"
                :key="String(opt.value)"
                :value="opt.value"
            >
                {{ opt.label }}
            </el-radio-button>
        </el-radio-group>
    </div>
</template>

<script setup lang="ts">
export type RadioToggleOption = {
    label: string
    value: string | number | boolean
}

withDefaults(
    defineProps<{
        modelValue: string | number | boolean
        options: RadioToggleOption[]
        disabled?: boolean
    }>(),
    {
        disabled: false,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | boolean): void
}>()

const onUpdate = (val: string | number | boolean | undefined) => {
    if (val !== undefined) {
        emit('update:modelValue', val)
    }
}
</script>

<style scoped lang="scss">
.radio-toggle-group {
    display: flex;
    width: 100%;
}

.radio-toggle-group__inner {
    display: flex;
    width: 100%;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 3px;

    :deep(.el-radio-button) {
        flex: 1;
        display: flex;

        .el-radio-button__inner {
            width: 100%;
            background: transparent;
            border: 1px solid transparent !important;
            border-radius: 6px;
            color: var(--text-color--secondary);
            box-shadow: none !important;
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
            padding: 8px 16px;
            font-weight: 500;

            &:hover {
                color: var(--primary-color);
            }
        }

        &.is-active .el-radio-button__inner {
            background: var(--primary-color-1) !important;
            color: var(--primary-color) !important;
            border-color: var(--border-glass-color) !important;
            font-weight: 700;
        }

        &.is-disabled .el-radio-button__inner {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}
</style>
