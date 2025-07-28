import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@c': path.resolve(__dirname, 'src/components')
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
      }
    }
  },
  server: {
    host: '0.0.0.0'
    // 你也可以加上 port: 5173，指定端口号（可选）
    // port: 3000
  }
})
