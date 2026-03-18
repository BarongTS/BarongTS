export const log = console.log

export type SelectedStack = string | string[]

export interface CreateFile {
    name: string
    path: string
    stack: string
}

