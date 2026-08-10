import type { RoleLevel } from './accessControl'

export type UserLevel = RoleLevel | 'ADMIN' | 'GENERAL_USER'

export type RobotType =
    | 'FORKLIFT'
    | 'AMR'
    | 'INDUSTRIAL_ARM'
    | 'ECCENTRIC_ROBOT'
    | 'QUADRUPED_ROBOT'
    | 'OUTDOOR_ROBOT'
    | 'WORK'
    | 'SURVEILLANCE'

export type CommunicationStatus = 'ONLINE' | 'STALE' | 'OFFLINE'

export type RobotStatus =
    | 'IDLE'
    | 'RUNNING'
    | 'CHARGING'
    | 'PAUSED'
    | 'STOPPED'
    | 'EMERGENCY'
    | 'ERROR'
