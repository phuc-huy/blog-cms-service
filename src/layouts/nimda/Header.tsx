"use client"

import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navLinks = [
    { name: "Khách liên hệ", href: "/nimda/customer-contact" },
    { name: "Dự án", href: "/nimda/project" },
    { name: "Bài viết", href: "/nimda/post" },
    { name: "Danh mục dự án", href: "/nimda/category" },
    { name: "Khách phản hồi", href: "/nimda/customer-feedback" },
    // { name: "Cấu hình", href: "/nimda/config-system" }
]

export default function NimdaHeader() {
    const pathname = usePathname()

    return (
        <header className="fixed top-0 left-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/nimda" className="text-2xl font-bold">
                            Admin
                        </Link>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {navLinks.map((link) => (
                                    <NavigationMenuItem key={link.name}>
                                        <Link href={link.href} legacyBehavior passHref>
                                            <NavigationMenuLink
                                                className={`${navigationMenuTriggerStyle()} ${
                                                    pathname.startsWith(link.href)
                                                        ? "bg-accent text-accent-foreground"
                                                        : ""
                                                }`}
                                            >
                                                {link.name}
                                            </NavigationMenuLink>
                                        </Link>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </nav>
                    {/* Mobile Navigation */}
                    <nav className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <div className="flex flex-col space-y-4 mt-8">
                                    {navLinks.map((link) => (
                                        <SheetClose asChild key={link.name}>
                                            <Link
                                                href={link.href}
                                                className={`block rounded-md px-3 py-2 text-base font-medium ${
                                                    pathname.startsWith(link.href)
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                }`}
                                            >
                                                {link.name}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </nav>
                </div>
            </div>
        </header>
    )
}
