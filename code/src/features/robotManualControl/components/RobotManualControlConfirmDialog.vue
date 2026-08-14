<template>
    <BaseDialog
        :model-value="visible"
        @update:model-value="$emit('update:visible', $event)"
        :title="isEstop ? '개별 비상정지 (E-STOP) 집행 확인' : '제어 명령 전송 비밀번호 재확인'"
        :description="
            isEstop
                ? '안전 조치를 위해 로봇 비상정지 집행 전 계정 비밀번호를 확인합니다.'
                : '안전한 로봇 제어 명령 집행을 위해 현재 로그인된 계정 비밀번호를 입력하세요.'
        "
        width="460px"
    >
        <el-form label-position="top">
            <div v-if="isEstop" class="estop-modal-warning-box">
                <strong>개별 비상정지(E-Stop) 집행 시</strong> 해당 로봇의 구동 모터가 즉시 록킹(Locking)되며 진행 중인
                모든 대기 및 실행 작업이 즉시 중단됩니다.
            </div>

            <el-form-item label="비밀번호 입력" required>
                <el-input
                    :model-value="password"
                    type="password"
                    placeholder="비밀번호 입력 (예: admin123)"
                    show-password
                    @update:model-value="$emit('update:password', $event)"
                    @keyup.enter="$emit('confirm')"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="$emit('update:visible', false)">취소</el-button>
            <el-button :type="isEstop ? 'danger' : 'primary'" :loading="loading" @click="$emit('confirm')">
                {{ isEstop ? 'E-STOP 비상집행 확인' : '명령 집행 확인' }}
            </el-button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import BaseDialog from '@/components/BaseDialog.vue'

defineProps<{
    visible: boolean
    isEstop: boolean
    password: string
    loading?: boolean
}>()

defineEmits<{
    (e: 'update:visible', visible: boolean): void
    (e: 'update:password', password: string): void
    (e: 'confirm'): void
}>()
</script>

<style scoped lang="scss">
.estop-modal-warning-box {
    background: rgba(239, 68, 68, 0.18);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
}
</style>
