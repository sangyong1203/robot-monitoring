<template>
    <BaseDialog
        :model-value="modelValue"
        :title="isEdit ? '사용자 정보 수정' : '신규 사용자 등록'"
        description="시스템 사용자 계정 정보, 소속 기관, 권한 등급을 지정합니다."
        width="640px"
        :buttonTypes="['Cancel', 'Save']"
        @update:model-value="val => emit('update:modelValue', val)"
        @onSave="handleSave"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
            <el-form-item label="사용자 ID" prop="loginId">
                <el-input v-model="form.loginId" :disabled="isEdit" placeholder="로그인 ID (영문/숫자)" />
            </el-form-item>

            <el-form-item label="사용자 성명" prop="name">
                <el-input v-model="form.name" placeholder="성명 입력" />
            </el-form-item>

            <el-form-item label="비밀번호" prop="password">
                <el-input
                    v-model="form.password"
                    type="password"
                    show-password
                    :placeholder="isEdit ? '변경 시에만 입력하세요' : '비밀번호 입력'"
                />
            </el-form-item>

            <el-form-item label="권한 등급" prop="userLevel">
                <el-select v-model="form.userLevel" style="width: 100%">
                    <el-option label="수퍼 관리자 (SUPER_ADMIN)" value="SUPER_ADMIN" />
                    <el-option label="시스템 관리자 (SYSTEM_ADMIN)" value="SYSTEM_ADMIN" />
                    <el-option label="관제 자율 조종사 (CONTROL_OPERATOR)" value="CONTROL_OPERATOR" />
                    <el-option label="현장지원 엔지니어 (FIELD_SUPPORT)" value="FIELD_SUPPORT" />
                    <el-option label="일반 뷰어 (VIEWER)" value="VIEWER" />
                </el-select>
            </el-form-item>

            <el-form-item label="소속 기관" prop="orgId">
                <el-select v-model="form.orgId" style="width: 100%" @change="handleOrgChange">
                    <el-option v-for="org in orgOptions" :key="org.id" :label="org.name" :value="org.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="부서명">
                <el-input v-model="form.deptName" placeholder="예: 방사선관제팀" />
            </el-form-item>

            <el-form-item label="직급 / 직책">
                <el-input v-model="form.position" placeholder="예: 선임연구원" />
            </el-form-item>

            <el-form-item label="연락처" prop="phone">
                <el-input v-model="form.phone" placeholder="예: 010-1234-5678" />
            </el-form-item>

            <el-form-item label="이메일 주소" prop="email" style="grid-column: span 2">
                <el-input v-model="form.email" placeholder="example@korad.or.kr" />
            </el-form-item>

            <el-form-item label="알림 수신 및 계정 상태" style="grid-column: span 2">
                <div style="display: flex; gap: 24px">
                    <el-checkbox v-model="form.receiveSmsAlarm">긴급 알람 SMS 수신</el-checkbox>
                    <el-checkbox v-model="form.receiveEmailAlarm">이메일 보고서 수신</el-checkbox>
                    <el-checkbox v-model="form.isActive">계정 활성화 상태</el-checkbox>
                </div>
            </el-form-item>
        </el-form>
    </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { saveUser } from '../service/users.api'
import type { SaveUserPayload, UserItem } from '../service/users.types'

const props = defineProps<{
    modelValue: boolean
    isEdit: boolean
    initialData?: UserItem | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const formRef = ref()

const orgOptions = [
    { id: 1, name: 'KORAD 경주 본원' },
    { id: 2, name: 'KORAD 경주 본원 > 처분시설 운영센터' },
    { id: 3, name: 'KORAD 경주 본원 > 처분시설 운영센터 > 외곽 경계 감시소' },
]

const form = reactive<SaveUserPayload>({
    id: undefined,
    loginId: '',
    name: '',
    userLevel: 'CONTROL_OPERATOR',
    orgId: 2,
    orgPath: 'KORAD 경주 본원 > 처분시설 운영센터',
    deptName: '',
    position: '',
    phone: '',
    email: '',
    receiveSmsAlarm: true,
    receiveEmailAlarm: true,
    isActive: true,
    password: '',
})

const rules = {
    loginId: [{ required: true, message: '사용자 ID를 입력하세요.', trigger: 'blur' }],
    name: [{ required: true, message: '성명을 입력하세요.', trigger: 'blur' }],
    email: [{ required: true, message: '이메일을 입력하세요.', trigger: 'blur' }],
}

const handleOrgChange = (orgId: number) => {
    const found = orgOptions.find(o => o.id === orgId)
    if (found) {
        form.orgPath = found.name
    }
}

watch(
    () => props.modelValue,
    visible => {
        if (visible) {
            if (props.isEdit && props.initialData) {
                Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
                form.password = ''
            } else {
                form.id = undefined
                form.loginId = ''
                form.name = ''
                form.userLevel = 'CONTROL_OPERATOR'
                form.orgId = 2
                handleOrgChange(2)
                form.deptName = '방사선관제팀'
                form.position = '선임연구원'
                form.phone = ''
                form.email = ''
                form.receiveSmsAlarm = true
                form.receiveEmailAlarm = true
                form.isActive = true
                form.password = '123456'
            }
        }
    },
)

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveUser(form)
            ElMessage.success(props.isEdit ? '사용자 정보가 수정되었습니다.' : '신규 사용자가 등록되었습니다.')
            emit('update:modelValue', false)
            emit('saved')
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}
</script>
