<template>
    <div ref="chartRef" class="category-bar-chart"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export type CategoryBarChartItem = {
    label: string
    value: number
}

const props = withDefaults(
    defineProps<{
        data: CategoryBarChartItem[]
        name: string
        unit?: string
    }>(),
    {
        unit: '건',
    },
)

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const drawChart = () => {
    if (!chart) {
        return
    }

    chart.setOption({
        color: ['#4ca5d7'],
        grid: {
            top: 8,
            right: 34,
            bottom: 6,
            left: 72,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255,255,255,0.94)',
            borderWidth: 0,
            textStyle: { color: '#18202b' },
            valueFormatter: (value: number) => `${value}${props.unit}`,
        },
        xAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.07)' } },
        },
        yAxis: {
            type: 'category',
            inverse: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: '#c9c1d4',
                fontSize: 11,
                overflow: 'truncate',
                width: 66,
            },
            data: props.data.map(item => item.label),
        },
        series: [
            {
                name: props.name,
                type: 'bar',
                barWidth: 10,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#15e0b7' },
                        { offset: 0.62, color: '#4ca5d7' },
                        { offset: 1, color: '#b866e6' },
                    ]),
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#f8fafc',
                    fontSize: 11,
                    formatter: `{c}${props.unit}`,
                },
                data: props.data.map(item => item.value),
            },
        ],
    })
}

watch(
    () => [props.data, props.name, props.unit],
    drawChart,
    { deep: true },
)

onMounted(() => {
    if (!chartRef.value) {
        return
    }

    chart = echarts.init(chartRef.value)
    resizeObserver = new ResizeObserver(() => {
        chart?.resize()
    })
    resizeObserver.observe(chartRef.value)
    drawChart()
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    chart?.dispose()
})
</script>

<style scoped>
.category-bar-chart {
    width: 100%;
    height: 100%;
    min-height: 0;
}
</style>
