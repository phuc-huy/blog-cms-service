export function createSlug(inputString) {
    // Chuyển sang chữ thường
    let slug = inputString.toLowerCase()

    // Thay thế các ký tự đặc biệt có dấu thành không dấu
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    // Thay thế các ký tự không phải chữ cái và số thành dấu gạch ngang
    slug = slug.replace(/[^a-z0-9\s-]/g, "")

    // Thay thế khoảng trắng và dấu gạch ngang thành một dấu gạch ngang duy nhất
    slug = slug.replace(/\s+/g, "-").replace(/-+/g, "-")

    // Xóa các dấu gạch ngang ở đầu và cuối
    slug = slug.replace(/^-+|-+$/g, "")

    return slug
}
