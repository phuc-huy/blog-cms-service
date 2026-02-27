import { IElementHTMLProps } from "types/props"
import styles from "../server-button/index.module.scss"
interface IProps extends IElementHTMLProps {
    href: string
    variant?: "contained1" | "contained2" | "outlined1" | "outlined2" | "ghost1" | "ghost2"
    onClick?: React.MouseEventHandler
    icon?: any
    size?: "small" | "medium" | "large"
    [x: string]: any
}
import Link from "next/link"

export default function ServerAnchorLink({
    className = "",
    variant = "contained1",
    children,
    style,
    href,
    icon,
    onClick,
    size,
    ...props
}: IProps) {
    const defaultClassName = "min-w-[100px] rounded text-[0.95rem] font-medium outline-none"

    let heightClassName = "h-[32px]"
    if (size === "medium") {
        heightClassName = "h-[40px]"
    } else if (size === "large") {
        heightClassName = "h-[52px]"
    }

    let variantClassName = ""

    switch (variant) {
        case "contained1":
            variantClassName = styles.bgContained1Button
            break
        case "contained2":
            variantClassName = styles.bgContained2Button
            break
        case "outlined1":
            variantClassName = styles.bgOutlined1Button
            break
        case "outlined2":
            variantClassName = styles.bgOutlined2Button
            break
        case "ghost1":
            variantClassName = styles.bgGhost1Button
            break
        case "ghost2":
            variantClassName = styles.bgGhost2Button
            break

        default:
            break
    }

    return (
        <Link href={href} style={style} onClick={onClick} className="no-underline" {...props}>
            <div
                className={`util-flex-center rounded-xl ${defaultClassName} ${variantClassName} ${heightClassName} ${className}`}
            >
                {icon && icon()}

                <span>{children}</span>
            </div>
        </Link>
    )
}
