export const exportToCsv = (name: string, headers: string[], rows: string[]) => {
    try {
        const csvContent = [headers, ...rows].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `${name}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error(error)
    }
}
