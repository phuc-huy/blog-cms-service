"use client"

import React, { useCallback } from "react"
import { Toggle } from "@/components/ui/toggle" // Sử dụng Toggle component cho toolbar
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading2,
    List,
    ListOrdered,
    Image as ImageIcon
} from "lucide-react"

// Component Toolbar để chứa các nút điều khiển
const Toolbar = ({ editor }: { editor: Editor | null }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleImageUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!editor || !event.target.files || event.target.files.length === 0) {
                return
            }
            const file = event.target.files[0]
            const formData = new FormData()
            // Dựa theo form tạo bài viết, API key cho file là 'files'
            formData.append("files", file)

            try {
                // Gọi API upload của bạn
                const res = await fetch("/api/nimda/upload", {
                    method: "POST",
                    body: formData
                })
                if (!res.ok) {
                    throw new Error("Upload failed")
                }
                const data = await res.json()
                const url = data.filePaths[0] // Lấy URL từ response

                // Chèn ảnh vào editor
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run()
                }
            } catch (error) {
                console.error("Image upload error:", error)
                alert("Tải ảnh lên thất bại!")
            }
        },
        [editor]
    )

    if (!editor) {
        return null
    }

    return (
        <div className="border border-input rounded-t-md p-2 flex flex-wrap items-center gap-1">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
            />
            <Toggle
                type="button"
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                aria-label="Upload Image"
            >
                <ImageIcon className="h-5 w-5" />
            </Toggle>
            <Toggle
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                pressed={editor.isActive("bold")}
                size="sm"
            >
                <Bold className="h-5 w-5" />
            </Toggle>
            <Toggle
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                pressed={editor.isActive("italic")}
                size="sm"
            >
                <Italic className="h-5 w-5" />
            </Toggle>
            <Toggle
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                pressed={editor.isActive("heading", { level: 2 })}
                size="sm"
            >
                <Heading2 className="h-5 w-5" />
            </Toggle>
            <Toggle
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                pressed={editor.isActive("bulletList")}
                size="sm"
            >
                <List className="h-5 w-5" />
            </Toggle>
            <Toggle
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                pressed={editor.isActive("orderedList")}
                size="sm"
            >
                <ListOrdered className="h-5 w-5" />
            </Toggle>
        </div>
    )
}

// Component Editor chính
interface RichTextEditorProps {
    value: string
    onChange: (richText: string) => void
}

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Tắt các extension không cần thiết nếu muốn
            }),
            Image.configure({
                inline: false, // Ảnh sẽ không nằm cùng dòng với text
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4" // Thêm class Tailwind cho ảnh
                }
            })
        ],
        immediatelyRender: false,
        content: value,
        editorProps: {
            attributes: {
                class: "prose max-w-none rounded-b-md border-x border-b border-input bg-transparent px-3 py-2 text-sm ring-offset-background min-h-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-black"
            }
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        }
    })

    return (
        <div>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
