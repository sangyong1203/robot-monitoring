import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// import VueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        // base:'https://example.com',
        plugins: [
            svgLoader(),

            // 자동 import Element components
            AutoImport({
                dts: 'autoImports.d.ts',
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                dirs: ['src/components'],
                deep: true,
                resolvers: [ElementPlusResolver()],
            }),
            vue(),
        ],
        esbuild: {
            // 프로덕션 환경에서만 console과 debugger 제거
            drop: mode === 'production' ? ['console', 'debugger'] : [],
            target: 'esnext',
        },
        build: {
            // outDir: 'dist', // 기본값, 확인
            emptyOutDir: true,
            assetsDir: 'assets',
            target: 'esnext',
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('src/components/')) {
                            return 'components'
                        }
                    },
                },
            },
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                },
            },
            open: true, // 브라우저 자동 열기
        },

        css: {
            preprocessorOptions: {
                // to avoid legacy JS Api Deprecation Warning
                scss: {
                    api: 'modern-compiler', // or "modern", "legacy"
                },
            },
        },
    }
})
