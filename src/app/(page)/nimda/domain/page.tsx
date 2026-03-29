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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { IDomain } from "lib/models/domain"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import React, { useEffect, useState } from "react"

interface DomainForm {
    name: string
    key: string
    link: string
}

const emptyForm: DomainForm = { name: "", key: "", link: "" }

export default function DomainPage() {
    const [domains, setDomains] = useState<IDomain[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingDomain, setEditingDomain] = useState<IDomain | null>(null)
    const [form, setForm] = useState<DomainForm>(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [domainToDelete, setDomainToDelete] = useState<IDomain | null>(null)

    const fetchDomains = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/nimda/domain")
            if (!res.ok) throw new Error("Failed to fetch domains")
            const data = await res.json()
            setDomains(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDomains()
    }, [])

    const openCreateForm = () => {
        setEditingDomain(null)
        setForm(emptyForm)
        setFormError(null)
        setIsFormOpen(true)
    }

    const openEditForm = (domain: IDomain) => {
        setEditingDomain(domain)
        setForm({ name: domain.name, key: domain.key, link: domain.link })
        setFormError(null)
        setIsFormOpen(true)
    }

    const closeForm = () => {
        setIsFormOpen(false)
        setEditingDomain(null)
        setForm(emptyForm)
        setFormError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        setSubmitting(true)

        try {
            const isEditing = !!editingDomain
            const url = isEditing
                ? `/api/nimda/domain/${editingDomain._id}`
                : "/api/nimda/domain"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })

            if (!res.ok) {
                const data = await res.json()
                if (res.status === 409) {
                    setFormError("Key đã tồn tại")
                } else {
                    setFormError(data.message || "Đã có lỗi xảy ra")
                }
                return
            }

            closeForm()
            await fetchDomains()
        } catch {
            setFormError("Đã có lỗi xảy ra")
        } finally {
            setSubmitting(false)
        }
    }

    const openDeleteDialog = (domain: IDomain) => {
        setDomainToDelete(domain)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!domainToDelete) return
        try {
            const res = await fetch(`/api/nimda/domain/${domainToDelete._id}`, {
                method: "DELETE"
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Xóa website thất bại")
            }
            setDomains((prev) => prev.filter((d) => d._id !== domainToDelete._id))
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
                        <CardTitle>Quản lý Website</CardTitle>
                        <Button onClick={openCreateForm}>
                            <Plus className="h-4 w-4 mr-1" />
                            Thêm website mới
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isFormOpen && (
                            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        {editingDomain ? "Chỉnh sửa website" : "Thêm website mới"}
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="domain-name">Tên</Label>
                                        <Input
                                            id="domain-name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Tên website"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="domain-key">Key</Label>
                                        <Input
                                            id="domain-key"
                                            value={form.key}
                                            onChange={(e) => setForm({ ...form, key: e.target.value })}
                                            placeholder="key-website"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="domain-link">Link</Label>
                                        <Input
                                            id="domain-link"
                                            value={form.link}
                                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                                            placeholder="https://example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeForm}>
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "Đang lưu..." : editingDomain ? "Cập nhật" : "Tạo mới"}
                                    </Button>
                                </div>
                            </form>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead>Tên</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {domains.length > 0 ? (
                                    domains.map((domain, index) => (
                                        <TableRow key={domain._id as any}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{domain.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{domain.key}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={domain.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {domain.link}
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditForm(domain)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(domain)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Chưa có website nào.
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
                            Website &quot;{domainToDelete?.name}&quot; sẽ bị xóa vĩnh viễn. Hành động này
                            không thể hoàn tác.
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
