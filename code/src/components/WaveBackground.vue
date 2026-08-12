<template>
    <div class="wave-background-container">
        <!-- Static background image layer (Instant dark background on screen entrance) -->
        <div class="static-bg-layer"></div>
        <!-- WebGL Wave Effect canvas (Smooth fade-in on top) -->
        <canvas ref="waveCanvas" :class="['wave-canvas', { 'is-ready': isCanvasReady }]"></canvas>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import defaultBgImageUrl from '@/assets/images/login-bg-image.png'

/**
 * offsetY (수직 시작 위치 오프셋):
    - 기본값: 0
      +0.02처럼 플러스(+) 값을 넣으면 파도 전체 시작 위치가 아래로 내려갑니다.
      -0.02처럼 마이너스(-) 값을 넣으면 파도 전체 시작 위치가 위로 올라갑니다.
    - phaseOffset (파도 시작 모양/위상 오프셋):
      기본값: 0
      1.57 ($\pi/2$), 3.14 ($\pi$) 등의 값을 넣으면 시작할 때 파도의 곡선 모양(마루와 골 지점)을 바꿀 수 있습니다.
    - amplitude (파도 출렁임 진폭 배율):
      기본값: 1.0
      1.5로 높이면 파도의 높낮이가 커지고, 0.7로 줄이면 잔잔해집니다.
 */
const props = withDefaults(
    defineProps<{
        bgImageUrl?: string
        speed?: number //파도 움직임 속도
        offsetY?: number //위 아래로 이동하는 양
        phaseOffset?: number //파도 시작 위상 오프셋
        amplitude?: number //파도 출렁임 진폭 배율
        frequency?: number //파도 굴곡 횟수/밀도 (커브 촘촘함)
    }>(),
    {
        bgImageUrl: defaultBgImageUrl,
        speed: 0.0005,
        offsetY: 0,
        phaseOffset: 0,
        amplitude: 1.5,
        frequency: 20.0,
    }
)

// const cssBgUrl = computed(() => `url("${props.bgImageUrl}")`)
const isCanvasReady = ref(false)

const waveCanvas = ref<HTMLCanvasElement | null>(null)
let animFrameId: number | null = null
let cleanupWave: (() => void) | null = null

const setupWaveAnimation = () => {
    const canvas = waveCanvas.value
    if (!canvas) {
        return null
    }

    const gl =
        (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
    if (!gl) {
        return null
    }

    // Vertex Shader: full-screen quad mapping
    const vsSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main() {
            vUv = vec2((aPosition.x + 1.0) * 0.5, (1.0 - aPosition.y) * 0.5);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `

    // Fragment Shader: GPU per-pixel smooth wave deformation with bilinear filtering
    const fsSource = `
        precision mediump float;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uOffsetY;
        uniform float uPhaseOffset;
        uniform float uAmplitude;
        uniform float uFrequency;

        void main() {
            vec2 uv = vUv;
            
            // Smooth edge fade factor (sine arc 0 -> 1 -> 0) to prevent edge clipping kinks
            float edgeFade = sin(uv.y * 3.14159265);
            
            // Continuous travelling wave propagation per pixel
            float waveY1 = sin(uv.x * uFrequency + uTime * 1.3 + uPhaseOffset) * (0.024 * uAmplitude);
            float waveY2 = cos(uv.x * (uFrequency * 0.6) - uTime * 0.85 + uPhaseOffset) * (0.015 * uAmplitude);
            float waveY3 = sin(uv.x * (uFrequency * 1.5) + uTime * 1.9 + uPhaseOffset) * (0.006 * uAmplitude);
            
            float waveX1 = sin(uv.y * 7.0 + uTime * 0.95) * (0.010 * uAmplitude);
            
            // Smooth Y adjustment to bring right-side lines towards middle-right (uv.y = 0.5)
            float rightBias = smoothstep(0.35, 0.95, uv.x);
            float centerAdjustY = (0.5 - uv.y) * 0.16 * rightBias;
            
            // Apply edgeFade to total Y and X displacement to prevent any boundary clamping kinks
            float totalWaveY = (waveY1 + waveY2 + waveY3 - centerAdjustY + uOffsetY) * edgeFade;
            
            uv.y += totalWaveY;
            uv.x += waveX1 * edgeFade;
            
            // Map UV into safe interior 94% texture range to eliminate any border clipping
            vec2 texUv = uv * 0.94 + 0.03;
            texUv = clamp(texUv, 0.001, 0.999);
            
            vec4 color = texture2D(uTexture, texUv);
            
            // Add subtle luminous glow accent
            float glow = sin(uv.x * 8.0 + uTime * 1.2) * 0.04 + 0.04;
            color.rgb += vec3(glow * 0.07, glow * 0.11, glow * 0.14);
            
            gl_FragColor = color;
        }
    `

    const createShader = (type: number, source: string) => {
        const shader = gl.createShader(type)
        if (!shader) {
            return null
        }
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader)
            return null
        }
        return shader
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) {
        return null
    }

    const program = gl.createProgram()
    if (!program) {
        return null
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return null
    }

    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ]),
        gl.STATIC_DRAW
    )

    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uTexture = gl.getUniformLocation(program, 'uTexture')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uOffsetY = gl.getUniformLocation(program, 'uOffsetY')
    const uPhaseOffset = gl.getUniformLocation(program, 'uPhaseOffset')
    const uAmplitude = gl.getUniformLocation(program, 'uAmplitude')
    const uFrequency = gl.getUniformLocation(program, 'uFrequency')

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // Dummy 1x1 initial pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([4, 7, 17, 255]))

    const updateTexture = (image: HTMLImageElement) => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        isCanvasReady.value = true
    }

    const img = new Image()
    img.src = props.bgImageUrl
    if (img.complete && img.naturalWidth !== 0) {
        updateTexture(img)
    } else {
        img.onload = () => {
            updateTexture(img)
        }
    }

    const resize = () => {
        const parent = canvas.parentElement
        const w = parent ? parent.clientWidth : window.innerWidth
        const h = parent ? parent.clientHeight : window.innerHeight
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    const startTime = Date.now()
    const render = () => {
        const currentTime = (Date.now() - startTime) * props.speed
        if (uTime) {
            gl.uniform1f(uTime, currentTime)
        }
        if (uOffsetY) {
            gl.uniform1f(uOffsetY, props.offsetY)
        }
        if (uPhaseOffset) {
            gl.uniform1f(uPhaseOffset, props.phaseOffset)
        }
        if (uAmplitude) {
            gl.uniform1f(uAmplitude, props.amplitude)
        }
        if (uFrequency) {
            gl.uniform1f(uFrequency, props.frequency)
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6)
        animFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
        window.removeEventListener('resize', resize)
        if (animFrameId !== null) {
            cancelAnimationFrame(animFrameId)
        }
    }
}

onMounted(() => {
    cleanupWave = setupWaveAnimation()
})

onUnmounted(() => {
    if (cleanupWave) {
        cleanupWave()
    }
})
</script>

<style lang="scss" scoped>
.wave-background-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
    background-color: #040711;
}

.static-bg-layer {
    position: absolute;
    inset: 0;
    // background: #040711 v-bind('cssBgUrl') center / cover no-repeat;
    pointer-events: none;
    z-index: 1;
}

.wave-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;

    &.is-ready {
        opacity: 1;
    }
}
</style>
