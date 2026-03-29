import { connectDB } from "lib/mongodb"
import Category from "lib/models/category"
import { generateSlug } from "utils/generate-slug"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    try {
        await connectDB()
        const categories = await Category.find({}).sort({ createdAt: -1 })
        return NextResponse.json(categories)
    } catch (error) {
        console.error("Failed to fetch categories:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể tải danh sách danh mục", error: errorMessage },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const body = await req.json()

        const { name, description } = body
        if (!name) {
            return NextResponse.json(
                { message: "Vui lòng cung cấp tên danh mục" },
                { status: 400 }
            )
        }

        // Tự động sinh slug từ tên
        let slug = generateSlug(name)

        // Kiểm tra unique slug, thêm hậu tố nếu trùng
        const existingCategory = await Category.findOne({ slug })
        if (existingCategory) {
            let suffix = 2
            while (await Category.findOne({ slug: `${slug}-${suffix}` })) {
                suffix++
            }
            slug = `${slug}-${suffix}`
        }

        const newCategory = new Category({
            name,
            slug,
            description: description || ""
        })
        await newCategory.save()

        return NextResponse.json(newCategory, { status: 201 })
    } catch (error) {
        console.error("Failed to create category:", error)

        if (error instanceof Error && "code" in error && (error as any).code === 11000) {
            return NextResponse.json(
                { message: "Slug đã tồn tại" },
                { status: 409 }
            )
        }

        if (error instanceof Error && error.name === "ValidationError") {
            return NextResponse.json(
                { message: "Validation Error", error: error.message },
                { status: 400 }
            )
        }

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể tạo danh mục", error: errorMessage },
            { status: 500 }
        )
    }
}
