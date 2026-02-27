"use client"

// Giả sử bạn đã cài đặt và import các component từ thư viện (ví dụ: shadcn/ui)
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { IPost } from "lib/models/post"
import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react"

const POSTS_PER_PAGE = 10 // Số bài viết mỗi trang

export default function PostsPage() {
    const [posts, setPosts] = useState<IPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [postToDelete, setPostToDelete] = useState<IPost | null>(null)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/post?page=${currentPage}&limit=${POSTS_PER_PAGE}`)
                if (!res.ok) {
                    throw new Error("Failed to fetch posts")
                }
                const data = await res.json()
                setPosts(data.data)
                setTotalPages(data.totalPages)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [currentPage])

    const openDeleteDialog = (post: IPost) => {
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

            // Cập nhật lại state để loại bỏ bài viết đã xóa khỏi giao diện
            setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postToDelete._id))
            // Nếu trang hiện tại trống sau khi xóa, hãy quay lại trang trước
            if (posts.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1)
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi xóa.")
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Helper function để tạo ra danh sách các trang cần hiển thị
    const getPaginationRange = () => {
        const totalPageNumbers = 7 // Tổng số nút trang sẽ hiển thị (bao gồm cả '...')
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const leftSiblingIndex = Math.max(currentPage - 2, 1)
        const rightSiblingIndex = Math.min(currentPage + 2, totalPages)

        const shouldShowLeftDots = leftSiblingIndex > 2
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 5
            let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
            return [...leftRange, "...", totalPages]
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 5
            let rightRange = Array.from(
                { length: rightItemCount },
                (_, i) => totalPages - rightItemCount + 1 + i
            )
            return [1, "...", ...rightRange]
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = []
            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                middleRange.push(i)
            }
            return [1, "...", ...middleRange, "...", totalPages]
        }

        // Fallback, mặc dù trường hợp này ít khi xảy ra với logic trên
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const paginationRange = totalPages > 1 ? getPaginationRange() : []

    if (loading) {
        // Skeleton Loader cho trải nghiệm người dùng tốt hơn
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
                                    <Skeleton className="h-12 w-12 rounded-md" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
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
                    <strong className="font-bold mr-2">
                        {/* Giả sử AlertCircle được import từ lucide-react */}
                        {/* <AlertCircle className="inline-block h-5 w-5 mr-1" /> */}
                        Lỗi!
                    </strong>
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
                        <CardTitle>Quản lý Bài viết</CardTitle>
                        <Button asChild>
                            <Link href="/nimda/post/create">Thêm bài viết mới</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead className="w-[100px]">Ảnh</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.length > 0 ? (
                                    posts.map((post, index) => (
                                        <TableRow key={post._id as any}>
                                            <TableCell>{index + 1}</TableCell>
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
                                            <TableCell className="font-medium">
                                                {post.title}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {post.slug}
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
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Chưa có bài viết nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
                            Bài viết "{postToDelete?.title}" sẽ bị xóa vĩnh viễn. Hành động này
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
