import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderKanban, Layers } from "lucide-react"

export default function Nimda() {
    const menuItems = [
        {
            title: "Khách liên hệ",
            description: "Quản lý thông tin của khách muốn liên hệ.",
            href: "/nimda/customer-contact",
            icon: FolderKanban,
        },
        {
            title: "Quản lý Dự án",
            description: "Quản lý danh sách dự án, hình ảnh và thông tin chi tiết.",
            href: "/nimda/project",
            icon: FolderKanban,
        },
        {
            title: "Quản lý Bài viết",
            description: "Quản lý danh sách bài viết",
            href: "/nimda/project",
            icon: FolderKanban,
        },
        {
            title: "Quản lý Danh mục dự án",
            description: "Quản lý các danh mục phân loại dự án.",
            href: "/nimda/category",
            icon: Layers,
        },
        {
            title: "Quản lý Phản hồi khách hàng",
            description: "Quản lý các phản hồi của khách hàng.",
            href: "/nimda/customer-feedback",
            icon: Layers,
        },
    ]

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold mb-6">Trang quản trị (Nimda)</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                    <Card key={item.href}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href={item.href}>Truy cập</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
