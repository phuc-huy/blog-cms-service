import { connectDB } from "lib/mongodb"
import Post from "lib/models/post"
import Domain from "lib/models/domain"
import Category from "lib/models/category"
import { NextRequest, NextResponse } from "next/server"
import { cacheGet, cacheSet } from "utils/cache"

export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(req.url)
        const domain_key = searchParams.get('domain_key') || ''
        const category_slug = searchParams.get('category_slug') || ''
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))

        const cacheKey = `posts:list:${domain_key}:${category_slug}:${page}:${limit}`

        // Try cache first with graceful degradation
        try {
            const cached = await cacheGet<{
                data: unknown[]
                page: number
                limit: number
                total: number
                totalPages: number
            }>(cacheKey)
            if (cached) {
                return NextResponse.json(cached)
            }
        } catch (err) {
            console.error('[posts] Redis cache read error, falling back to DB:', err)
        }

        // Build filter — always only published posts
        const filter: Record<string, unknown> = { status: 'published' }

        if (domain_key) {
            const domain = await Domain.findOne({ key: domain_key })
            if (domain) {
                filter.domain_ids = domain._id
            } else {
                // Domain not found — return empty result
                const empty = { data: [], page, limit, total: 0, totalPages: 0 }
                try { await cacheSet(cacheKey, empty, 300) } catch { /* ignore */ }
                return NextResponse.json(empty)
            }
        }

        if (category_slug) {
            const category = await Category.findOne({ slug: category_slug })
            if (category) {
                filter.category_id = category._id
            } else {
                const empty = { data: [], page, limit, total: 0, totalPages: 0 }
                try { await cacheSet(cacheKey, empty, 300) } catch { /* ignore */ }
                return NextResponse.json(empty)
            }
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
        const result = { data, page, limit, total, totalPages }

        // Cache result with graceful degradation
        try {
            await cacheSet(cacheKey, result, 300)
        } catch (err) {
            console.error('[posts] Redis cache write error:', err)
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to fetch public posts:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể tải danh sách bài viết", error: errorMessage },
            { status: 500 }
        )
    }
}
