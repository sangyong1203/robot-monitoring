declare module 'dayjs' {
    import DayjsEsm = require('dayjs/esm')

    type ConfigType = DayjsEsm.ConfigType
    type PluginFunc = DayjsEsm.PluginFunc

    interface Dayjs extends DayjsEsm.Dayjs {
        tz(timezone?: string, keepLocalTime?: boolean): Dayjs
    }

    interface DayjsFactory {
        (date?: ConfigType): Dayjs
        (date?: ConfigType, format?: DayjsEsm.OptionType, strict?: boolean): Dayjs
        extend(plugin: PluginFunc, option?: unknown): DayjsFactory
        utc(date?: ConfigType, format?: string, strict?: boolean): Dayjs
    }

    const dayjs: DayjsFactory
    export = dayjs
}

declare module 'dayjs/plugin/utc' {
    import DayjsEsm = require('dayjs/esm')

    const plugin: DayjsEsm.PluginFunc
    export = plugin
}

declare module 'dayjs/plugin/timezone' {
    import DayjsEsm = require('dayjs/esm')

    const plugin: DayjsEsm.PluginFunc
    export = plugin
}

declare module 'html2canvas' {
    type Html2CanvasOptions = Record<string, unknown>

    const html2canvas: (element: HTMLElement, options?: Html2CanvasOptions) => Promise<HTMLCanvasElement>
    export default html2canvas
}
