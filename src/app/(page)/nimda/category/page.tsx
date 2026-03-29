"use client"

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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { ICategory } from "lib/models/category"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import React, { useEffect, useState } from "react"

interface CategoryForm {
    name: string
    description: string
}

const emptyForm: CategoryForm = { name: "", description: "" }

export default function CategoryPage() {
    const [categories, setCategories] = useState<ICategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
    const [form, setForm] = useState<CategoryForm>(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/nimda/category")
            if (!res.ok) throw new Error("Failed to fetch categories")
            const data = await res.json()
            setCategories(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const openCreateForm = () => {
        setEditingCategory(null)
        setForm(emptyForm)
        setFormError(null)
        setIsFormOpen(true)
    }

    const openEditForm = (category: ICategory) => {
        setEditingCategory(category)
        setForm({ name: category.name, description: category.description })
        setFormError(null)
        setIsFormOpen(true)
    }

    const closeForm = () => {
        setIsFormOpen(false)
        setEditingCategory(null)
        setForm(emptyForm)
        setFormError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        setSubmitting(true)

        try {
            const isEditing = !!editingCategory
            const url = isEditing
                ? `/api/nimda/category/${editingCategory._id}`
                : "/api/nimda/category"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })

            if (!res.ok) {
                const data = await res.json()
                if (res.status === 409) {
                    setFormError("Slug đã tồn tại")
                } else {
                    setFormError(data.message || "Đã có lỗi xảy ra")
                }
                return
            }

            closeForm()
            await fetchCategories()
        } catch {
            setFormError("Đã có lỗi xảy ra")
        } finally {
            setSubmitting(false)
        }
    }

    const openDeleteDialog = (category: ICategory) => {
        setCategoryToDelete(category)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return
        try {
            const res = await fetch(`/api/nimda/category/${categoryToDelete._id}`, {
                method: "DELETE"
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Xóa danh mục thất bại")
            }
            setCategories((prev) => prev.filter((c) => c._id !== categoryToDelete._id))
        } catch (err) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xóa.")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
                    role="alert"
                >
                    <strong className="font-bold mr-2">Lỗi!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Quản lý Danh mục</CardTitle>
                        <Button onClick={openCreateForm}>
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm danh mục mới
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isFormOpen && (
                            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                                    </h3>
                                    <Button type="button" variant="ghost" size="icon" onClick={closeForm}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                {formError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                        {formError}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category-name">Tên</Label>
                                        <Input
                                            id="category-name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Tên danh mục"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category-description">Mô tả</Label>
                                        <Textarea
                                            id="category-description"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Mô tả danh mục"
                                            rows={1}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeForm}>
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "Đang lưu..." : editingCategory ? "Cập nhật" : "Tạo mới"}
                                    </Button>
                                </div>
                            </form>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead>Tên</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <TableRow key={category._id as any}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                            <TableCell className="text-muted-foreground">{category.description}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditForm(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(category)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Chưa có danh mục nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Danh mục &quot;{categoryToDelete?.name}&quot; sẽ bị xóa vĩnh viễn. Các bài viết thuộc danh mục này sẽ không còn được phân loại. Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
