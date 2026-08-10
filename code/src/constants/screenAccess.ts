export const SCREEN_DEFINITIONS = []

export const SCREEN_BY_ID = {}

export const normalizeScreenId = (screenId: string) => screenId

export const getScreenPermissions = () => ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE', 'DOWNLOAD']

export const setRuntimePermissions = () => {}

export const hasScreenPermission = () => true

export const getDefaultRouteForRole = () => '/admin/organizations'
