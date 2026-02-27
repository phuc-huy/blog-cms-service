"use client"

import { useState, useEffect, useCallback } from "react"

interface LinkModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (url: string) => void
    initialUrl?: string
}

export default function LinkModal({ isOpen, onClose, onSubmit, initialUrl = "" }: LinkModalProps) {
    const [url, setUrl] = useState(initialUrl)

    useEffect(() => {
        if (isOpen) {
            setUrl(initialUrl)
        }
    }, [isOpen, initialUrl])

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()
            onSubmit(url)
            onClose()
        },
        [url, onSubmit, onClose]
    )

    const handleRemoveLink = useCallback(() => {
        onSubmit("")
        onClose()
    }, [onSubmit, onClose])

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        },
        [onClose]
    )

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown)
            return () => document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {initialUrl ? "Edit Link" : "Insert Link"}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="url"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            {initialUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveLink}
                                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Remove Link
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {initialUrl ? "Update" : "Insert"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
