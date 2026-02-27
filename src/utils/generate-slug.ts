// Hàm tạo slug từ title, hỗ trợ tiếng Việt
export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .normalize("NFD") // Chuẩn hóa Unicode (tách dấu)
        .replace(/[\u0300-\u036f]/g, "") // Bỏ các dấu thanh
        .replace(/đ/g, "d") // Xử lý chữ 'đ'
        .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
        .replace(/[^\w\-]+/g, "") // Bỏ các ký tự không phải chữ, số, hoặc gạch ngang
        .replace(/\-\-+/g, "-") // Thay thế nhiều dấu gạch ngang liền nhau bằng một
        .replace(/^-+/, "") // Bỏ dấu gạch ngang ở đầu
        .replace(/-+$/, "") // Bỏ dấu gạch ngang ở cuối
}
