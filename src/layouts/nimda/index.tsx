import React from "react"
import Header from "./Header"


export default function NimdaLayout({ children }) {
    return (
        <>
            <div className="w-full min-h-screen font-inter">
                <Header />
                <main className="grid grid-cols-1 gap-0 pt-16">{children}</main>
                {/* <Footer /> */}
            </div>
        </>
    )
}
