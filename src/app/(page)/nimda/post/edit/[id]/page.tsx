"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Save, Loader2, Trash2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import RichTextEditor from "@/components/ui/rich-text-editor"

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content_html: ""
    })
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        if (!id) return

        const fetchPost = async () => {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/post/${id}`)
                if (!res.ok) {
                    throw new Error("Không tìm thấy bài viết.")
                }
                const postData = await res.json()
                setFormData({
                    title: postData.title,
                    description: postData.description,
                    content_html: postData.content_html
                })
                setPreviewUrl(postData.thumbnail_url)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchPost()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleContentChange = (content: string) => {
        setFormData((prev) => ({ ...prev, content_html: content }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setThumbnailFile(file)
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)
        }
    }

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


        try {
            let finalThumbnailUrl = previewUrl

            if (thumbnailFile) {
                const uploadFormData = new FormData()
                uploadFormData.append("files", thumbnailFile)
                const uploadRes = await fetch("/api/nimda/upload", {
                    method: "POST",
                    body: uploadFormData
                })
                if (!uploadRes.ok) throw new Error("Upload ảnh thất bại.")
                const uploadData = await uploadRes.json()
                finalThumbnailUrl = uploadData.filePaths[0]
            }

            const res = await fetch(`/api/nimda/post/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, thumbnail_url: finalThumbnailUrl })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || "Không thể cập nhật bài viết.")
            }

            router.push("/nimda/post")
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setIsSubmitting(true)
        setError(null)
        try {
            const res = await fetch(`/api/nimda/post/${id}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || "Không thể xóa bài viết.")
            }

            router.push("/nimda/post")
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xóa.")
        } finally {
            setIsSubmitting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-full flex flex-col justify-center p-4 sm:p-6 lg:p-8">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-7 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-full flex flex-col justify-center p-4 sm:p-6 lg:p-8">
                <Card className="w-full max-w-3xl mx-auto">
                    <div>
                        <CardHeader>
                            <CardTitle>Chỉnh sửa bài viết</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin chi tiết cho bài viết của bạn.
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
                                        Đã chọn file mới: {thumbnailFile.name}
                                    </p>
                                )}
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                disabled={isSubmitting}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                            </Button>
                            <Button onClick={handleSubmit} type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập
                                        nhật...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Cập nhật
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </div>
                </Card>
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bài viết "{formData.title}" sẽ bị xóa vĩnh viễn. Hành động này không thể
                            hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
