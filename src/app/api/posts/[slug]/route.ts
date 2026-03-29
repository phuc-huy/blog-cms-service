import { connectDB } from "lib/mongodb"
import Post from "lib/models/post"
import Domain from "lib/models/domain"
import Category from "lib/models/category"
import { NextRequest, NextResponse } from "next/server"
import { cacheGet, cacheSet } from "utils/cache"

// Ensure Domain and Category models are registered for populate
void Domain
void Category

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB()

        const { slug } = await params

        const cacheKey = `posts:detail:${slug}`

        // Try cache first with graceful degradation
        try {
            const cached = await cacheGet<Record<string, unknown>>(cacheKey)
            if (cached) {
                return NextResponse.json(cached)
            }
        } catch (err) {
            console.error('[posts/detail] Redis cache read error, falling back to DB:', err)
        }

        const post = await Post.findOne({ slug, status: 'published' })
            .populate('domain_ids', 'name key link')
            .populate('category_id', 'name slug')

        if (!post) {
            return NextResponse.json(
                { message: "Bài viết không tìm thấy" },
                { status: 404 }
            )
        }

        const result = post.toJSON()

        // Cache result with graceful degradation
        try {
            await cacheSet(cacheKey, result, 300)
        } catch (err) {
            console.error('[posts/detail] Redis cache write error:', err)
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to fetch post detail:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể tải chi tiết bài viết", error: errorMessage },
            { status: 500 }
        )
    }
}
