export type OrganizationLevel = 'HEAD' | 'SUB' | 'BRANCH'
export type OrgType = OrganizationLevel | 'HEADQUARTER' | 'CENTER' | 'SITE'

export type Organization = {
    id: number
    code?: string
    name: string
    level?: OrganizationLevel
    orgType?: OrgType
    parentId?: number | null
    parentName?: string
    fullPath?: string
    address?: string
    managerName?: string
    managerContact?: string
    subOrgCount?: number
    branchOrgCount?: number
    activeOrgCount?: number
    activeRobotCount: number
    registeredUserCount: number
    useSubOrg?: boolean
    useBranchOrg?: boolean
    isRepresentative?: boolean
    vendorName?: string
    vendorContactName?: string
    vendorContactDept?: string
    vendorContactPhone?: string
    vendorContactEmail?: string
    description?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type OrganizationItem = Organization

export type OrganizationQuery = {
    keyword?: string
    level?: OrganizationLevel
    orgType?: OrgType
    isActive?: boolean
}

export type SaveOrgPayload = Omit<
    Organization,
    'id' | 'activeRobotCount' | 'registeredUserCount' | 'createdAt' | 'updatedAt'
> & {
    id?: number
}

export type SaveOrganizationPayload = SaveOrgPayload
