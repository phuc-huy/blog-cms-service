import { message } from "antd"
import { config_lang } from "configs/lang"

export const copyText = async (text) => {
    if (!navigator.clipboard) {
        // Fallback cho trình duyệt không hỗ trợ Clipboard API
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed" // Ngăn textArea khỏi việc bị cuộn
        textArea.style.opacity = "0" // Ẩn textArea
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            document.execCommand("copy")

            message.success(config_lang.common.copy_link_successfully)
        } catch (err) {
            console.log(err)
        }

        document.body.removeChild(textArea)
        return
    }

    try {
        await navigator.clipboard.writeText(text)

        message.success(config_lang.common.copy_link_successfully)
    } catch (err) {
        console.log(err)
    }
}

export const copyLocation = async () => {
    console.log(window.location)
    const url = `${window.location.href}`

    await copyText(url)
}
