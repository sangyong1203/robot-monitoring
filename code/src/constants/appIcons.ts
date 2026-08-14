import {
    BellRing,
    Bot,
    ChartNoAxesCombined,
    LayoutDashboard,
    Map as MapIcon,
    Monitor,
    ScrollText,
    Settings,
    Wrench,
    UserRound,
    GamepadDirectional,
    ListTodo
} from '@lucide/vue'
import IconAlignHorizontal from '@/assets/icons/IconAlignHorizontal.svg'
import IconAlignVertical from '@/assets/icons/IconAlignVertical.svg'
import IconDistributeHorizontal from '@/assets/icons/IconDistributeHorizontal.svg'
import IconDistributeVertical from '@/assets/icons/IconDistributeVertical.svg'

export const AppIcons = {
    IconAlarmHistory: BellRing,
    IconDashboard: LayoutDashboard,
    IconDeviceManagement: Bot,
    IconMaintenance: Wrench,
    IconLog: ScrollText,
    IconMap: MapIcon,
    IconMonitoring: Monitor,
    IconSetting: Settings,
    IconDevice: ChartNoAxesCombined,
    IconAlignHorizontal,
    IconAlignVertical,
    IconDistributeHorizontal,
    IconDistributeVertical,
    IconUserManagement: UserRound,
    IconRobotContrl: GamepadDirectional,
    IconMission: ListTodo
} as const

export type AppIconName = keyof typeof AppIcons
