export function getRandomElement(arr: any[]) {
    if (arr.length === 0) {
        return null // Hoặc bạn có thể trả về giá trị khác nếu mảng rỗng
    }
    const randomIndex = Math.floor(Math.random() * arr.length)

    return arr[randomIndex]
}
