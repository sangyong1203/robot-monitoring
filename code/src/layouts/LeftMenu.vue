<template>
    <div class="menu-bar" :class="appStore.isSidebarCollapsed ? 'collapse' : 'not-collapse'" ref="leftWrapperRef">
        <el-menu
            :default-active="defaultMenu"
            mode="vertical"
            class="left-menu"
            :collapse="appStore.isSidebarCollapsed"
            :collapse-transition="false"
            :unique-opened="true"
            :router="true"
            @select="handleSelect"
            @click.stop="onClickMenu"
        >
            <template v-for="(item, idx) in menu" :key="idx">
                <template v-if="item.useYn === 'Y'">
                    <el-menu-item v-if="item.children.length === 0" class="top-menu-entry" :index="item.path">
                        <AppIcon :name="item.icon" class="menu-icon"></AppIcon>
                        <template #title>
                            <span class="menu-title">{{ item.title }}</span>
                        </template>
                    </el-menu-item>

                    <el-sub-menu
                        v-else
                        class="top-menu-entry"
                        :index="item.path || item.id.toString()"
                        :popper-offset="8"
                        popper-class="left-menu-popper"
                    >
                        <template #title>
                            <AppIcon :name="item.icon" class="menu-icon"></AppIcon>
                            <span class="menu-title">{{ item.title }}</span>
                        </template>

                        <template v-for="(child, idx2) in item.children" :key="idx2">
                            <template v-if="child.useYn === 'Y'">
                                <el-menu-item
                                    v-if="child.children.length === 0"
                                    :index="child.path || child.id.toString()"
                                >
                                    <template #title>
                                        <span class="menu-title">{{ child.title }}</span>
                                    </template>
                                </el-menu-item>
                                <el-sub-menu
                                    v-else
                                    :index="child.path || child.id.toString()"
                                    :popper-offset="8"
                                    popper-class="left-menu-popper"
                                >
                                    <template #title>
                                        <span class="menu-title">{{ child.title }}</span>
                                    </template>

                                    <template v-for="(grandChild, idx3) in child.children" :key="idx3">
                                        <el-menu-item
                                            :index="grandChild.path || grandChild.id.toString()"
                                            v-if="grandChild.useYn === 'Y'"
                                        >
                                            {{ grandChild.title }}
                                        </el-menu-item>
                                    </template>
                                </el-sub-menu>
                            </template>
                        </template>
                    </el-sub-menu>
                </template>
            </template>
        </el-menu>
        <el-icon
            class="collapse-btn"
            @click="onClickCollapseBtn"
            :class="appStore.isSidebarCollapsed ? 'btn-collapse' : 'btn-expand'"
        >
            <ChevronLeft />
        </el-icon>
    </div>
</template>

<script lang="ts" setup>
import { ChevronLeft } from '@lucide/vue'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app.store'
import { useMenuStore } from '@/stores/menu.store'

const menuStore = useMenuStore()
const appStore = useAppStore()
const route = useRoute()
const defaultMenu = computed(() => route.path)

const menu = computed(() => menuStore.getMenu())

const onClickMenu = () => {}
const onClickCollapseBtn = () => {
    appStore.toggleSidebar()
}

const setCollapse = () => {
    if (window.innerWidth < 768) {
        appStore.setSidebarCollapsed(true)
    }
}
defineExpose({ setCollapse })

const handleSelect = (path: any) => {
    menuStore.handleClickMenu(path, menu.value)
}

const leftWrapperRef = ref<HTMLElement | null>(null)
const handleClickOutside = (event: MouseEvent) => {
    if (leftWrapperRef.value && !leftWrapperRef.value.contains(event.target as Node)) {
        if (appStore.isSidebarCollapsed === false) {
            setCollapse()
        }
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    onResize()
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', onResize)
})

const onResize = () => {
    if (window.innerWidth < 768) {
        appStore.setSidebarCollapsed(true)
    }
}

