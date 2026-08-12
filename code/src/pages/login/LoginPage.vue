<template>
    <div class="layout-login">
        <canvas ref="waveCanvas" class="wave-canvas"></canvas>
        <div class="login-block fade-in">
            <div class="login-block-content">
                <div class="login-header">
                    <!-- <logoMark class="logo-mark"></logoMark> -->
                    <p class="login-header-content">KORAD</p>
                    <p>Integrated Robot Control System</p>
                </div>
                <div class="devide-line"></div>
                <div class="login">
                    <el-form ref="formRef" :model="loginForm" :rules="rules" :show-message="false" autocomplete="off">
                        <input class="login-autofill-blocker" type="text" name="username" autocomplete="username" />
                        <input
                            class="login-autofill-blocker"
                            type="password"
                            name="password"
                            autocomplete="current-password"
                        />
                        <el-form-item prop="loginId" style="margin-bottom: 24px">
                            <el-input
                                v-model="loginForm.loginId"
                                placeholder="아이디"
                                autocomplete="off"
                                :readonly="isLoginIdReadonly"
                                name="login-id"
                                autocapitalize="off"
                                autocorrect="off"
                                spellcheck="false"
                                @focus="isLoginIdReadonly = false"
                                @mousedown="isLoginIdReadonly = false"
                                @input="message = ''"
                            >
                                <template #prefix>
                                    <!-- <IconLoginUser></IconLoginUser> -->
                                    <el-icon><UserRound /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input
                                v-model="loginForm.password"
                                placeholder="비밀번호"
                                type="password"
                                show-password
                                autocomplete="new-password"
                                :readonly="isPasswordReadonly"
                                name="login-password"
                                class="custom-pw-input"
                                @focus="isPasswordReadonly = false"
                                @mousedown="isPasswordReadonly = false"
                                @input="message = ''"
                                @keyup.enter="login()"
                            >
                                <template #prefix>
                                    <!-- <IconLoginPassword></IconLoginPassword> -->
                                    <el-icon><LockKeyhole /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <div style="position: relative; margin-top: 12px">
                            <el-text v-model="message" type="warning" size="large" class="WarningMessage">{{
                                message
                            }}</el-text>

                            <el-button
                                type="primary"
                                size="large"
                                class="login-btn"
                                :disabled="isLoading"
                                @click="login()"
                            >
                                <div style="position: relative">
                                    <el-icon v-show="isLoading" class="loading-icon icon-spin"
                                        ><LoaderCircle
                                    /></el-icon>
                                    로그인
                                </div>
                            </el-button>
                        </div>
                    </el-form>
                </div>
                <div class="find-password">
                    <p>
                        <a @click="passwordReset" style="cursor: pointer">비밀번호 찾기</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <PasswordResetDialog ref="PasswordResetDialogRef"></PasswordResetDialog>
</template>

<script lang="ts" setup>
import { LoaderCircle, LockKeyhole, UserRound } from '@lucide/vue'
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import type { FormRules, FormInstance } from 'element-plus'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'
import PasswordResetDialog from './PasswordResetDialog.vue'
import loginApi from './service/login.api.ts'
import { useMenuStore } from '@/stores/menu.store'
import { useNavStore } from '@/stores/nav.store'
import { useAuthStore } from '@/stores/auth.store'
import { isRoleLevel, type RoleLevel } from '@/types/accessControl'
import type { SigninData } from './service/login.types'

const router = useRouter()
const formRef = ref<FormInstance | null>(null)
const menuStore = useMenuStore()
const navStore = useNavStore()
const authStore = useAuthStore()
const loginForm = reactive({
    loginId: '',
    password: '',
    isSaveId: false,
})
const rules: FormRules = {
    loginId: [
        {
            validator: (rule: any, value: any, callback: any) => {
                if (!String(value ?? '').trim()) {
                    callback(new Error('아이디를 입력해 주세요.'))
                } else {
                    callback()
                }
            },
            trigger: 'blur',
        },
    ],
    password: [
        {
            validator: (rule: any, value: any, callback: any) => {
                if (!String(value ?? '').trim()) {
                    callback(new Error('비밀번호를 입력해 주세요.'))
                } else {
                    callback()
                }
            },
            trigger: 'blur',
        },
    ],
}

