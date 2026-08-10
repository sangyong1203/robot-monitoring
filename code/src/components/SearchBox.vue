<template>
    <div class="search-box" @keyup.enter="onSearch()" :style="{ padding: padding }">
        <div class="search-box-content">
            <div class="upper-row" :style="{ gap: gap }">
                <slot></slot>
            </div>
            <div class="text-right">
                <el-button
                    v-if="!hideSearchButton"
                    :size="size"
                    type="primary"
                    class="query-button"
                    @click="onSearch()"
                    >{{ '조회' }}</el-button
                >
                <slot name="extra-button"></slot>
            </div>
        </div>
        <el-row class="extra-row" v-show="extra">
            <slot name="extra"> </slot>
        </el-row>
    </div>
</template>

<script lang="ts" setup>
export interface Props {
    extra?: boolean
    size?: '' | 'default' | 'small' | 'large'
    gap?: string
    padding?: string
    hideSearchButton?: boolean
    loading?: boolean
    onSearch: (params?: any) => void
}
const { onSearch, extra, size, padding, gap, hideSearchButton = false, loading = false } = defineProps<Props>()
</script>

<style scoped lang="scss">
.search-box {
    border-radius: 36px;
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}
.search-box {
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    // background: #ffffff0a;
    // border: 1px solid rgb(61 61 61 / 24%);
    // box-shadow:
    //     0 7px 12px rgba(0, 0, 0, 0.28),
    //     0 0 18px rgba(231, 109, 255, 0.08),
    //     inset 0 1px 0 rgb(255 255 255 / 10%);
    // background-color: var(--panel-bg-color);
    // border: 1px solid var(--panel-border-color);
    // box-shadow: var(--panel-shadow);
    background-color: var(--panel-bg-color);
}
.search-box-content {
    justify-content: space-between;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 20px 24px;
    min-height: 76px;

    background-color: var(--panel-bg-color);
    border-radius: 99px;
    border: 1px solid var(--panel-border-color);
    box-shadow: var(--panel-shadow);
}
.upper-row {
    flex: 1;
    min-width: 0;
    margin: 0px;
    gap: 12px 24px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.extra-row {
    gap: 12px 24px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 18px 24px;
    min-height: 72px;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
    :deep(.dropdown-list .el-select__wrapper) {
        background-color: var(--common-control-bg-color) !important;
    }
}
.search-box .collaps {
    height: 32px;
    overflow: hidden;
}
.search-box .open {
    height: 100%;
}
.search-box .el-form-item--small.el-form-item {
    margin-bottom: 0px;
}
.search-box .search-btn {
    display: flex;
    justify-content: flex-end;
}
.search-box .el-form-item {
    margin-bottom: 2px;
}
.search-box .el-range-editor.el-input__wrapper {
    padding: 0px 0px 0px 5px;
}
.search-box .el-input-group__prepend {
    background-color: var(--surface-elevated-color);
    border: none;
    padding: 0 10px;
    box-shadow: none;
}
.search-box .text-right {
    display: flex;
    flex-shrink: 0;
    align-items: center;
}

@media (max-width: 768px) {
    .search-box-content {
        align-items: stretch;
        flex-direction: column;
    }

    .upper-row {
        align-items: stretch;
        flex-direction: column;
    }

    :deep(.search-text),
    :deep(.dropdown-list) {
        width: 100% !important;
    }

    .search-box .text-right {
        justify-content: flex-end;
    }
}
</style>
