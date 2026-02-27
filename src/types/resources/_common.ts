export interface ICommonResource {
    id: string
    gen_id: string
    updated_at?: string
    created_at?: string
    is_premium: boolean
}

export interface IPrevNext<T> {
    prev: T | null
    next: T | null
}
