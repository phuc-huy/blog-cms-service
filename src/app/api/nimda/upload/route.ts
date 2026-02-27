import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { writeFile, mkdir } from "fs/promises"
import sharp from "sharp"

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
        return NextResponse.json({ error: "No files uploaded." }, { status: 400 })
    }

    const uploadedFilePaths: string[] = []

    try {
        // Định nghĩa đường dẫn tới thư mục uploads trong thư mục public
        const uploadDir = path.join(process.cwd(), "uploads")

        // Tạo thư mục uploads nếu nó chưa tồn tại
        await mkdir(uploadDir, { recursive: true })

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer())
            let uniqueFilename: string
            let finalBuffer: Buffer

            // Kiểm tra nếu là file ảnh, thì convert sang webp và optimize
            if (file.type.startsWith("image/")) {
                const originalName = file.name.replace(/\.[^/.]+$/, "") // Bỏ phần extension
                uniqueFilename = `${Date.now()}-${originalName.replace(/\s/g, "_")}.webp`
                finalBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer()
            } else {
                // Giữ nguyên logic cũ cho các file không phải ảnh
                uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`
                finalBuffer = buffer
            }

            const filePath = path.join(uploadDir, uniqueFilename)

            // Ghi file vào server
            await writeFile(filePath, finalBuffer)

            // Thêm đường dẫn công khai vào mảng kết quả
            uploadedFilePaths.push(`/uploads/${uniqueFilename}`)
        }

        return NextResponse.json({
            message: "Files uploaded successfully",
            filePaths: uploadedFilePaths
        })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ message: "Failed to upload file." }, { status: 500 })
    }
}
