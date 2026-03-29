import { connectDB } from "lib/mongodb"
import Domain from "lib/models/domain"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    try {
        await connectDB()
        const domains = await Domain.find({}).sort({ createdAt: -1 })
        return NextResponse.json(domains)
    } catch (error) {
        console.error("Failed to fetch domains:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json(
            { message: "Không thể tải danh sách website", error: errorMessage },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const body = await req.json()

        const { name, key, link } = body
        if (!name || !key || !link) {
            return NextResponse.json(
                { message: "Vui lòng cung cấp đầy đủ thông tin (name, key, link)" },
                { status: 400 }
            )
        }

        // Kiểm tra key đã tồn tại
        const existingDomain = await Domain.findOne({ key })
        if (existingDomain) {
            return NextResponse.json(
                { message: "Key đã tồn tại" },
                { status: 409 }
            )
        }

        const newDomain = new Domain({ name, key, link })
        await newDomain.save()

        return NextResponse.json(newDomain, { status: 201 })
    } catch (error) {
        console.error("Failed to create domain:", error)

        if (error instanceof Error && "code" in error && (error as any).code === 11000) {
            return NextResponse.json(
                { message: "Key đã tồn tại" },
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
            { message: "Không thể tạo website", error: errorMessage },
            { status: 500 }
        )
    }
}
