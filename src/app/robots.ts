import { COMMON_CONFIG } from "configs/common-config"
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: "/private/"
        },
        sitemap: `${COMMON_CONFIG}/sitemap.xml`
    }
}
