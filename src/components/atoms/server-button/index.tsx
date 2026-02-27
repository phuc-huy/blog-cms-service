import { IElementHTMLProps } from "types/props"
import styles from "./index.module.scss"
interface IProps extends IElementHTMLProps {
    type?: "submit" | "reset" | "button" | undefined
    variant?: "contained1" | "outlined1" | "ghost1"
    onClick?: React.MouseEventHandler
    icon?: any
    size?: "small" | "medium" | "large"
}

const ServerButton = ({
    type = "button",
    className = "",
    onClick,
    variant = "contained1",
    size = "small",
    children,
    icon,
    style
}: IProps) => {
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

        case "outlined1":
            variantClassName = styles.bgOutlined1Button
            break

        case "ghost1":
            variantClassName = styles.bgGhost1Button
            break

        default:
            break
    }

    return (
        <button
            className={`${defaultClassName} ${variantClassName} ${heightClassName} ${className}`}
            style={style}
            type={type}
            onClick={onClick}
        >
            {icon && icon()}
            <span>{children}</span>
        </button>
    )
}

export default ServerButton
