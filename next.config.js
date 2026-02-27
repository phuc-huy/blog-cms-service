const trueEnv = ['true', '1', 'yes']
const esmExternals = trueEnv.includes(
    process.env?.NEXTJS_ESM_EXTERNALS ?? 'false'
)

module.exports = {
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },


    productionBrowserSourceMaps: false,

    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true
    },

    reactStrictMode: true,

    experimental: {
        esmExternals,
        images: {
            layoutRaw: true
        }
    },

    images: {
        domains: [
            'mascothongkhanh.vn'
        ]
    },

    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: '/api/nimda/upload/file/:path*',
            },
        ]
    },
}
