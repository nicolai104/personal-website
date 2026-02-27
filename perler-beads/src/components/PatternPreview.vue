<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-deep-navy">生成结果</h3>
      <div class="flex items-center gap-2">
        <button 
          @click="store.setShowGrid(!store.showGrid)"
          class="p-2 rounded-lg transition-colors"
          :class="store.showGrid ? 'bg-coral/10 text-coral' : 'bg-gray-100 text-gray-500'"
          title="显示网格"
        >
          <i data-lucide="grid" class="w-4 h-4"></i>
        </button>
        <label 
          class="flex items-center gap-1.5 text-xs cursor-pointer select-none px-2 py-1 rounded-lg transition-colors"
          :class="store.showCellCode ? 'bg-coral/10 text-coral' : 'bg-gray-100 text-gray-500'"
        >
          <input 
            type="checkbox" 
            :checked="store.showCellCode"
            @change="store.setShowCellCode($event.target.checked)"
            class="sr-only"
          >
          <i data-lucide="hash" class="w-3.5 h-3.5"></i>
          <span class="whitespace-nowrap">色号</span>
        </label>
        <button 
          @click="zoomOut"
          class="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          title="缩小"
        >
          <i data-lucide="zoom-out" class="w-4 h-4"></i>
        </button>
        <span class="text-sm text-gray-400 min-w-[50px] text-center">
          {{ Math.round(store.zoomLevel * 100) }}%
        </span>
        <button 
          @click="zoomIn"
          class="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          title="放大"
        >
          <i data-lucide="zoom-in" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <div 
      v-if="!store.generatedPattern || store.generatedPattern.length === 0" 
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-peach/30 to-mint/30 flex items-center justify-center">
          <i data-lucide="image" class="w-12 h-12 text-coral/50"></i>
        </div>
        <p class="text-soft-purple">上传图片并设置参数后<br>点击"生成图案"按钮</p>
      </div>
    </div>

    <div 
      v-if="store.isProcessing" 
      class="flex-1 flex flex-col items-center justify-center"
    >
      <div class="w-16 h-16 mb-4 relative">
        <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div class="absolute inset-0 rounded-full border-4 border-coral border-t-transparent animate-spin"></div>
      </div>
      <p class="text-coral font-medium mb-2">图片生成中...</p>
      <div class="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-peach to-coral rounded-full animate-pulse" style="width: 60%"></div>
      </div>
    </div>

    <div 
      v-else-if="store.generatedPattern && store.generatedPattern.length > 0" 
      class="flex-1 overflow-auto bg-gray-50 rounded-xl p-4"
    >
      <div 
        class="inline-block"
        :style="{ transform: `scale(${store.zoomLevel})`, transformOrigin: 'top left' }"
      >
        <div 
          v-for="(row, rowIndex) in store.generatedPattern" 
          :key="rowIndex"
          class="flex"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="bead-cell flex items-center justify-center"
            :class="{ 'show-code': store.showCellCode }"
            :style="{
              width: cellSize + 'px',
              height: cellSize + 'px',
              backgroundColor: cell.hex,
              border: store.showGrid ? '1px solid rgba(0,0,0,0.1)' : 'none',
              fontSize: store.showCellCode ? (cellSize * 0.35) + 'px' : '0'
            }"
            :title="`${cell.name} (${cell.code})`"
            @mouseenter="hoveredCell = { row: rowIndex, col: colIndex, color: cell }"
            @mouseleave="hoveredCell = null"
          >
            <span 
              v-if="store.showCellCode" 
              class="font-mono font-bold"
              :style="{ color: getContrastColor(cell.hex) }"
            >
              {{ cell.code.replace('S', '').replace('P', '').replace('H', '') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hoveredCell" class="mt-3 p-3 bg-white rounded-lg shadow-sm flex items-center gap-3">
      <div 
        class="w-8 h-8 rounded border"
        :style="{ backgroundColor: hoveredCell.color.hex }"
      ></div>
      <div>
        <p class="font-medium text-deep-navy">{{ hoveredCell.color.name }}</p>
        <p class="text-sm text-gray-500">{{ hoveredCell.color.code }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const hoveredCell = ref(null)
const cellSize = computed(() => {
  if (store.showCellCode) {
    return Math.max(24, Math.min(store.gridSize * 1.5, 40))
  }
  const baseSize = Math.max(400 / store.gridSize, 6)
  return Math.min(baseSize, 20)
})

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

function zoomIn() {
  store.setZoom(store.zoomLevel + 0.25)
}

function zoomOut() {
  store.setZoom(store.zoomLevel - 0.25)
}

watch(() => store.generatedPattern, () => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})

watch(() => store.showCellCode, () => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})

onMounted(() => {
  if (window.lucide) {
    window.lucide.createIcons()
  }
})
</script>

<style scoped>
.bead-cell.show-code {
  cursor: default;
}
</style>