const waveCanvas = ref<HTMLCanvasElement | null>(null)
let animFrameId: number | null = null
let cleanupWave: (() => void) | null = null

interface WaveConfig {
    yRatio: number
    amplitude: number
    frequency: number
    speed: number
    offset: number
    colorStops: { offset: number; color: string }[]
    strokeColor: string
}

const setupWaveAnimation = () => {
    const canvas = waveCanvas.value
    if (!canvas) {
        return null
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        return null
    }

    let width = 0
    let height = 0

    const resize = () => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const waves: WaveConfig[] = [
        {
            yRatio: 0.55,
            amplitude: 110,
            frequency: 0.0012,
            speed: 0.005,
            offset: 0,
            colorStops: [
                { offset: 0, color: 'rgba(180, 40, 220, 0)' },
                { offset: 0.35, color: 'rgba(180, 40, 220, 0.32)' },
                { offset: 0.7, color: 'rgba(30, 210, 245, 0.22)' },
                { offset: 1, color: 'rgba(10, 20, 50, 0)' },
            ],
            strokeColor: 'rgba(210, 120, 255, 0.75)',
        },
        {
            yRatio: 0.42,
            amplitude: 145,
            frequency: 0.0009,
            speed: -0.004,
            offset: 2.2,
            colorStops: [
                { offset: 0, color: 'rgba(235, 30, 180, 0)' },
                { offset: 0.45, color: 'rgba(235, 30, 180, 0.28)' },
                { offset: 0.8, color: 'rgba(120, 40, 230, 0.18)' },
                { offset: 1, color: 'rgba(5, 15, 35, 0)' },
            ],
            strokeColor: 'rgba(255, 130, 240, 0.85)',
        },
        {
            yRatio: 0.65,
            amplitude: 95,
            frequency: 0.0015,
            speed: 0.007,
            offset: 4.1,
            colorStops: [
                { offset: 0, color: 'rgba(20, 210, 240, 0)' },
                { offset: 0.4, color: 'rgba(20, 210, 240, 0.38)' },
                { offset: 0.75, color: 'rgba(150, 40, 220, 0.15)' },
                { offset: 1, color: 'rgba(5, 10, 30, 0)' },
            ],
            strokeColor: 'rgba(50, 235, 255, 0.9)',
        },
        {
            yRatio: 0.32,
            amplitude: 160,
            frequency: 0.0007,
            speed: -0.003,
            offset: 1.1,
            colorStops: [
                { offset: 0, color: 'rgba(140, 30, 220, 0)' },
                { offset: 0.5, color: 'rgba(140, 30, 220, 0.25)' },
                { offset: 1, color: 'rgba(0, 180, 230, 0)' },
            ],
            strokeColor: 'rgba(190, 140, 255, 0.65)',
        },
    ]

    const draw = () => {
        ctx.clearRect(0, 0, width, height)

        // Deep space gradient background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height)
        bgGrad.addColorStop(0, '#040711')
        bgGrad.addColorStop(0.5, '#0b0616')
        bgGrad.addColorStop(1, '#030a16')
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, width, height)

        // Ambient floating glow orbs
        const time = Date.now() * 0.0006
        const orb1X = width * 0.7 + Math.sin(time) * 110
        const orb1Y = height * 0.3 + Math.cos(time * 0.8) * 70
        const radGrad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, width * 0.45)
        radGrad1.addColorStop(0, 'rgba(180, 40, 220, 0.32)')
        radGrad1.addColorStop(0.6, 'rgba(40, 180, 230, 0.1)')
        radGrad1.addColorStop(1, 'transparent')
        ctx.fillStyle = radGrad1
        ctx.fillRect(0, 0, width, height)

        const orb2X = width * 0.25 + Math.cos(time * 0.7) * 130
        const orb2Y = height * 0.7 + Math.sin(time * 0.9) * 90
        const radGrad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, width * 0.4)
        radGrad2.addColorStop(0, 'rgba(25, 200, 240, 0.28)')
        radGrad2.addColorStop(0.5, 'rgba(140, 30, 210, 0.14)')
        radGrad2.addColorStop(1, 'transparent')
        ctx.fillStyle = radGrad2
        ctx.fillRect(0, 0, width, height)

        ctx.globalCompositeOperation = 'screen'

        // Render smooth silk wave fills + luminous edge glows
        waves.forEach((wave) => {
            wave.offset += wave.speed

            const points: { x: number; y: number }[] = []
            const baseY = height * wave.yRatio

            for (let x = -50; x <= width + 50; x += 12) {
                const y =
                    baseY +
                    Math.sin(x * wave.frequency + wave.offset) * wave.amplitude +
                    Math.cos(x * wave.frequency * 0.4 + wave.offset * 0.6) * (wave.amplitude * 0.6)
                points.push({ x, y })
            }

            // Draw filled wave silk
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y)
            }
            ctx.lineTo(width + 50, height + 150)
            ctx.lineTo(-50, height + 150)
            ctx.closePath()

            const waveGrad = ctx.createLinearGradient(0, baseY - wave.amplitude, 0, baseY + wave.amplitude * 2.5)
            wave.colorStops.forEach((cs) => {
                waveGrad.addColorStop(cs.offset, cs.color)
            })
            ctx.fillStyle = waveGrad
            ctx.fill()

            // Draw luminous wave crest highlight line
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y)
            }
            ctx.strokeStyle = wave.strokeColor
            ctx.lineWidth = 2.5
            ctx.shadowBlur = 25
            ctx.shadowColor = wave.strokeColor
            ctx.stroke()
            ctx.shadowBlur = 0
        })

        ctx.globalCompositeOperation = 'source-over'

        animFrameId = requestAnimationFrame(draw)
    }

    draw()

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