onMounted(() => {
    window.addEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
.menu-bar {
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100% - 84px);
    overflow: hidden;
    background: var(--layout-sidebar-bg-color);
    border-right: none;
    box-shadow: none;
    backdrop-filter: none;
}

.menu-bar.collapse {
    width: 60px;
    animation: collapse 0.5s;
}

.menu-bar.not-collapse {
    width: 320px;
    animation: notCollapse 0.5s;
}

.left-menu {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    height: 100%;
    overflow: scroll;
    background: transparent;
    border: none;
    border-color: transparent;
}

.left-menu:not(.el-menu--collapse) {
    border: none;
}

.left-menu > :deep(.el-sub-menu) {
    flex: 0 0 auto;
}

.left-menu::-webkit-scrollbar {
    width: 0;
    height: 0;
    background-color: transparent;
}

.left-menu::-webkit-scrollbar-thumb {
    background-color: transparent;
}

.left-menu .el-button.is-text {
    height: 40px;
    padding: 0;
    border: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    --el-menu-base-level-padding: 20px;

    position: relative;
    display: flex;
    flex: 0 0 50px;
    align-items: center;
    gap: 8px;
    height: 50px;
    min-height: 50px;
    color: var(--text-color--secondary);
    font-family: 'Pretendard', sans-serif;
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
    transition:
        color 160ms ease,
        background-color 160ms ease;
}

:deep(.el-sub-menu .el-menu) {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

:deep(.el-sub-menu .el-menu--inline) {
    padding-top: 4px;
}

:deep(.el-sub-menu__title) {
    width: 100%;
    margin-bottom: 0;
}

:deep(.top-menu-entry.el-menu-item),
:deep(.top-menu-entry > .el-sub-menu__title) {
    width: 100%;
    padding-left: var(--el-menu-base-level-padding);
    padding-right: var(--el-menu-base-level-padding);
}

:deep(.el-sub-menu__icon-arrow) {
    right: 0;
    width: 30px;
}

:deep(.menu-icon) {
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    color: var(--text-color--secondary);
    stroke-width: 2;
}

:deep(.menu-title),
:deep(.el-sub-menu__icon-arrow) {
    min-width: 0;
    opacity: 1;
    transform: translateX(0);
    transition:
        opacity 220ms ease,
        transform 220ms ease,
        max-width 220ms ease;
}

:deep(.menu-title) {
    font: inherit;
    line-height: 20px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu:hover) {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-color--white);
}
:deep(.el-sub-menu__title:hover) {
    background: none;
}

:deep(.el-menu-item:hover .menu-icon),
:deep(.el-sub-menu__title:hover .menu-icon) {
    color: var(--text-color--white);
}

:deep(.el-menu-item.is-active),
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: var(--primary-color) !important;
}

:deep(.el-menu-item.is-active) {
    background: var(--layout-menu-active-bg-color);
}

:deep(.el-menu-item.is-active .menu-icon),
:deep(.el-sub-menu.is-active > .el-sub-menu__title .menu-icon) {
    color: var(--primary-color);
}

.collapse :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    background: var(--layout-menu-active-bg-color);
}

.collapse :deep(.menu-title),
.collapse :deep(.el-sub-menu__icon-arrow) {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    transform: translateX(-8px);
    pointer-events: none;
}

.collapse :deep(.el-menu--collapse) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 60px !important;
    min-width: 60px;
    max-width: 60px;
    overflow: hidden;
}

.collapse :deep(.el-menu-item .el-menu-tooltip__trigger) {
    justify-content: center;
    padding: 0;
}

.collapse .left-menu > :deep(.top-menu-entry) {
    width: 60px !important;
    min-width: 60px;
    max-width: 60px;
    margin: 0;
}

.collapse :deep(.el-sub-menu) {
    display: block;
    height: 50px;
}

.collapse :deep(.top-menu-entry.el-menu-item),
.collapse :deep(.top-menu-entry > .el-sub-menu__title),
.collapse :deep(.el-sub-menu__title) {
    display: flex;
    justify-content: center;
    width: 60px !important;
    min-width: 60px;
    max-width: 60px;
    height: 50px;
    gap: 0;
    margin: 0;
    padding: 0 !important;
}

.collapse :deep(.el-menu-item) {
    width: 60px;
    height: 50px;
}

.collapse-btn {
    position: absolute;
    right: 16px;
    bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: var(--primary-color);
    background: var(--layout-menu-active-bg-color);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition:
        background-color 160ms ease,
        color 160ms ease,
        transform 400ms ease;
}

.collapse-btn:hover {
    color: var(--text-color--white);
    background: var(--layout-purple-glow-color);
}

.collapse-btn svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
}

.btn-collapse {
    transform: rotate(180deg);
}

.btn-expand {
    transform: rotate(0deg);
}

:global(.left-menu-popper),
:global(.left-menu-popper .el-menu--popup),
:global(.left-menu-popper .el-menu-item),
:global(.left-menu-popper .el-sub-menu__title) {
    border: none !important;
    border-radius: 0 !important;
    font-family: 'Pretendard', sans-serif;
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
}

:global(.left-menu-popper .el-popper__arrow::before) {
    border: none !important;
}

@keyframes collapse {
    from {
        width: 320px;
    }

    to {
        width: 60px;
    }
}

@keyframes notCollapse {
    from {
        width: 60px;
    }

    to {
        width: 320px;
    }
}
</style>
