"use client"

import { Editor } from "@tiptap/react"
import { useCallback, useState } from "react"

interface ToolbarProps {
    editor: Editor
    onImageUpload: () => void
    onLinkClick: () => void
    onYoutubeClick: () => void
}

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded transition-colors ${
                isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    )
}

function ToolbarDivider() {
    return <div className="w-px h-6 bg-gray-300 mx-1" />
}

export default function Toolbar({
    editor,
    onImageUpload,
    onLinkClick,
    onYoutubeClick
}: ToolbarProps) {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showHighlightPicker, setShowHighlightPicker] = useState(false)

    const colors = [
        "#000000",
        "#374151",
        "#dc2626",
        "#ea580c",
        "#ca8a04",
        "#16a34a",
        "#0891b2",
        "#2563eb",
        "#7c3aed",
        "#db2777"
    ]

    const highlightColors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"]

    const setTextAlign = useCallback(
        (align: "left" | "center" | "right") => {
            editor.chain().focus().setTextAlign(align).run()
        },
        [editor]
    )

    return (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 bg-white">
            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Bold (Ctrl+B)"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4v16h8.5c2.5 0 4.5-2 4.5-4.5 0-1.57-.81-2.96-2.04-3.77C17.6 10.96 18 9.82 18 8.5 18 6 16 4 13.5 4H6zm3 3h4.5c.83 0 1.5.67 1.5 1.5S14.33 10 13.5 10H9V7zm0 6h5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H9v-3z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italic (Ctrl+I)"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4h-8z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Underline (Ctrl+U)"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Strikethrough"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
            >
                <span className="text-sm font-bold">H1</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
            >
                <span className="text-sm font-bold">H2</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                title="Heading 3"
            >
                <span className="text-sm font-bold">H3</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                isActive={editor.isActive("paragraph")}
                title="Paragraph"
            >
                <span className="text-sm">P</span>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Numbered List"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Quote"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive("codeBlock")}
                title="Code Block"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Text Align */}
            <ToolbarButton
                onClick={() => setTextAlign("left")}
                isActive={editor.isActive({ textAlign: "left" })}
                title="Align Left"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => setTextAlign("center")}
                isActive={editor.isActive({ textAlign: "center" })}
                title="Align Center"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => setTextAlign("right")}
                isActive={editor.isActive({ textAlign: "right" })}
                title="Align Right"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* Colors */}
            <div className="relative">
                <ToolbarButton
                    onClick={() => {
                        setShowColorPicker(!showColorPicker)
                        setShowHighlightPicker(false)
                    }}
                    title="Text Color"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 2L5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z" />
                        <rect x="3" y="18" width="18" height="3" fill="currentColor" />
                    </svg>
                </ToolbarButton>
                {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 flex gap-1 flex-wrap w-32">
                        {colors.map((color) => (
                            <button
                                key={color}
                                onClick={() => {
                                    editor.chain().focus().setColor(color).run()
                                    setShowColorPicker(false)
                                }}
                                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => {
                                editor.chain().focus().unsetColor().run()
                                setShowColorPicker(false)
                            }}
                            className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center text-xs"
                            title="Remove color"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="relative">
                <ToolbarButton
                    onClick={() => {
                        setShowHighlightPicker(!showHighlightPicker)
                        setShowColorPicker(false)
                    }}
                    isActive={editor.isActive("highlight")}
                    title="Highlight"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.24 2c.35 0 .68.14.93.38l5.45 5.46c.5.5.5 1.32 0 1.82l-8.17 8.17-1.06-1.06 3.53-3.53-3.53-3.53L9.86 12.2l-.7-.7 6.35-6.36-1.49-1.49L7.17 10.5l3.18 3.18L6.7 17.35 2 12.65l2.83-2.83-1.41-1.41L.59 11.24c-.39.39-.39 1.02 0 1.41l6.36 6.36c.39.39 1.02.39 1.41 0l3.18-3.18 1.06 1.06L6.24 23.24h11.52l4.95-4.95c.5-.5.5-1.32 0-1.82l-8.4-8.4c-.25-.25-.58-.38-.93-.38-.35 0-.68.13-.93.38l-.71.7 1.42 1.42.7-.71c.13-.13.31-.2.49-.2.18 0 .36.07.49.2l6.54 6.53c.27.27.27.72 0 .99l-4.25 4.25H8.48l4.58-4.59 1.06 1.06 4.95-4.95c.5-.5.5-1.32 0-1.82l-5.46-5.45c-.25-.25-.58-.38-.93-.38z" />
                    </svg>
                </ToolbarButton>
                {showHighlightPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 flex gap-1 flex-wrap w-24">
                        {highlightColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => {
                                    editor.chain().focus().toggleHighlight({ color }).run()
                                    setShowHighlightPicker(false)
                                }}
                                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <button
                            onClick={() => {
                                editor.chain().focus().unsetHighlight().run()
                                setShowHighlightPicker(false)
                            }}
                            className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center text-xs"
                            title="Remove highlight"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <ToolbarDivider />

            {/* Insert */}
            <ToolbarButton onClick={onImageUpload} title="Insert Image">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={onLinkClick}
                isActive={editor.isActive("link")}
                title="Insert Link"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton onClick={onYoutubeClick} title="Insert YouTube Video">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                </svg>
            </ToolbarButton>

            <ToolbarDivider />

            {/* History */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Shift+Z)"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
                </svg>
            </ToolbarButton>
        </div>
    )
}
