import { connectDB } from "lib/mongodb"
import Category from "lib/models/category"
import Post from "lib/models/post"
import { generateSlug } from "utils/generate-slug"
import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

interface Params {
    id: string
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()

        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json(
                { message: "Invalid category ID" },
                { status: 400 }
            )
        }

        const body = await req.json()
        const { name, description } = body

        const updateData: Record<string, any> = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description

        // Regenerate slug if name is being updated
        if (name) {
            let slug = generateSlug(name)

            // Check unique slug, excluding current category
            const existingCategory = await Category.findOne({ slug, _id: { $ne: params.id } })
            if (existingCategory) {
                let suffix = 2
                while (await Category.findOne({ slug: `${slug}-${suffix}`, _id: { $ne: params.id } })) {
                    suffix++
                }
                slug = `${slug}-${suffix}`
            }
            updateData.slug = slug
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedCategory) {
            return NextResponse.json(
                { message: "Danh mục không tìm thấy" },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedCategory)
    } catch (error) {
        console.error("Failed to update category:", error)

        if (error instanceof Error && "code" in error && (error as any).code === 11000) {
            return NextResponse.json(
                { message: "Slug đã tồn tại" },
                { status: 409 }
            )
        }

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể cập nhật danh mục", error: errorMessage },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()

        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json(
                { message: "Invalid category ID" },
                { status: 400 }
            )
        }

        const deletedCategory = await Category.findByIdAndDelete(params.id)

        if (!deletedCategory) {
            return NextResponse.json(
                { message: "Danh mục không tìm thấy" },
                { status: 404 }
            )
        }

        // Set category_id to null for all posts referencing this category
        await Post.updateMany(
            { category_id: params.id },
            { $set: { category_id: null } }
        )

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Failed to delete category:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể xóa danh mục", error: errorMessage },
            { status: 500 }
        )
    }
}