const message = ref('')
const isLoading = ref(false)
const isLoginIdReadonly = ref(true)
const isPasswordReadonly = ref(true)

const normalizeRoleLevel = (value?: string): RoleLevel => {
    return isRoleLevel(value) ? value : 'VIEWER'
}

const completeLogin = async (signinData: SigninData, loginId: string) => {
    authStore.setTokens({
        accessToken: signinData.accessToken,
        refreshToken: signinData.refreshToken,
        verificationToken: signinData.verificationToken ?? '',
    })

    const userInfoResponse = await loginApi.getUserInfo()
    const userInfo = userInfoResponse.data ?? {}
    const userLevel = normalizeRoleLevel(userInfo.userLevel)
    const permissions = userInfo.permissions ?? []

    const landingPage = signinData.landingPage || userInfo.landingPage || '/admin/organizations'

    authStore.setSession({
        tokens: {
            accessToken: signinData.accessToken,
            refreshToken: signinData.refreshToken,
            verificationToken: signinData.verificationToken ?? '',
        },
        user: {
            loginId: userInfo.email || loginId,
            name: userInfo.krName || userInfo.name || '',
            userLevel,
            email: userInfo.email || loginId,
            landingPage,
            permissions,
        },
    })
    navStore.init()
    menuStore.init()
    await menuStore.loadMenu(userLevel)

    router.push({ path: landingPage })
}

