export function genId(length: number = 6) {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    const charactersLength = characters.length

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
}
