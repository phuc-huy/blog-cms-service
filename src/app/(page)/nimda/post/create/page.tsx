"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import RichTextEditor from "@/components/ui/rich-text-editor"

export default function CreatePostPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content_html: "",
        thumbnail_url: ""
    })
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleContentChange = (content: string) => {
        setFormData((prev) => ({
            ...prev,
            content_html: content
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setThumbnailFile(file)

            // Tạo URL để xem trước
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)
        }
    }

    // Dọn dẹp object URL để tránh rò rỉ bộ nhớ
    useEffect(() => {
        // Hàm cleanup sẽ được gọi khi component unmount hoặc khi previewUrl thay đổi
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
        // Thêm previewUrl vào dependency array để effect chạy lại khi nó thay đổi
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewUrl])

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        if (!formData.title) {
            setError("Tiêu đề là trường bắt buộc.")
            setIsSubmitting(false)
            return
        }

        if (!formData.description) {
            setError("Mô tả là trường bắt buộc.")
            setIsSubmitting(false)
            return
        }

        if (!formData.content_html || formData.content_html === "<p></p>") {
            setError("Nội dung là trường bắt buộc.")
            setIsSubmitting(false)
            return
        }

        if (!thumbnailFile) {
            setError("Ảnh đại diện là trường bắt buộc.")
            setIsSubmitting(false)
            return
        }

        let finalThumbnailUrl = formData.thumbnail_url

        try {
            // 1. Nếu có file được chọn, upload file trước
            if (thumbnailFile) {
                const uploadFormData = new FormData()
                uploadFormData.append("files", thumbnailFile)

                const uploadRes = await fetch("/api/nimda/upload", {
                    method: "POST",
                    body: uploadFormData
                })

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json()
                    throw new Error(errorData.message || "Upload ảnh thất bại.")
                }

                const uploadData = await uploadRes.json()
                finalThumbnailUrl = uploadData.filePaths[0] // Lấy URL từ kết quả upload
            }

            // 2. Tạo bài viết với dữ liệu đã có (bao gồm URL ảnh mới)
            const res = await fetch("/api/nimda/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, thumbnail_url: finalThumbnailUrl })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || "Không thể tạo bài viết.")
            }

            // Xóa content của RichTextEditor lưu ở localstorage
            localStorage.removeItem("editor-autosave")

            // Chuyển hướng về trang danh sách bài viết sau khi tạo thành công
            router.push("/nimda/post")
            router.refresh() // Yêu cầu Next.js làm mới dữ liệu ở trang danh sách
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        // Sử dụng flexbox để căn giữa theo chiều dọc và ngang
        <div className="min-h-full flex flex-col justify-center p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-3xl mx-auto">
                <div>
                    <CardHeader>
                        <CardTitle>Tạo bài viết mới</CardTitle>
                        <CardDescription>
                            Điền thông tin chi tiết cho bài viết của bạn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content_html">Nội dung</Label>
                            <RichTextEditor
                                initialContent={formData.content_html}
                                onChange={handleContentChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thumbnail_file">Ảnh đại diện</Label>
                            {previewUrl && (
                                <div className="mt-2">
                                    <img
                                        src={previewUrl}
                                        alt="Xem trước ảnh"
                                        className="h-40 w-auto rounded-lg object-cover"
                                    />
                                </div>
                            )}
                            <Input
                                id="thumbnail_file"
                                name="thumbnail_file"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            {thumbnailFile && (
                                <p className="text-sm text-muted-foreground">
                                    Đã chọn file: {thumbnailFile.name}
                                </p>
                            )}
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSubmit} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu bài viết
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </div>
            </Card>
        </div>
    )
}
