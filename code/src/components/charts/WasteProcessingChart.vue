<template>
    <div ref="chartRef" class="waste-processing-chart"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

export type WasteProcessingChartItem = {
    hour: string
    drums: number
}

const props = defineProps<{
    data: WasteProcessingChartItem[]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const drawChart = () => {
    if (!chart) {
        return
    }

    chart.setOption({
        color: ['#e76dff'],
        grid: {
            top: 8,
            right: 12,
            bottom: 18,
            left: 34,
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255,255,255,0.94)',
            borderWidth: 0,
            textStyle: { color: '#18202b' },
            valueFormatter: (value: number) => `${value} 드럼/h`,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.16)' } },
            axisTick: { show: false },
            axisLabel: {
                color: '#c9c1d4',
                fontSize: 11,
                interval: 0,
                formatter: (value: string) => `${value}시`,
            },
            data: props.data.map(item => item.hour),
        },
        yAxis: {
            type: 'value',
            nameTextStyle: { color: '#c9c1d4', fontSize: 11 },
            axisLabel: { color: '#c9c1d4' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.07)' } },
        },
        series: [
            {
                name: '시간당 처리량',
                type: 'line',
                smooth: true,
                showSymbol: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    width: 1,
                    color: '#e76dff',
                },
                itemStyle: {
                    color: '#e76dff',
                    borderColor: '#15e0b7',
                    borderWidth: 2,
                },
                areaStyle: {
                    opacity: 0.9,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(231, 109, 255, 0.7)' },
                        { offset: 0.5, color: 'rgba(76, 165, 215, 0.5)' },
                        { offset: 1, color: 'rgba(21, 224, 183, 0.6)' },
                    ]),
                },
                label: {
                    show: false,
                    position: 'top',
                    color: '#f8fafc',
                    fontSize: 11,
                    formatter: '{c}',
                },
                data: props.data.map(item => item.drums),
            },
        ],
    })
}

watch(() => props.data, drawChart, { deep: true })

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
.waste-processing-chart {
    width: 100%;
    height: 100%;
    min-height: 0;
}
</style>
