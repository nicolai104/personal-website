<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 mb-4">
      <i data-lucide="download" class="w-5 h-5 text-coral"></i>
      <h3 class="text-lg font-medium text-deep-navy">导出</h3>
    </div>

    <div v-if="!store.generatedPattern" class="text-center py-8 text-gray-400">
      <p>请先生成图案</p>
    </div>

    <template v-else>
      <div class="space-y-3">
        <button 
          @click="exportPNG(false)"
          class="w-full btn-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <i data-lucide="image" class="w-5 h-5"></i>
          导出 PNG 图片
        </button>
        
        <button 
          @click="exportPNG(true)"
          class="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 border-2 border-coral text-coral hover:bg-coral/5 transition-colors"
        >
          <i data-lucide="grid-3x3" class="w-5 h-5"></i>
          导出 PNG (带网格)
        </button>

        <button 
          @click="exportPDF"
          class="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 border-2 border-soft-purple text-soft-purple hover:bg-soft-purple/5 transition-colors"
        >
          <i data-lucide="file-text" class="w-5 h-5"></i>
          导出 PDF
        </button>

        <button 
          @click="exportExcel"
          class="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors"
        >
          <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
          导出 Excel
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

const store = useAppStore()

function exportPNG(withGrid) {
  const pattern = store.generatedPattern
  const gridSize = store.gridSize
  const cellSize = 12
  
  const canvas = document.createElement('canvas')
  canvas.width = gridSize * cellSize
  canvas.height = gridSize * cellSize
  const ctx = canvas.getContext('2d')
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const color = pattern[y][x]
      ctx.fillStyle = color.hex
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      
      if (withGrid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }
  
  const link = document.createElement('a')
  link.download = `perler-pattern-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function exportPDF() {
  const pattern = store.generatedPattern
  const stats = store.generatedStats
  const gridSize = store.gridSize
  const brandName = store.brands.find(b => b.id === store.selectedBrandId)?.name || ''
  
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text('拼豆图案', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`品牌: ${brandName}`, 20, 35)
  doc.text(`尺寸: ${gridSize} x ${gridSize}`, 20, 42)
  doc.text(`珠子总数: ${stats.totalBeads}`, 20, 49)
  doc.text(`颜色数: ${stats.colorCount}`, 20, 56)
  
  const cellSize = 180 / gridSize
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const color = pattern[y][x]
      const r = parseInt(color.hex.slice(1, 3), 16)
      const g = parseInt(color.hex.slice(3, 5), 16)
      const b = parseInt(color.hex.slice(5, 7), 16)
      doc.setFillColor(r, g, b)
      doc.rect(15 + x * cellSize, 65 + y * cellSize, cellSize, cellSize, 'F')
    }
  }
  
  doc.addPage()
  doc.setFontSize(16)
  doc.text('材料清单', 105, 20, { align: 'center' })
  
  let yPos = 35
  doc.setFontSize(10)
  doc.text('序号', 20, yPos)
  doc.text('色号', 40, yPos)
  doc.text('颜色名称', 70, yPos)
  doc.text('数量', 130, yPos)
  doc.text('占比', 160, yPos)
  
  yPos += 8
  stats.colors.forEach((color, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    doc.text(String(index + 1), 20, yPos)
    doc.text(color.code, 40, yPos)
    doc.text(color.name, 70, yPos)
    doc.text(String(color.count), 130, yPos)
    doc.text(color.percentage + '%', 160, yPos)
    yPos += 7
  })
  
  doc.save(`perler-pattern-${Date.now()}.pdf`)
}

function exportExcel() {
  const stats = store.generatedStats
  const brandName = store.brands.find(b => b.id === store.selectedBrandId)?.name || ''
  
  const summaryData = [
    ['拼豆图案统计'],
    [''],
    ['品牌', brandName],
    ['尺寸', `${store.gridSize} x ${store.gridSize}`],
    ['总珠子数', stats.totalBeads],
    ['颜色种类', stats.colorCount],
    [''],
    ['颜色统计'],
    ['序号', '色号', '颜色名称', '数量', '占比']
  ]
  
  stats.colors.forEach((color, index) => {
    summaryData.push([index + 1, color.code, color.name, color.count, color.percentage + '%'])
  })
  
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws, '统计')
  
  XLSX.writeFile(wb, `perler-stats-${Date.now()}.xlsx`)
}

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
