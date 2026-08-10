<template>
    <div class="main-content">
        <slot></slot>
    </div>
</template>

<style scoped lang="scss">
.main-content {
    position: relative;
    display: flex;
    width: 100%;
    min-width: 1180px;
    min-height: 100%;
    flex-direction: column;
    padding: 10px 20px 28px 28px;
    box-sizing: border-box;
}
</style>
