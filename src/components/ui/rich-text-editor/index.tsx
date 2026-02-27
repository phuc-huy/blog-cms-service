"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Youtube from "@tiptap/extension-youtube"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import { useCallback, useEffect, useState, useRef } from "react"
import Toolbar from "./Toolbar"
import LinkModal from "./LinkModal"

interface TiptapEditorProps {
    initialContent?: string
    onChange?: (html: string) => void
    onAutoSave?: (html: string) => void
}

const AUTO_SAVE_KEY = "editor-autosave"
const AUTO_SAVE_INTERVAL = 5000

export default function TiptapEditor({
    initialContent = "",
    onChange,
    onAutoSave
}: TiptapEditorProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"edit" | "preview" | "html">("edit")
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [htmlOutput, setHtmlOutput] = useState("")
    const [copySuccess, setCopySuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto my-4"
                }
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 hover:underline cursor-pointer"
                }
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: "w-full aspect-video rounded-lg my-4"
                }
            }),
            Placeholder.configure({
                placeholder: "Start writing your content here..."
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true
            })
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "prose prose-lg max-w-none min-h-[400px] p-4 focus:outline-none"
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer?.files.length) {
                    const files = Array.from(event.dataTransfer.files)
                    const images = files.filter((file) => file.type.startsWith("image/"))
                    if (images.length > 0) {
                        event.preventDefault()
                        handleImageUpload(images)
                        return true
                    }
                }
                return false
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items
                if (items) {
                    const images: File[] = []
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.startsWith("image/")) {
                            const file = items[i].getAsFile()
                            if (file) images.push(file)
                        }
                    }
                    if (images.length > 0) {
                        event.preventDefault()
                        handleImageUpload(images)
                        return true
                    }
                }
                return false
            }
        },
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = addTailwindClasses(editor.getHTML())
            setHtmlOutput(html)
            setHasUnsavedChanges(true)
            onChange?.(html)
        }
    })

    const addTailwindClasses = (html: string): string => {
        return html
            .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-4 mt-6">')
            .replace(/<h2>/g, '<h2 class="text-2xl font-semibold mb-3 mt-5">')
            .replace(/<h3>/g, '<h3 class="text-xl font-medium mb-2 mt-4">')
            .replace(/<p>/g, '<p class="mb-4 leading-relaxed">')
            .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4 space-y-1">')
            .replace(/<ol>/g, '<ol class="list-decimal pl-6 mb-4 space-y-1">')
            .replace(/<li>/g, '<li class="leading-relaxed">')
            .replace(
                /<blockquote>/g,
                '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">'
            )
            .replace(
                /<pre>/g,
                '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">'
            )
            .replace(
                /<code>/g,
                '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm">'
            )
    }

    const handleImageUpload = useCallback(
        async (files: File[]) => {
            if (!editor || isUploading) return

            setIsUploading(true)

            for (const file of files) {
                const formData = new FormData()
                formData.append("files", file)

                try {
                    const response = await fetch("/api/nimda/upload", {
                        method: "POST",
                        body: formData
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.filePaths && data.filePaths.length > 0) {
                            editor.chain().focus().setImage({ src: data.filePaths[0] }).run()
                        }
                    } else {
                        console.error("Upload failed")
                    }
                } catch (error) {
                    console.error("Upload error:", error)
                }
            }

            setIsUploading(false)
        },
        [editor, isUploading]
    )

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files
            if (files && files.length > 0) {
                handleImageUpload(Array.from(files))
            }
            event.target.value = ""
        },
        [handleImageUpload]
    )

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleSetLink = useCallback(
        (url: string) => {
            if (!editor) return

            if (url === "") {
                editor.chain().focus().extendMarkRange("link").unsetLink().run()
                return
            }

            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        },
        [editor]
    )

    const handleAddYoutube = useCallback(
        (url: string) => {
            if (!editor) return
            editor.commands.setYoutubeVideo({ src: url })
        },
        [editor]
    )

    // Auto-save effect
    useEffect(() => {
        if (!editor) return

        const interval = setInterval(() => {
            if (hasUnsavedChanges) {
                const html = addTailwindClasses(editor.getHTML())
                localStorage.setItem(AUTO_SAVE_KEY, html)
                setLastSaved(new Date())
                setHasUnsavedChanges(false)
                onAutoSave?.(html)
            }
        }, AUTO_SAVE_INTERVAL)

        return () => clearInterval(interval)
    }, [editor, hasUnsavedChanges, onAutoSave])

    // Load from localStorage on mount
    useEffect(() => {
        if (!editor) return

        const saved = localStorage.getItem(AUTO_SAVE_KEY)
        if (saved && !initialContent) {
            editor.commands.setContent(saved)
            setHtmlOutput(saved)
        }
    }, [editor, initialContent])

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [hasUnsavedChanges])

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(htmlOutput).then(() => {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        })
    }, [htmlOutput])

    const clearEditor = useCallback(() => {
        if (!editor) return
        if (confirm("Are you sure you want to clear all content?")) {
            editor.commands.clearContent()
            localStorage.removeItem(AUTO_SAVE_KEY)
            setHtmlOutput("")
            setLastSaved(null)
        }
    }, [editor])

    const restoreFromAutoSave = useCallback(() => {
        if (!editor) return
        const saved = localStorage.getItem(AUTO_SAVE_KEY)
        if (saved) {
            editor.commands.setContent(saved)
            setHtmlOutput(saved)
        }
    }, [editor])

    if (!editor) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">Content Editor</h2>
                <div className="flex items-center gap-3 text-sm">
                    {isUploading && (
                        <span className="text-blue-600 flex items-center gap-1">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Uploading...
                        </span>
                    )}
                    {lastSaved && (
                        <span className="text-green-600">
                            Saved at {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    {hasUnsavedChanges && <span className="text-yellow-600">Unsaved changes</span>}
                </div>
            </div>

            {/* Toolbar */}
            <Toolbar
                editor={editor}
                onImageUpload={triggerFileInput}
                onLinkClick={() => setIsLinkModalOpen(true)}
                onYoutubeClick={() => {
                    const url = prompt("Enter YouTube URL:")
                    if (url) handleAddYoutube(url)
                }}
            />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("edit")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "edit"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                    Edit
                </button>
                <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "preview"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                    Preview
                </button>
                <button
                    onClick={() => setActiveTab("html")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "html"
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                    HTML Code
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === "edit" && (
                    <EditorContent editor={editor} className="editor-content" />
                )}

                {activeTab === "preview" && (
                    <div
                        className="p-6 prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: htmlOutput }}
                    />
                )}

                {activeTab === "html" && (
                    <div className="p-4">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap break-words">
                            <code>{htmlOutput || "<p>No content yet...</p>"}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                    <button
                        onClick={restoreFromAutoSave}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                    >
                        Restore Auto-save
                    </button>
                    <button
                        onClick={clearEditor}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                        Clear All
                    </button>
                </div>
                <button
                    onClick={copyToClipboard}
                    className={`px-4 py-1.5 text-sm rounded transition-colors ${
                        copySuccess
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    {copySuccess ? "Copied!" : "Copy HTML"}
                </button>
            </div>

            {/* Link Modal */}
            <LinkModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSubmit={handleSetLink}
                initialUrl={editor.getAttributes("link").href || ""}
            />

            {/* Editor Styles */}
            <style jsx global>{`
                .editor-content .ProseMirror {
                    min-height: 400px;
                    padding: 1rem;
                    outline: none;
                }

                .editor-content .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }

                .editor-content .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }

                .editor-content .ProseMirror img.ProseMirror-selectednode {
                    outline: 3px solid #3b82f6;
                    outline-offset: 2px;
                }

                .editor-content .ProseMirror h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    margin-top: 1.5rem;
                }

                .editor-content .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    margin-top: 1.25rem;
                }

                .editor-content .ProseMirror h3 {
                    font-size: 1.25rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    margin-top: 1rem;
                }

                .editor-content .ProseMirror p {
                    margin-bottom: 1rem;
                    line-height: 1.625;
                }

                .editor-content .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }

                .editor-content .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }

                .editor-content .ProseMirror li {
                    margin-bottom: 0.25rem;
                }

                .editor-content .ProseMirror blockquote {
                    border-left: 4px solid #d1d5db;
                    padding-left: 1rem;
                    font-style: italic;
                    color: #6b7280;
                    margin: 1rem 0;
                }

                .editor-content .ProseMirror a {
                    color: #2563eb;
                    text-decoration: underline;
                    cursor: pointer;
                }

                .editor-content .ProseMirror a:hover {
                    color: #1d4ed8;
                }

                .editor-content .ProseMirror pre {
                    background-color: #1f2937;
                    color: #f3f4f6;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                }

                .editor-content .ProseMirror code {
                    background-color: #f3f4f6;
                    color: #dc2626;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }

                .editor-content .ProseMirror pre code {
                    background-color: transparent;
                    color: inherit;
                    padding: 0;
                }

                .editor-content .ProseMirror mark {
                    background-color: #fef08a;
                    padding: 0.125rem;
                }

                .editor-content .ProseMirror iframe {
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    )
}
