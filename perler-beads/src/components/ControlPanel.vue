<template>
  <div class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-deep-navy mb-2">
        拼豆品牌
      </label>
      <select 
        :value="store.selectedBrandId"
        @change="store.setBrand($event.target.value)"
        class="input-field"
      >
        <option 
          v-for="brand in store.brands" 
          :key="brand.id" 
          :value="brand.id"
        >
          {{ brand.fullName }} ({{ brand.colorCount }}色)
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-deep-navy mb-2">
        图案尺寸: {{ store.gridSize }} x {{ store.gridSize }}
      </label>
      <div class="flex gap-2 mb-2">
        <button 
          v-for="size in presetSizes" 
          :key="size"
          @click="store.setGridSize(size)"
          class="px-3 py-1.5 text-sm rounded-lg transition-colors"
          :class="store.gridSize === size 
            ? 'bg-coral text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ size }}
        </button>
      </div>
      <input 
        type="range" 
        min="10" 
        max="100" 
        :value="store.gridSize"
        @input="store.setGridSize(Number($event.target.value))"
        class="slider-track w-full"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-deep-navy mb-2">
        实时预览
      </label>
      <div class="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <img 
          v-if="store.previewUrl" 
          :src="store.previewUrl" 
          alt="预览"
          class="max-w-full max-h-full object-contain"
        >
        <span v-else class="text-gray-400 text-sm">上传图片后显示预览</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-deep-navy mb-2">
        最大颜色数: {{ store.maxColors }}
      </label>
      <input 
        type="range" 
        min="2" 
        max="100" 
        :value="store.maxColors"
        @input="store.setMaxColors(Number($event.target.value))"
        class="slider-track w-full"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-deep-navy mb-2">
        颜色容差: {{ store.colorTolerance }}
      </label>
      <input 
        type="range" 
        min="0" 
        max="100" 
        :value="store.colorTolerance"
        @input="store.setColorTolerance(Number($event.target.value))"
        class="slider-track w-full"
      >
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>精确</span>
        <span>宽松</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-deep-navy mb-2">
        图像调整
      </label>
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500 w-12">亮度</span>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            :value="store.brightness"
            @input="store.setBrightness(Number($event.target.value))"
            class="slider-track flex-1"
          >
          <span class="text-xs text-gray-400 w-8 text-right">{{ store.brightness }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500 w-12">对比度</span>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            :value="store.contrast"
            @input="store.setContrast(Number($event.target.value))"
            class="slider-track flex-1"
          >
          <span class="text-xs text-gray-400 w-8 text-right">{{ store.contrast }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500 w-12">饱和度</span>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            :value="store.saturation"
            @input="store.setSaturation(Number($event.target.value))"
            class="slider-track flex-1"
          >
          <span class="text-xs text-gray-400 w-8 text-right">{{ store.saturation }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-deep-navy">
        启用抖动效果
      </label>
      <button 
        @click="store.setDithering(!store.useDithering)"
        class="relative w-12 h-6 rounded-full transition-colors"
        :class="store.useDithering ? 'bg-coral' : 'bg-gray-300'"
      >
        <span 
          class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
          :class="store.useDithering ? 'left-7' : 'left-1'"
        ></span>
      </button>
    </div>

    <button 
      @click="$emit('generate')"
      :disabled="!store.uploadedImage || store.isProcessing"
      class="btn-coral w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <i v-if="store.isProcessing" data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>
      <i v-else data-lucide="sparkles" class="w-5 h-5"></i>
      {{ store.isProcessing ? '生成中...' : '生成图案' }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const presetSizes = [29, 50, 64, 80, 100]

defineEmits(['generate'])

function updatePreview() {
  if (!store.uploadedImage) return
  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    
    ctx.filter = `brightness(${100 + store.brightness}%) contrast(${100 + store.contrast}%) saturate(${100 + store.saturation}%)`
    ctx.drawImage(img, 0, 0)
    store.setPreviewUrl(canvas.toDataURL('image/png'))
  }
  img.src = store.uploadedImage.dataUrl
}

watch(() => store.uploadedImage, (newVal) => {
  if (newVal) {
    updatePreview()
  }
}, { immediate: true })

watch([() => store.brightness, () => store.contrast, () => store.saturation], () => {
  if (store.uploadedImage) {
    updatePreview()
  }
})

onMounted(() => {
  if (window.lucide) {
    window.lucide.createIcons()
  }
})
</script>
