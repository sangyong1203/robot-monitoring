export type PathVariables = { 
    [key: string]: any 
}
export type Params = { 
    [key: string]: any 
}

export type PayloadModel = {
    path?: any
    query?: any
    body?: any
}

export type APIResponse<T = any> = {
    result: string
    resultMessage: string
    data: T | null
    meta?: {
        pageNumber: number
        pageSize: number
        totalCount: number
    }
    error?: {
        code: string
        fieldErrors?: Record<string, string>
        traceId?: string
    }
}