const login = () => {
    if (isLoading.value) return
    if (!formRef.value) return
    try {
        formRef.value.validate(async (valid: boolean, invalidFields?: Record<string, Array<{ message?: string }>>) => {
            if (valid) {
                const loginId = loginForm.loginId.trim()
                const password = loginForm.password
                loginForm.loginId = loginId

                const params = {
                    username: loginId,
                    password: password,
                }
                isLoading.value = true
                ElNotification.closeAll()
                try {
                    const res = await loginApi.signin(params)
                    if (res.result === 'SUCCESS' && res.data) {
                        await completeLogin(res.data, loginId)
                    } else {
                        message.value = res.resultMessage || '로그인에 실패했습니다.'
                    }
                } catch (error: unknown) {
                    const err = error as {
                        data?: { resultMessage?: string; error?: { code?: string } }
                        response?: { data?: { resultMessage?: string; error?: { code?: string } } }
                    }
                    const errorData = err?.data ?? err?.response?.data
                    const errorCode = errorData?.error?.code
                    if (errorCode === 'INVALID_CREDENTIALS') {
                        message.value = '아이디 또는 비밀번호가 일치하지 않습니다.'
                    } else if (errorCode === 'USER_INACTIVE') {
                        message.value = '사용이 중지된 계정입니다. 관리자에게 문의해 주세요.'
                    } else {
                        message.value = errorData?.resultMessage || '로그인에 실패했습니다.'
                    }
                } finally {
                    isLoading.value = false
                }
            } else {
                const firstErrorMessage = invalidFields ? Object.values(invalidFields)[0]?.[0]?.message : ''
                message.value = firstErrorMessage || '아이디와 비밀번호를 확인해 주세요.'
            }
        })
    } catch {
        message.value = '로그인 요청을 처리하지 못했습니다.'
    }
}
const PasswordResetDialogRef: any = ref(null)
const passwordReset = () => {
    PasswordResetDialogRef.value?.openDialog()
}
</script>

<style lang="scss" scoped>
.layout-login {
    --primary-color: #b446d2;
    --glass-border-color: rgba(180, 70, 210, 0.4);
    --input-border-color: rgba(72, 24, 98, 0.82);
    --input-hover-border-color: rgba(98, 35, 132, 0.92);
    --input-text-color: #dedede;
    --placeholder-color: #bebebe;
    --icon-color: #c9d1d9;
    --button-text-color: #bebebe;

    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #060913;

    &::before,
    &::after {
        content: '';
        position: absolute;
        pointer-events: none;
    }

    &::before {
        inset: -24px;
        background: radial-gradient(circle at 70% 30%, rgba(195, 55, 235, 0.25), transparent 45%),
            radial-gradient(circle at 20% 80%, rgba(35, 195, 225, 0.2), transparent 40%);
        filter: blur(20px);
        opacity: 0.8;
    }

    &::after {
        inset: 0;
        z-index: 1;
        background: radial-gradient(circle at 58% 35%, rgba(255, 255, 255, 0.1), transparent 26%),
            radial-gradient(circle at 30% 72%, rgba(42, 15, 66, 0.25), transparent 38%), rgba(4, 9, 17, 0.2);
    }

    :deep(input:-webkit-autofill),
    :deep(input:-webkit-autofill:hover),
    :deep(input:-webkit-autofill:focus),
    :deep(input:-webkit-autofill:active) {
        -webkit-box-shadow: 0 0 0 1000px rgba(88, 18, 117, 0.22) inset !important;
        -webkit-text-fill-color: var(--input-text-color) !important;
        transition: background-color 9999s ease-in-out 0s;
    }
}

.wave-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.login-autofill-blocker {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.login-block {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;
    height: 100%;
    padding: 2.5%;
}

.login-block-content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 28px;
    width: 586px;
    min-height: 568px;
    padding: 48px 40px 40px;
    overflow: hidden;
    border: 1px solid var(--glass-border-color);
    border-radius: 28px;
    box-shadow:
        0 28px 90px rgba(0, 0, 0, 0.34),
        0 0 60px rgba(126, 47, 135, 0.24),
        inset 0 1px 0 rgba(255, 255, 255, 0.34),
        inset 0 -1px 0 rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(22px) saturate(1.25);
    -webkit-backdrop-filter: blur(22px) saturate(1.25);

    &::before,
    &::after {
        content: '';
        position: absolute;
    }

    &::before {
        inset: 0;
        background: linear-gradient(25deg, rgba(255, 255, 255, 0.22), transparent 42%),
            radial-gradient(circle at -5% 0%, rgba(140, 129, 243, 0.22), transparent 22%);
    }
}
.devide-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(241, 180, 247, 0.52), transparent);
}

.login-header,
.login,
.find-password {
    position: relative;
    z-index: 1;
}

.login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;

    p:not(.login-header-content) {
        color: rgba(255, 255, 255, 0.76);
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.24);
        font-size: 16px;
        font-weight: 400;
    }
}

