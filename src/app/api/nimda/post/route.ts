import { connectDB } from "lib/mongodb"
import Post from "lib/models/post"
import { NextRequest, NextResponse } from "next/server"
import { generateSlug } from "utils/generate-slug"
import { genId } from "utils/gen-id"

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const body = await req.json()

        const { title } = body
        if (!title) {
            return NextResponse.json({ message: "Tiêu đề là bắt buộc." }, { status: 400 })
        }

        // 1. Sinh post_id duy nhất
        let postId = genId()
        while (await Post.findOne({ post_id: postId })) {
            postId = genId() // Tạo lại nếu đã tồn tại
        }

        // 2. Sinh slug từ title và kiểm tra tính duy nhất
        let baseSlug = generateSlug(title)
        let uniqueSlug = baseSlug
        let counter = 1
        while (await Post.findOne({ slug: uniqueSlug })) {
            counter++
            uniqueSlug = `${baseSlug}-${counter}`
        }

        // 3. Tạo bài viết mới với post_id và slug duy nhất
        const newPost = new Post({ ...body, post_id: postId, slug: uniqueSlug })
        await newPost.save()

        return NextResponse.json(newPost, { status: 201 })
    } catch (error) {
        console.error("Failed to create post:", error)

        // Xử lý lỗi trùng lặp tên (unique)
        if (error instanceof Error && "code" in error && (error as any).code === 11000) {
            return NextResponse.json(
                {
                    message: "Slug đã tồn tại. Lỗi này không nên xảy ra nếu logic kiểm tra là đúng."
                },
                { status: 409 }
            ) // 409 Conflict
        }

        // Xử lý lỗi validation từ Mongoose
        if (error instanceof Error && error.name === "ValidationError") {
            return NextResponse.json(
                { message: "Validation Error", error: error.message },
                { status: 400 }
            )
        }

        // Các lỗi khác
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể tạo bài viết", error: errorMessage },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        await connectDB()
        // Lấy tất cả bài viết, sắp xếp theo ngày tạo mới nhất
        const posts = await Post.find({}).sort({ createdAt: -1 })
        return NextResponse.json(posts)
    } catch (error) {
        console.error("Failed to fetch posts:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ message: "Không thể tải danh sách bài viết", error: errorMessage }, { status: 500 })
    }
}
