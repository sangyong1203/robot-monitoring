export const ROLE_LEVELS = [
    'DEV_ADMIN',
    'SUPER_ADMIN',
    'SYSTEM_ADMIN',
    'CONTROL_OPERATOR',
    'FIELD_SUPPORT',
    'VIEWER',
] as const

export type RoleLevel = (typeof ROLE_LEVELS)[number]

export const PERMISSION_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'DOWNLOAD'] as const

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]

export type ScreenId =
    | 'IRCS_AC_01_P'
    | 'IRCS_CD_00_P'
    | 'IRCS_LC_01_P'
    | 'IRCS_LC_02_P'
    | 'IRCS_LC_03_P'
    | 'IRCS_MM_01_P'
    | 'IRCS_MM_02_P'
    | 'IRCS_MM_03_P'
    | 'IRCS_MM_04_P'
    | 'IRCS_MM_05_P'
    | 'IRCS_EM_01_P'
    | 'IRCS_EM_02_P'
    | 'IRCS_EM_03_P'
    | 'IRCS_SM_01_P'
    | 'IRCS_SM_02_P'
    | 'IRCS_SM_03_P'
    | 'IRCS_RM_01_P'
    | 'IRCS_RM_02_P'
    | 'IRCS_RM_03_P'
    | 'IRCS_SS_01_P'
    | 'IRCS_SS_02_P'
    | 'IRCS_SS_03_P'
    | 'IRCS_SS_04_P'
    | 'IRCS_SS_05_P'
    | 'IRCS_SS_06_P'
    | 'IRCS_SS_07_P'

/** @deprecated Compatibility type for source files pending their IRCS screen-ID refactor. */
export type LegacyScreenId =
    | 'IMCS-LG-01'
    | 'IMCS-DB-01'
    | 'IMCS-MT-01'
    | 'IMCS-MT-02'
    | 'IMCS-MT-03'
    | 'IMCS-TM-01'
    | 'IMCS-TM-02'
    | 'IMCS-TM-03'
    | 'IMCS-EM-01'
    | 'IMCS-EM-02'
    | 'IMCS-EM-03'
    | 'IMCS-EM-04'
    | 'IMCS-EM-05'
    | 'IMCS-MM-01'
    | 'IMCS-MM-02'
    | 'IMCS-MM-03'
    | 'IMCS-MM-04'
    | 'IMCS-RM-01'
    | 'IMCS-RM-02'
    | 'IMCS-LM-01'
    | 'IMCS-LM-02'
    | 'IMCS-SM-01'
    | 'IMCS-SM-02'
    | 'IMCS-SM-03'
    | 'IMCS-SM-04'
    | 'IMCS-SM-05'

export type UserScreenPermission = {
    screenId: ScreenId
    actions: PermissionAction[]
}

export const isRoleLevel = (value: unknown): value is RoleLevel =>
    typeof value === 'string' && ROLE_LEVELS.includes(value as RoleLevel)
