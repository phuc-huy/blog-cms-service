import "assets/styles/font.css"
import "assets/styles/base.css"
import "assets/styles/style.css"
import "assets/styles/reset.css"
import "assets/styles/variables.css"
import "assets/styles/custom-antd.css"

import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google"
import { COMMON_CONFIG } from "configs/common-config"
import Script from "next/script"
import { ConfigProvider } from "antd"
import NextTopLoader from "nextjs-toploader"
import vi_VN from "antd/locale/vi_VN"

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#ffffff"
}

const { slogan, domain, color } = COMMON_CONFIG

export const metadata = {
    // title: slogan,
    metadataBase: new URL(domain),
    openGraph: {
        siteName: slogan,
        type: "website",
        locale: "vi_VN"
    },
    manifest: "/manifest.json",
    applicationName: slogan,
    appleWebApp: {
        title: slogan,
        statusBarStyle: "default",
        capable: true
    },
    robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
        googleBot: "index, follow"
    }
}

const { google_tag_manager, google_adsen, google_analyst } = COMMON_CONFIG.plugin

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            {google_adsen && (
                <head>
                    <meta name="google-adsense-account" content={google_adsen}></meta>
                    <Script
                        async
                        crossOrigin="anonymous"
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${google_adsen}`}
                        strategy="afterInteractive"
                        id="adsense-script"
                    />
                </head>
            )}

            {google_tag_manager && <GoogleTagManager gtmId={google_tag_manager} />}

            <body
                suppressHydrationWarning
                style={
                    {
                        "--color-primary": COMMON_CONFIG.color
                    } as React.CSSProperties
                }
            >
                <NextTopLoader
                    showSpinner={false}
                    color={color}
                    shadow={`0 0 10px ${color},0 0 5px ${color}`}
                />

                <ConfigProvider
                    locale={vi_VN}
                    theme={{
                        token: {
                            borderRadius: 8,
                            colorPrimary: color,
                            fontFamily: '"Poppins", sans-serif'
                        },
                        components: {
                            Carousel: {
                                arrowSize: 28,
                                arrowOffset: 8,
                                dotHeight: 8,
                                dotWidth: 20,
                                dotActiveWidth: 28,
                                dotGap: 4
                            }
                        }
                    }}
                >
                    <>{children}</>
                </ConfigProvider>
            </body>

            {google_analyst && <GoogleAnalytics gaId={google_analyst} />}
        </html>
    )
}
