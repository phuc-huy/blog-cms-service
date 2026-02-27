import { COMMON_CONFIG } from "configs/common-config"
import { public_route_menu } from "configs/menu/public-menu"

const site_list = [
    ...public_route_menu.map((route) => ({
        path: route.path,
        priority: route.priority
    }))
]

export default async function sitemap() {
    const result = []

    site_list.forEach((item) => {
        result.push({
            url: item.path ? `${COMMON_CONFIG.domain}${item.path}` : COMMON_CONFIG.domain,
            lastModified: new Date().toISOString(),
            changeFrequency: "daily",
            priority: item.priority
        })
    })

    console.log("-----Gen sitemap-----")
    console.log(result)
    console.log("-----Gen sitemap-----")

    console.log("-----length sitemap-----")
    console.log(result.length)
    console.log("-----length sitemap-----")

    return result
}
