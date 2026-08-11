<template>
    <el-container class="layout-shell">
        <aside class="left-wrapper" :class="collapsed ? 'is-collapse' : 'is-expand'">
            <slot name="sidebar"></slot>
        </aside>
        <el-container class="right-wrapper">
            <el-header>
                <slot name="header"></slot>
            </el-header>
            <el-main>
                <MainContent>
                    <slot></slot>
                </MainContent>
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts" setup>
import MainContent from '@/layouts/MainContent.vue'

withDefaults(
    defineProps<{
        collapsed?: boolean
    }>(),
    {
        collapsed: false,
    },
)
</script>

<style scoped lang="scss">
.layout-shell {
    height: 100%;
    display: flex;
    flex-direction: row;
    background: #090d16;
    overflow: hidden;
}

.left-wrapper {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--layout-sidebar-bg-color);
    transition: width 400ms ease;
    overflow: hidden;
}

.left-wrapper.is-expand {
    width: 320px;
}

.left-wrapper.is-collapse {
    width: 60px;
}

.right-wrapper {
    min-width: 0;
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
}

.el-header {
    height: 60px;
    width: 100%;
    align-items: center;
    padding-left: 28px;
    padding-right: 28px;
    background: var(--layout-header-bg-color);
    border-bottom: none;
    box-shadow: var(--layout-header-shadow);
    backdrop-filter: none;
}

.el-main {
    --el-main-padding: 0px;
    color: var(--text-color--primary);
    height: 100%;
    overflow: auto;
    scrollbar-gutter: stable;
}

.el-main::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.el-main::-webkit-scrollbar-thumb:hover,
.el-main::-webkit-scrollbar-track:hover,
.el-main::-webkit-scrollbar-corner:hover {
    cursor: pointer;
}
</style>
