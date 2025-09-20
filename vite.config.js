import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 生产环境构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 生成源码映射文件（可选，生产环境建议关闭）
    sourcemap: false,
    // 构建后清除输出目录
    emptyOutDir: true,
    // 压缩配置
    minify: 'terser',
    // Terser 压缩选项
    terserOptions: {
      compress: {
        // 生产环境移除console
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 分包策略
    rollupOptions: {
      output: {
        // 分包
        manualChunks: {
          // 将Vue相关库打包到一起
          vue: ['vue', 'vue-router', 'pinia'],
          // 将Element Plus单独打包
          'element-plus': ['element-plus'],
          // 将工具库打包到一起
          utils: ['axios']
        },
        // 资源文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'images'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }
          return `${extType}/[name]-[hash].[ext]`
        }
      }
    },
    // 设置打包大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  // 服务器配置（开发环境）
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    // 代理配置（如果需要）
    proxy: {
      // '/api': {
      //   target: 'http://120.78.1.49:8100',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  // 预览服务器配置
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
})
