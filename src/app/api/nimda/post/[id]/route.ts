import { connectDB } from "lib/mongodb"
import Post from "lib/models/post"
import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { generateSlug } from "utils/generate-slug"

interface Params {
    id: string
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return new NextResponse(JSON.stringify({ message: "Invalid category ID" }), {
                status: 400
            })
        }

        const body = await req.json()

        let baseSlug = generateSlug(body.title)
        let uniqueSlug = baseSlug
        let counter = 1
        while (await Post.findOne({ slug: uniqueSlug })) {
            counter++
            uniqueSlug = `${baseSlug}-${counter}`
        }

        const updatedCategory = await Post.findByIdAndUpdate(
            params.id,
            { ...body, slug: uniqueSlug },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedCategory) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), {
                status: 404
            })
        }

        return NextResponse.json(updatedCategory)
    } catch (error) {
        console.error("Failed to update category:", error)
        return new NextResponse(JSON.stringify({ message: "Failed to update category" }), {
            status: 500
        })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return new NextResponse(JSON.stringify({ message: "Invalid category ID" }), {
                status: 400
            })
        }

        const deletedCategory = await Post.findByIdAndDelete(params.id)

        if (!deletedCategory) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), {
                status: 404
            })
        }

        return new NextResponse(null, { status: 204 }) // 204 No Content
    } catch (error) {
        console.error("Failed to delete category:", error)
        return new NextResponse(JSON.stringify({ message: "Failed to delete category" }), {
            status: 500
        })
    }
}
