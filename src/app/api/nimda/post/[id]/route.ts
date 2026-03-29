import { connectDB } from "lib/mongodb"
import Post from "lib/models/post"
import "lib/models/domain"
import "lib/models/category"
import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { generateSlug } from "utils/generate-slug"
import { cacheDelPattern } from "utils/cache"

interface Params {
    id: string
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return new NextResponse(JSON.stringify({ message: "Invalid post ID" }), {
                status: 400
            })
        }

        const post = await Post.findById(params.id)
            .populate('domain_ids', 'name key link')
            .populate('category_id', 'name slug')

        if (!post) {
            return new NextResponse(JSON.stringify({ message: "Post not found" }), {
                status: 404
            })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error("Failed to fetch post:", error)
        return new NextResponse(JSON.stringify({ message: "Failed to fetch post" }), {
            status: 500
        })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return new NextResponse(JSON.stringify({ message: "Invalid post ID" }), {
                status: 400
            })
        }

        const body = await req.json()

        // Fetch current post to check status transition
        const currentPost = await Post.findById(params.id)
        if (!currentPost) {
            return new NextResponse(JSON.stringify({ message: "Post not found" }), {
                status: 404
            })
        }

        // Generate unique slug from title
        let baseSlug = generateSlug(body.title)
        let uniqueSlug = baseSlug
        let counter = 1
        while (await Post.findOne({ slug: uniqueSlug, _id: { $ne: params.id } })) {
            counter++
            uniqueSlug = `${baseSlug}-${counter}`
        }

        // Build update data
        const updateData: Record<string, any> = { ...body, slug: uniqueSlug }

        // Handle status transition for published_at
        if (body.status) {
            if (currentPost.status === 'draft' && body.status === 'published') {
                // draft -> published: set published_at
                updateData.published_at = new Date()
            } else if (currentPost.status === 'published' && body.status === 'draft') {
                // published -> draft: keep existing published_at (don't overwrite)
                updateData.published_at = currentPost.published_at
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(
            params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )

        // Invalidate cache
        await cacheDelPattern('posts:*')

        return NextResponse.json(updatedPost)
    } catch (error) {
        console.error("Failed to update post:", error)
        return new NextResponse(JSON.stringify({ message: "Failed to update post" }), {
            status: 500
        })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return new NextResponse(JSON.stringify({ message: "Invalid post ID" }), {
                status: 400
            })
        }

        const deletedPost = await Post.findByIdAndDelete(params.id)

        if (!deletedPost) {
            return new NextResponse(JSON.stringify({ message: "Post not found" }), {
                status: 404
            })
        }

        // Invalidate cache
        await cacheDelPattern('posts:*')

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Failed to delete post:", error)
        return new NextResponse(JSON.stringify({ message: "Failed to delete post" }), {
            status: 500
        })
    }
}
