import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/webhook': {
                target: 'https://studio.pucho.ai/api/v1/webhooks',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/webhook/, ''),
            },
        },
    },
})
