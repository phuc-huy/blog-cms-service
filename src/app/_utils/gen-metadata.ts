import { COMMON_CONFIG } from "configs/common-config"
import { public_route_menu } from "configs/menu/public-menu"

interface ISeoOption {
    title: string
    description?: string
    url?: string
    image_url?: string
    keywords?: string[]
}

const {
    slogan,
    domain,
    meta: { description: meta_description, image_url: meta_image_url, keywords: meta_keywords },
    domain_name,
    alt
} = COMMON_CONFIG

export const genMetadata = (option: ISeoOption) => {
    const {
        title,
        description = meta_description,
        image_url = meta_image_url,
        keywords = meta_keywords,
        url = domain
    } = option

    const new_title = `${title} | ${slogan} - ${domain_name}`

    return {
        title: new_title,
        description,
        keywords,
        openGraph: {
            url,
            type: "website",
            title: new_title,
            description,
            images: [
                {
                    url: image_url,
                    width: 500,
                    height: 500,
                    alt: alt
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: new_title,
            description,
            creator: "@huydq",
            site: "@huydq",
            images: [
                {
                    url: meta_image_url,
                    width: 500,
                    height: 500,
                    alt: alt
                }
            ]
        },
        alternates: {
            canonical: url
        },
        icons: {
            icon: [{ url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
            shortcut: [{ url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
            apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }]
        }
    }
}

export const genMetadataByRoute = (path: string) => {
    const finded_route = [...public_route_menu].find(
        (rou) => rou.path === path
    )

    if (finded_route) {
        const meta = {
            ...finded_route.meta,
            url: `${COMMON_CONFIG.domain}${finded_route.path}`
        }
        return genMetadata(meta)
    }

    return genMetadata({
        title: COMMON_CONFIG.slogan
    })
}
