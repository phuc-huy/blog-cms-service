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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Image as ImageIcon, Pencil, Trash2, Search } from "lucide-react"
import useDebounce from "@/hooks/util/useDebounce"
import { formatDatetime } from "utils/format-datetime"

const POSTS_PER_PAGE = 10

interface DomainOption {
    _id: string
    name: string
    key: string
}

interface CategoryOption {
    _id: string
    name: string
    slug: string
}

interface PopulatedDomain {
    _id: string
    name: string
    key: string
    link?: string
}

interface PopulatedCategory {
    _id: string
    name: string
    slug: string
}

interface PostItem {
    _id: string
    post_id: string
    title: string
    slug: string
    description: string
    thumbnail_url: string
    domain_ids: PopulatedDomain[]
    category_id: PopulatedCategory | null
    status: "draft" | "published"
    published_at: string | null
    createdAt: string
    updatedAt: string
}

export default function PostsPage() {
    const [posts, setPosts] = useState<PostItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter state
    const [domainFilter, setDomainFilter] = useState<string>("")
    const [categoryFilter, setCategoryFilter] = useState<string>("")
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Dropdown options
    const [domains, setDomains] = useState<DomainOption[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [postToDelete, setPostToDelete] = useState<PostItem | null>(null)

    // Fetch domains and categories for filter dropdowns on mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [domainRes, categoryRes] = await Promise.all([
                    fetch("/api/nimda/domain"),
                    fetch("/api/nimda/category")
                ])
                if (domainRes.ok) {
                    const domainData = await domainRes.json()
                    setDomains(domainData)
                }
                if (categoryRes.ok) {
                    const categoryData = await categoryRes.json()
                    setCategories(categoryData)
                }
            } catch {
                // Silently fail - dropdowns will just be empty
            }
        }
        fetchOptions()
    }, [])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [domainFilter, categoryFilter, statusFilter, debouncedSearch])

    // Fetch posts with filters
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set("page", String(currentPage))
            params.set("limit", String(POSTS_PER_PAGE))
            if (domainFilter && domainFilter !== "all") params.set("domain_id", domainFilter)
            if (categoryFilter && categoryFilter !== "all") params.set("category_id", categoryFilter)
            if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
            if (debouncedSearch) params.set("search", debouncedSearch)

            const res = await fetch(`/api/nimda/post?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to fetch posts")
            const data = await res.json()
            setPosts(data.data)
            setTotalPages(data.totalPages)
            setTotal(data.total)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setLoading(false)
        }
    }, [currentPage, domainFilter, categoryFilter, statusFilter, debouncedSearch])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    const openDeleteDialog = (post: PostItem) => {
        setPostToDelete(post)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return
        try {
            const res = await fetch(`/api/nimda/post/${postToDelete._id}`, {
                method: "DELETE"
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || "Xóa bài viết thất bại")
            }
            // Re-fetch to update list
            await fetchPosts()
        } catch (err) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xóa.")
        }
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Pagination range helper
    const getPaginationRange = () => {
        const totalPageNumbers = 7
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }
        const leftSiblingIndex = Math.max(currentPage - 2, 1)
        const rightSiblingIndex = Math.min(currentPage + 2, totalPages)
        const shouldShowLeftDots = leftSiblingIndex > 2
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftRange = Array.from({ length: 5 }, (_, i) => i + 1)
            return [...leftRange, "...", totalPages]
        }
        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightRange = Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
            return [1, "...", ...rightRange]
        }
        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = []
            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                middleRange.push(i)
            }
            return [1, "...", ...middleRange, "...", totalPages]
        }
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const paginationRange = totalPages > 1 ? getPaginationRange() : []

    return (
        <>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Quản lý Bài viết</CardTitle>
                        <Button asChild>
                            <Link href="/nimda/post/create">Thêm bài viết mới</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Filter bar */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="relative w-full sm:w-[220px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo tiêu đề..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={domainFilter} onValueChange={setDomainFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Tất cả Website" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả Website</SelectItem>
                                    {domains.map((d) => (
                                        <SelectItem key={d._id} value={d._id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Tất cả Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả Danh mục</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="Tất cả Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả Trạng thái</SelectItem>
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="published">Đã xuất bản</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-12 w-12 rounded-md" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div
                                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
                                role="alert"
                            >
                                <strong className="font-bold mr-2">Lỗi!</strong>
                                <span>{error}</span>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead className="w-[80px]">Ảnh</TableHead>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Danh mục</TableHead>
                                        <TableHead>Website</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.length > 0 ? (
                                        posts.map((post, index) => (
                                            <TableRow key={post._id}>
                                                <TableCell>
                                                    {(currentPage - 1) * POSTS_PER_PAGE + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {post.thumbnail_url ? (
                                                        <img
                                                            src={post.thumbnail_url}
                                                            alt={post.title}
                                                            className="h-10 w-16 object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-16 items-center justify-center rounded-md bg-secondary">
                                                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium max-w-[200px] truncate">
                                                    {post.title}
                                                </TableCell>
                                                <TableCell>
                                                    {post.category_id ? post.category_id.name : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {post.domain_ids && post.domain_ids.length > 0 ? (
                                                            post.domain_ids.map((domain) => (
                                                                <Badge key={domain._id} variant="outline">
                                                                    {domain.name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {post.status === "published" ? (
                                                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">
                                                            Đã xuất bản
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Nháp</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDatetime(post.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/nimda/post/edit/${post._id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(post)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                Chưa có bài viết nào.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    {paginationRange.length > 0 && (
                        <CardFooter>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handlePageChange(currentPage - 1)
                                            }}
                                            className={
                                                currentPage === 1
                                                    ? "pointer-events-none opacity-50"
                                                    : undefined
                                            }
                                        />
                                    </PaginationItem>
                                    {paginationRange.map((pageNumber, index) =>
                                        pageNumber === "..." ? (
                                            <PaginationItem key={`dots-${index}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handlePageChange(pageNumber as number)
                                                    }}
                                                    isActive={currentPage === pageNumber}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handlePageChange(currentPage + 1)
                                            }}
                                            className={
                                                currentPage === totalPages
                                                    ? "pointer-events-none opacity-50"
                                                    : undefined
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </CardFooter>
                    )}
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bài viết &quot;{postToDelete?.title}&quot; sẽ bị xóa vĩnh viễn. Hành động này
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
