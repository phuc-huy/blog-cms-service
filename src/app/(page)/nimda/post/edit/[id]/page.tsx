"use client"

import React, { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import RichTextEditor from "@/components/ui/rich-text-editor"

interface CategoryOption {
    _id: string
    name: string
    slug: string
}

interface DomainOption {
    _id: string
    name: string
    key: string
    link?: string
}

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content_html: ""
    })
    const [categoryId, setCategoryId] = useState<string>("")
    const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([])
    const [status, setStatus] = useState<string>("draft")
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Dropdown options
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [domains, setDomains] = useState<DomainOption[]>([])

    // Fetch categories and domains on mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [categoryRes, domainRes] = await Promise.all([
                    fetch("/api/nimda/category"),
                    fetch("/api/nimda/domain")
                ])
                if (categoryRes.ok) {
                    const categoryData = await categoryRes.json()
                    setCategories(categoryData)
                }
                if (domainRes.ok) {
                    const domainData = await domainRes.json()
                    setDomains(domainData)
                }
            } catch {
                // Silently fail - dropdowns will just be empty
            }
        }
        fetchOptions()
    }, [])

    // Fetch post data
    useEffect(() => {
        if (!id) return

        const fetchPost = async () => {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/nimda/post/${id}`)
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
                // Pre-select category
                if (postData.category_id) {
                    const catId = typeof postData.category_id === 'object'
                        ? postData.category_id._id
                        : postData.category_id
                    setCategoryId(catId || "")
                }
                // Pre-check domains
                if (postData.domain_ids && Array.isArray(postData.domain_ids)) {
                    const domainIds = postData.domain_ids.map((d: any) =>
                        typeof d === 'object' ? d._id : d
                    )
                    setSelectedDomainIds(domainIds)
                }
                // Pre-select status
                if (postData.status) {
                    setStatus(postData.status)
                }
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

    const handleDomainToggle = (domainId: string, checked: boolean) => {
        setSelectedDomainIds((prev) =>
            checked ? [...prev, domainId] : prev.filter((id) => id !== domainId)
        )
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
                body: JSON.stringify({
                    ...formData,
                    thumbnail_url: finalThumbnailUrl,
                    domain_ids: selectedDomainIds,
                    category_id: categoryId || null,
                    status: status
                })
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
                            <div className="space-y-2">
                                <Label htmlFor="category">Danh mục</Label>
                                <Select value={categoryId} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Chọn danh mục (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không chọn</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                {domains.length > 0 ? (
                                    <div className="space-y-2">
                                        {domains.map((domain) => (
                                            <div key={domain._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`domain-${domain._id}`}
                                                    checked={selectedDomainIds.includes(domain._id)}
                                                    onCheckedChange={(checked) =>
                                                        handleDomainToggle(domain._id, checked === true)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`domain-${domain._id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {domain.name} ({domain.key})
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Chưa có website nào.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Nháp</SelectItem>
                                        <SelectItem value="published">Đã xuất bản</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            Bài viết &quot;{formData.title}&quot; sẽ bị xóa vĩnh viễn. Hành động này không thể
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
