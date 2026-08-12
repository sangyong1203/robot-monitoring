<template>
    <el-tooltip :content="normalizedContent" :placement="placement" :effect="effect" :show-after="showAfter">
        <span class="table-row-tooltip">
            <slot>{{ normalizedContent }}</slot>
        </span>
    </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
type TooltipEffect = 'dark' | 'light'

const props = withDefaults(
    defineProps<{
        content?: string | number | null
        placement?: TooltipPlacement
        effect?: TooltipEffect
        showAfter?: number
    }>(),
    {
        placement: 'top',
        effect: 'dark',
        showAfter: 10,
    },
)

const normalizedContent = computed(() => String(props.content ?? ''))
</script>

<style scoped lang="scss">
.table-row-tooltip {
    display: inline-block;
    vertical-align: middle;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
