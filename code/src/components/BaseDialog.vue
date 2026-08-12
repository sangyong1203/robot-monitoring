<template>
    <el-dialog
        :model-value="modelValue"
        :width="width"
        :class="dialogClass"
        :fullscreen="fullscreen"
        :style="{ overflow: 'hidden', height, maxHeight: maxHeight ?? '95vh' }"
        :before-close="handleClose"
        :center="footerCenter"
        :close-on-click-modal="closeOnClickModal"
        :close-on-press-escape="closeOnPressEscape"
        :draggable="draggable"
        :align-center="true"
        :destroy-on-close="destroyOnClose"
        :show-close="showClose"
        :header-class="headerClass ?? (hideHeader ? 'hide-header' : '')"
        @update:model-value="emits('update:modelValue', $event)"
        @closed="emits('closed')"
    >
        <template #header>
            <div class="dialog-header">
                <div class="dialog-header-content">
                    <slot name="title"></slot>
                    <span class="dialog-header-title">{{ title }}</span>
                    <span class="dialog-description" v-show="description">{{ '* ' + description }}</span>
                </div>
                <el-icon style="cursor: pointer" color="var(--text-color--primary)" @click="onClose"><X /></el-icon>
            </div>
        </template>

        <slot />

        <template #footer>
            <div class="dialog-footer">
                <div class="delete-btn" v-if="!isEdit">
                    <el-button v-if="buttonTypes?.includes('Delete')" @click="onDelete">Delete</el-button>
                </div>
                <el-button v-if="buttonTypes?.includes('Close')" @click="onClose">Close</el-button>
                <el-button v-if="buttonTypes?.includes('Cancel')" @click="onCancel">Cancel</el-button>
                <el-button
                    type="primary"
                    v-if="buttonTypes?.includes('Save') && (isEdit || !buttonTypes?.includes('Edit'))"
                    @click="onSave"
                    >Save</el-button
                >
                <el-button type="primary" v-if="buttonTypes?.includes('Edit') && !isEdit" @click="onEdit"
                    >Edit</el-button
                >
                <el-button type="primary" v-if="buttonTypes?.includes('Confirm')" @click="onConfirm">Confirm</el-button>
                <el-button type="primary" v-if="buttonTypes?.includes('Select')" @click="onSelect">Select</el-button>
                <el-button type="primary" v-if="buttonTypes?.includes('Add')" @click="onAdd">Add</el-button>
                <el-button type="primary" v-if="buttonTypes?.includes('Reset')" @click="onReset">Reset</el-button>
                <el-button type="primary" v-if="buttonTypes?.includes('Review')" @click="onSave">Review</el-button>
                <el-button type="primary" v-if="buttonTypes?.includes('Reject')" @click="onReject">Reject</el-button>
                <el-button type="primary" v-if="buttonTypes?.includes('Approve')" @click="onApprove">Approve</el-button>
                <slot name="footer"></slot>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'
import { toRefs } from 'vue'

const props = defineProps<{
    modelValue: boolean
    title?: string
    description?: string
    isEdit?: boolean
    buttonTypes?: Array<
        'Save' | 'Edit' | 'Delete' | 'Cancel' | 'Confirm' | 'Select' | 'Reset' | 'Close' | 'Add' | 'Review' | 'Reject' | 'Approve'
    >
    width?: string
    height?: string
    maxHeight?: string
    dialogClass?: string
    headerClass?: string
    footerCenter?: boolean
    fullscreen?: boolean
    hideHeader?: boolean
    closeOnClickModal?: boolean
    closeOnPressEscape?: boolean
    draggable?: boolean
    destroyOnClose?: boolean
    showClose?: boolean
}>()

const {
    modelValue,
    title,
    description,
    isEdit,
    buttonTypes,
    width = '550px',
    height = 'auto',
    maxHeight,
    dialogClass = 'common-dialog',
    headerClass,
    footerCenter,
    fullscreen,
    closeOnClickModal,
    closeOnPressEscape,
    destroyOnClose,
    showClose = false,
    draggable,
} = toRefs(props)

const emits = defineEmits([
    'update:modelValue',
    'closed',
    'onSave',
    'onEdit',
    'onDelete',
    'onCancel',
    'onConfirm',
    'onSelect',
    'onReset',
    'onClose',
    'onAdd',
    'onReject',
    'onApprove',
])

const onSave = () => {
    emits('onSave')
}
const onEdit = () => {
    emits('onEdit')
}
const onConfirm = () => {
    emits('onConfirm')
}
const onSelect = () => {
    emits('onSelect')
    onClose()
}
const onCancel = () => {
    emits('onCancel')
    onClose()
}
const onDelete = () => {
    emits('onDelete')
}
const onClose = () => {
    emits('update:modelValue', false)
    emits('onClose')
}
const handleClose = (done: () => void) => {
    done()
}
const onReset = () => {
    emits('onReset')
}
const onAdd = () => {
    emits('onAdd')
}
const onReject = () => {
    emits('onReject')
}
const onApprove = () => {
    emits('onApprove')
}
</script>

<style lang="scss" scoped>
.dialog-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 4px;

    :deep(.el-icon) {
        width: 24px;
        height: 24px;
        flex-shrink: 0;

        svg {
            width: 24px;
            height: 24px;
        }
    }
}

.dialog-header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    min-width: 0;
    flex: 1;
    padding-right: 16px;
}

.dialog-header-title {
    font-size: 20px;
    line-height: 24px;
    font-weight: 700;
    color: var(--text-color--primary);
}

.dialog-description {
    font-size: 13px;
    color: var(--text-color--secondary);
    line-height: 18px;
    white-space: normal;
    word-break: break-word;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    position: relative;
}

.delete-btn {
    position: absolute;
    left: 20px;
}

.dialog-footer :deep(.el-button.el-button--primary) {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--button-primary-text-color);
}

.dialog-footer :deep(.el-button:not(.el-button--primary)) {
    background: var(--common-control-bg-color);
    border-color: var(--common-control-border-color);
    color: var(--text-color--secondary);
}

.dialog-footer :deep(.el-button) {
    border-radius: 999px;
    min-width: 90px;
    height: 46px;
    font-size: 15px;
}
</style>
