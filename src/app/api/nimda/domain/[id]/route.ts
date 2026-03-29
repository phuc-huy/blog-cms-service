import { connectDB } from "lib/mongodb"
import Domain from "lib/models/domain"
import Post from "lib/models/post"
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
                { message: "Invalid domain ID" },
                { status: 400 }
            )
        }

        const body = await req.json()
        const { name, key, link } = body

        // Check if key is being changed and already exists
        if (key) {
            const existingDomain = await Domain.findOne({ key, _id: { $ne: params.id } })
            if (existingDomain) {
                return NextResponse.json(
                    { message: "Key đã tồn tại" },
                    { status: 409 }
                )
            }
        }

        const updatedDomain = await Domain.findByIdAndUpdate(
            params.id,
            { name, key, link },
            { new: true, runValidators: true }
        )

        if (!updatedDomain) {
            return NextResponse.json(
                { message: "Website không tìm thấy" },
                { status: 404 }
            )
        }

        return NextResponse.json(updatedDomain)
    } catch (error) {
        console.error("Failed to update domain:", error)

        if (error instanceof Error && "code" in error && (error as any).code === 11000) {
            return NextResponse.json(
                { message: "Key đã tồn tại" },
                { status: 409 }
            )
        }

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể cập nhật website", error: errorMessage },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
    try {
        await connectDB()

        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json(
                { message: "Invalid domain ID" },
                { status: 400 }
            )
        }

        const deletedDomain = await Domain.findByIdAndDelete(params.id)

        if (!deletedDomain) {
            return NextResponse.json(
                { message: "Website không tìm thấy" },
                { status: 404 }
            )
        }

        // Remove domain ID from domain_ids of all related posts
        await Post.updateMany(
            { domain_ids: params.id },
            { $pull: { domain_ids: new mongoose.Types.ObjectId(params.id) } }
        )

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("Failed to delete domain:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể xóa website", error: errorMessage },
            { status: 500 }
        )
    }
}
