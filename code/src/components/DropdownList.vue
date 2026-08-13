<template>
    <div
        class="dropdown-list"
        :style="{ width: width }"
        :class="labelPosition === 'top' ? 'label-position-top' : 'label-position-left'"
    >
        <div
            v-if="label"
            class="dropdown-list_label"
            :style="{ width: labelWidth ?? '', fontWeight: fontWeight ?? '', fontSize: fontSize ?? '' }"
        >
            {{ label }}
        </div>
        <el-select-v2
            v-if="virtualized"
            :model-value="modelValue"
            :options="filteredNormalizedOptions"
            :placeholder="displayPlaceholder"
            :style="{ flex: selectionWidth ? 'unset' : 1, width: selectionWidth }"
            :size="size"
            :multiple="multiple"
            :multiple-limit="multipleLimit"
            :clearable="clearable"
            :collapse-tags="collapseTags"
            :suffix-icon="ChevronDown"
            @change="onChange"
            :disabled="disabled"
            :popper-class="popperClass"
            @visible-change="handleVisibleChange"
        >
            <template v-if="popoverSearchable" #header>
                <div class="dropdown-list__popover-search" @click.stop>
                    <el-input
                        v-model="searchKeyword"
                        placeholder="Search"
                        clearable
                        :suffix-icon="Search"
                        @click.stop
                    />
                </div>
            </template>
        </el-select-v2>
        <el-select
            v-else
            :model-value="modelValue"
            :placeholder="displayPlaceholder"
            :style="{ flex: selectionWidth ? 'unset' : 1, width: selectionWidth }"
            :size="size"
            :multiple="multiple"
            :multiple-limit="multipleLimit"
            :clearable="clearable"
            :collapse-tags="collapseTags"
            @change="onChange"
            :disabled="disabled"
            :popperClass="popperClass"
            :suffix-icon="ChevronDown"
            @visible-change="handleVisibleChange"
        >
            <template v-if="popoverSearchable" #header>
                <div class="dropdown-list__popover-search" @click.stop>
                    <el-input
                        v-model="searchKeyword"
                        placeholder="Search"
                        clearable
                        :suffix-icon="Search"
                        @click.stop
                    />
                </div>
            </template>
            <el-option
                v-for="(item, index) in filteredList"
                :key="index"
                :label="item[optionLabel]"
                :value="item[optionValue]"
            >
                <span>{{ item[optionLabel] }}</span>
                <img v-if="item.icon" style="height: 18px; float: right" :src="item.icon" />
            </el-option>
        </el-select>
    </div>
</template>

<script lang="ts" setup>
import { ChevronDown, Search } from '@lucide/vue'
import { computed, ref, toRefs } from 'vue'

export interface Props {
    label?: string | null
    labelWidth?: string
    selectionWidth?: string
    fontWeight?: string
    fontSize?: string
    width?: string
    size?: '' | 'default' | 'small' | 'large'
    placeholder?: string | null
    multiple?: boolean
    multipleLimit?: number
    modelValue: any
    disabled?: boolean
    optionLabel: string
    optionValue: string
    optionIcon?: string
    list: any[]
    popperClass?: string
    clearable?: boolean
    collapseTags?: boolean
    labelPosition?: 'top' | 'left'
    virtualized?: boolean
    popoverSearchable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    clearable: true,
    collapseTags: true,
    popoverSearchable: false,
})
const {
    label,
    width,
    size,
    placeholder,
    multiple,
    multipleLimit,
    modelValue,
    disabled,
    optionLabel,
    optionValue,
    list,
    clearable,
    labelPosition,
    virtualized,
    popoverSearchable,
} = toRefs(props)

const emits = defineEmits(['update:modelValue', 'onChange'])

const searchKeyword = ref('')

const displayPlaceholder = computed(() => {
    if (placeholder?.value) return placeholder.value
    if (label?.value) return `${label.value} 선택`
    return '선택'
})

const filteredList = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()

    if (!keyword) {
        return list.value
    }

    return list.value.filter(item =>
        String(item[optionLabel.value] ?? '')
            .toLowerCase()
            .includes(keyword),
    )
})

const filteredNormalizedOptions = computed(() =>
    filteredList.value.map(item => ({
        label: item[optionLabel.value],
        value: item[optionValue.value],
    })),
)

const handleVisibleChange = (visible: boolean) => {
    if (!visible) {
        searchKeyword.value = ''
    }
}

const onChange = (value: any) => {
    if (multiple.value) {
        if (value.at(-1) === 'all') {
            emits('update:modelValue', ['all'])
        } else {
            const result = value.filter((item: any) => item !== 'all')
            emits('update:modelValue', result)
        }
        emits('onChange', value)
    } else {
        emits('update:modelValue', value)
        emits('onChange', value)
    }
}
</script>

<style scoped lang="scss">
.dropdown-list {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--text-color--primary);
}
.dropdown-list_label {
    color: var(--text-color--primary);
    white-space: nowrap;
    line-height: 20px;
}
.dropdown-list :deep(.el-select) {
    width: 100%;
}
.dropdown-list :deep(.el-select__wrapper) {
    min-height: 36px;
    padding: 4px 20px;
    border-radius: 999px;
    background: var(--common-control-bg-color);
    box-shadow: 0 0 0 1px var(--common-control-border-color) inset;
}
.dropdown-list :deep(.el-select__selected-item),
.dropdown-list :deep(.el-select__placeholder) {
    font-size: 15px;
}
.dropdown-list :deep(.el-select__selected-item) {
    color: var(--text-color--primary);
}
.dropdown-list :deep(.el-select__placeholder) {
    color: var(--text-color--placeholder);
}
.dropdown-list :deep(.el-select__caret) {
    color: var(--text-color--secondary);
}
.label-position-top {
    flex-direction: column;
    align-items: flex-start;
}
.dropdown-list :deep(.el-select__selected-item) {
    .el-tag {
        background-color: var(--primary-color-1) !important;
        border-radius: 20px;
        color: var(--text-color--white);
    }
}
</style>

<style lang="scss">
.dropdown-list__popover-search {
    background: var(--surface-elevated-color);

    .el-input__wrapper {
        border-radius: 10px;
    }
}
</style>
