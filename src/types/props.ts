import { CSSProperties } from "react"

export interface IElementHTMLProps extends IStyleHTMLProps {
    children: React.ReactNode
}

export interface IStyleHTMLProps {
    className?: string
    style?: CSSProperties | undefined
}

export interface IDefaultModalProps {
    open: boolean
    close: () => void
}
