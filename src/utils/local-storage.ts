const prefix_key = `tad`

export const getItemInLocalStorage = (key) => {
    try {
        if (typeof window !== "undefined") {
            const temp = localStorage.getItem(`${prefix_key}_${key}`)

            if (temp) {
                return JSON.parse(temp)
            }
        }
    } catch (error) {
        console.error(error)
    }

    return null
}

export const setItemInLocalStorage = (key, data) => {
    localStorage.setItem(`${prefix_key}_${key}`, JSON.stringify(data))
}

export const removeItemInLocalStorage = (key) => {
    localStorage.removeItem(`${prefix_key}_${key}`)
}
