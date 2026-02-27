import { useEffect, useState } from "react"

type TWindowSize = [number, number]

type THook = TWindowSize

export default function useWindowResize(): THook {
    const initSize: TWindowSize = [
        typeof window !== "undefined" ? window.innerWidth : 0,
        typeof window !== "undefined" ? window.innerHeight : 0
    ]
    const [windowSize, setWindowSize] = useState<TWindowSize>(initSize)

    useEffect(() => {
        const handleResize = (): void => {
            const initSize: TWindowSize = [
                typeof window !== "undefined" ? window.innerWidth : 0,
                typeof window !== "undefined" ? window.innerHeight : 0
            ]
            setWindowSize(initSize)
        }

        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return windowSize
}
