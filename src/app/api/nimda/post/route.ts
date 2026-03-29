import { connectDB } from "lib/mongodb"
import Post from "lib/models/post"
import "lib/models/domain"
import "lib/models/category"
import { NextRequest, NextResponse } from "next/server"
import { generateSlug } from "utils/generate-slug"
import { genId } from "utils/gen-id"
import { cacheDelPattern } from "utils/cache"

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const body = await req.json()

        const { title, domain_ids, category_id, status } = body
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

        // 3. Tạo bài viết mới với post_id, slug duy nhất, và các trường mới
        const postData = {
            ...body,
            post_id: postId,
            slug: uniqueSlug,
            domain_ids: domain_ids || [],
            category_id: category_id || null,
            status: status || 'draft',
            published_at: null,
        }
        const newPost = new Post(postData)
        await newPost.save()

        // 4. Invalidate cache sau khi tạo post thành công
        await cacheDelPattern('posts:*')

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

export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(req.url)
        const domain_id = searchParams.get('domain_id')
        const category_id = searchParams.get('category_id')
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))

        // Build filter with AND logic
        const filter: Record<string, any> = {}

        if (domain_id) {
            filter.domain_ids = domain_id
        }

        if (category_id) {
            filter.category_id = category_id
        }

        if (status) {
            filter.status = status
        }

        if (search) {
            filter.title = { $regex: search, $options: 'i' }
        }

        const skip = (page - 1) * limit

        const [data, total] = await Promise.all([
            Post.find(filter)
                .populate('domain_ids', 'name key link')
                .populate('category_id', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Post.countDocuments(filter),
        ])

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({ data, page, limit, total, totalPages })
    } catch (error) {
        console.error("Failed to fetch posts:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ message: "Không thể tải danh sách bài viết", error: errorMessage }, { status: 500 })
    }
}