.login-header-content {
    width: 100%;
    color: rgba(255, 255, 255, 0.92);
    font-size: 72px;
    text-align: center;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.3);
    // span {
    //     font-size: 50px;
    // }
}

.login {
    width: 100%;
    margin-right: auto;
    margin-left: auto;

    :deep(.el-form-item) {
        margin-bottom: 8px;
    }

    :deep(.el-form-item__error) {
        color: var(--icon-color);
        font-size: 16px;
    }

    :deep(.el-form-item.is-error .el-input__validateIcon) {
        color: var(--icon-color);
    }

    :deep(.el-form-item.is-error .el-input__wrapper),
    :deep(.el-form-item.is-error .el-input__wrapper.is-focus) {
        box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }

    :deep(.el-input) {
        --el-input-border-radius: 100px;
        height: 64px;
    }

    :deep(.el-input__wrapper) {
        padding: 20px;
        font-size: 20px;
        background: rgba(30, 21, 56, 0.36) !important;
        border: 1px solid var(--input-border-color);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 10px 24px rgba(0, 0, 0, 0.12) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    :deep(.el-input__wrapper:hover) {
        background: rgba(42, 25, 72, 0.44) !important;
        border-color: var(--input-hover-border-color);
    }

    :deep(.el-input__wrapper.is-focus) {
        background: rgba(42, 25, 72, 0.5) !important;
        // border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color) inset !important;
    }

    :deep(.el-input__inner) {
        height: 45px;
        color: var(--input-text-color) !important;
        -webkit-text-fill-color: var(--input-text-color);
    }

    :deep(.el-input__inner::placeholder),
    :deep(input::placeholder) {
        color: var(--placeholder-color) !important;
        font-weight: lighter;
        -webkit-text-fill-color: var(--placeholder-color) !important;
        opacity: 1;
    }

    :deep(.el-input__prefix-inner),
    :deep(.el-input__suffix-inner) {
        align-items: center;
        height: 100%;
        color: var(--icon-color);
    }

    :deep(.el-input__prefix) {
        left: 22px;
    }

    :deep(.el-input__prefix-inner > .el-icon) {
        width: 18px;
        height: 18px;
        margin-top: 1px;
        font-size: 18px;
    }
}

.custom-pw-input :deep(.el-input__password) {
    font-size: 20px;
}

.login-btn {
    width: 100%;
    height: 64px !important;
    margin-top: 40px;
    color: var(--button-text-color) !important;
    font-size: 20px;
    font-weight: lighter;
    background: rgba(18, 2, 37, 0.58);
    border: 1px solid var(--glass-border-color);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        0 14px 28px rgba(0, 0, 0, 0.18);

    &:hover {
        background: rgba(43, 16, 70, 0.68);
    }

    &:focus,
    &:focus-visible {
        outline: none;
        border-color: var(--glass-border-color);
        box-shadow:
            0 0 0 1px var(--glass-border-color),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 14px 28px rgba(0, 0, 0, 0.18);
    }
}
.loading-icon {
    position: absolute;
    left: -24px;
    top: 2px;
}

.WarningMessage {
    position: absolute;
    top: -5px;
    left: 50%;
    display: block;
    width: max-content;
    max-width: 580px;
    color: var(--text-color--red);
    text-align: center;
    transform: translateX(-50%);
}

.find-password {
    display: flex;
    justify-content: center;
    width: 504px;

    p {
        width: 280px;
        color: var(--input-text-color);
        font-size: 15px;
        line-height: 24px;
        text-align: center;
    }

    a {
        color: var(--primary-color);
        text-decoration: underline;
    }
}

.fade-in {
    animation: glassEnter 520ms ease-out both;
}

.fade-in .login-header,
.fade-in .login,
.fade-in .find-password {
    animation: contentFadeIn 620ms ease-out 80ms both;
}

@keyframes glassEnter {
    from {
        transform: translateY(30px);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes contentFadeIn {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1024px) {
    .login-block {
        width: 100%;
        height: 100%;
    }
}
</style>
