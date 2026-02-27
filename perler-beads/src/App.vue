<template>
  <div class="min-h-screen bg-cream">
    <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-peach to-mint flex items-center justify-center">
              <i data-lucide="grid-3x3" class="w-5 h-5 text-deep-navy"></i>
            </div>
            <span class="text-lg font-bold gradient-text">拼豆图纸生成器</span>
          </div>
          
          <div class="flex items-center gap-4">
            <a href="../index.html" class="text-sm text-soft-purple hover:text-coral transition-colors flex items-center gap-1">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              返回主页
            </a>
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-14 pb-8">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div class="grid lg:grid-cols-12 gap-6">
          <div class="lg:col-span-4 xl:col-span-3">
            <div class="card p-5 space-y-5 sticky top-20">
              <ImageUpload />
              <ControlPanel @generate="handleGenerate" />
            </div>
          </div>

          <div class="lg:col-span-8 xl:col-span-9 space-y-5">
            <div class="card p-5 min-h-[500px]">
              <PatternPreview />
            </div>

            <div class="grid md:grid-cols-2 gap-5">
              <div class="card p-5">
                <StatsPanel />
              </div>
              <div class="card p-5">
                <ExportPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="py-6 text-center text-sm text-soft-purple/60">
      <p>Powered by NicoSun Lab · 永久免费</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/appStore'
import { quantizeImage, floydSteinbergDither } from './utils/color-space'
import ImageUpload from './components/ImageUpload.vue'
import ControlPanel from './components/ControlPanel.vue'
import PatternPreview from './components/PatternPreview.vue'
import StatsPanel from './components/StatsPanel.vue'
import ExportPanel from './components/ExportPanel.vue'

const store = useAppStore()

function handleGenerate() {
  if (!store.uploadedImage) return

  store.setProcessing(true)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = img.width
    canvas.height = img.height
    
    let adjustedBrightness = store.brightness
    let adjustedContrast = store.contrast
    let adjustedSaturation = store.saturation
    
    ctx.filter = `brightness(${100 + adjustedBrightness}%) contrast(${100 + adjustedContrast}%) saturate(${100 + adjustedSaturation}%)`
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    const colors = store.currentBrandColors.slice(0, store.maxColors)
    
    let result
    if (store.useDithering) {
      const quantized = quantizeImage(imageData, colors, store.gridSize, store.gridSize)
      result = floydSteinbergDither(quantized.pattern, colors, store.gridSize, store.gridSize)
    } else {
      result = quantizeImage(imageData, colors, store.gridSize, store.gridSize)
    }
    
    store.setPattern(result.pattern, result.stats)
    store.setProcessing(false)
  }
  img.src = store.uploadedImage.dataUrl
}

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
