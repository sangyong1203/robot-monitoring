<template>
    <BaseDialog
        :model-value="modelValue"
        :title="isEdit ? '기관 / 사이트 정보 수정' : '신규 기관 / 사이트 등록'"
        description="통합관제 대상 기관 및 사이트 조직 정보를 설정합니다."
        width="640px"
        :buttonTypes="['Cancel', 'Save']"
        @update:model-value="val => emit('update:modelValue', val)"
        @onSave="handleSave"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="management-page__form-grid">
            <el-form-item label="기관 / 사이트명" prop="name">
                <el-input v-model="form.name" placeholder="예: 중저준위 처분시설 운영센터" />
            </el-form-item>

            <el-form-item label="기관 식별 코드" prop="code">
                <el-input v-model="form.code" placeholder="예: KORAD-CENTER-01" />
            </el-form-item>

            <el-form-item label="기관 구분" prop="orgType">
                <el-select v-model="form.orgType" style="width: 100%">
                    <el-option label="대표 본원 (HEADQUARTER)" value="HEADQUARTER" />
                    <el-option label="운영 센터 (CENTER)" value="CENTER" />
                    <el-option label="세부 사이트 (SITE)" value="SITE" />
                </el-select>
            </el-form-item>

            <el-form-item label="상위 기관 계층">
                <el-select v-model="form.parentId" style="width: 100%" clearable placeholder="최상위 대표 기관인 경우 선택 해제">
                    <el-option v-for="org in parentOrgOptions" :key="org.id" :label="org.name" :value="org.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="운영 관리 업체명">
                <el-input v-model="form.vendorName" placeholder="예: (주)한국방사성폐기물관리기술" />
            </el-form-item>

            <el-form-item label="업체 담당자명">
                <el-input v-model="form.vendorContactName" placeholder="담당자 이름 입력" />
            </el-form-item>

            <el-form-item label="담당자 연락처">
                <el-input v-model="form.vendorContactPhone" placeholder="예: 054-700-1199" />
            </el-form-item>

            <el-form-item label="담당자 이메일">
                <el-input v-model="form.vendorContactEmail" placeholder="example@korad.or.kr" />
            </el-form-item>

            <el-form-item label="상태 설정" style="grid-column: span 2">
                <div style="display: flex; gap: 24px">
                    <el-checkbox v-model="form.isRepresentative">대표 본원 기관으로 설정</el-checkbox>
                    <el-checkbox v-model="form.isActive">운영 활성화 상태</el-checkbox>
                </div>
            </el-form-item>

            <el-form-item label="비고 및 기관 설명" style="grid-column: span 2">
                <el-input v-model="form.description" type="textarea" :rows="2" placeholder="기관 업무 설명 및 특이사항 입력" />
            </el-form-item>
        </el-form>
    </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseDialog from '@/components/BaseDialog.vue'
import { saveOrganization } from '../service/organizations.api'
import type { OrganizationItem, SaveOrgPayload } from '../service/organizations.types'

const props = defineProps<{
    modelValue: boolean
    isEdit: boolean
    initialData?: OrganizationItem | null
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'saved'): void
}>()

const formRef = ref()

const parentOrgOptions = [
    { id: 1, name: 'KORAD 경주 본원' },
    { id: 2, name: '중저준위 처분시설 운영센터' },
]

const form = reactive<SaveOrgPayload>({
    id: undefined,
    code: '',
    name: '',
    orgType: 'SITE',
    parentId: undefined,
    isRepresentative: false,
    isActive: true,
    description: '',
    vendorName: '',
    vendorContactName: '',
    vendorContactDept: '',
    vendorContactPhone: '',
    vendorContactEmail: '',
})

const rules = {
    name: [{ required: true, message: '기관/사이트명을 입력하세요.', trigger: 'blur' }],
    code: [{ required: true, message: '기관 식별 코드를 입력하세요.', trigger: 'blur' }],
}

watch(
    () => props.modelValue,
    visible => {
        if (visible) {
            if (props.isEdit && props.initialData) {
                Object.assign(form, JSON.parse(JSON.stringify(props.initialData)))
            } else {
                form.id = undefined
                form.code = `ORG-NEW-${Date.now().toString().slice(-4)}`
                form.name = ''
                form.orgType = 'SITE'
                form.parentId = 1
                form.isRepresentative = false
                form.isActive = true
                form.description = ''
                form.vendorName = ''
                form.vendorContactName = ''
                form.vendorContactDept = ''
                form.vendorContactPhone = ''
                form.vendorContactEmail = ''
            }
        }
    },
)

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            await saveOrganization(form)
            ElMessage.success(props.isEdit ? '기관 정보가 수정되었습니다.' : '신규 기관이 등록되었습니다.')
            emit('update:modelValue', false)
            emit('saved')
        } catch (e: any) {
            ElMessage.error(e.message || '저장 실패')
        }
    })
}
</script>
