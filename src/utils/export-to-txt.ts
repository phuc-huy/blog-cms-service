export const exportToTxt = (name: string, text: string) => {
    try {
        const blob = new Blob([text], { type: "text/plain" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `${name}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Cleanup the URL object
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error(error)
    }
}
