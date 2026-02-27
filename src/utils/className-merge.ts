import { twMerge } from "tailwind-merge"
import clsx, { ClassValue } from "clsx"

export const classNameMerge = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs))
}
