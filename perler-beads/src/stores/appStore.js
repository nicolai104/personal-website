import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBrandList, getBrandColors } from '../data/bead-colors'

export const useAppStore = defineStore('app', () => {
  const uploadedImage = ref(null)
  const originalImageData = ref(null)
  const generatedPattern = ref(null)
  const generatedStats = ref(null)
  
  const selectedBrandId = ref('artkal_s')
  const gridSize = ref(50)
  const maxColors = ref(32)
  const colorTolerance = ref(50)
  const useDithering = ref(false)
  const brightness = ref(0)
  const contrast = ref(0)
  const saturation = ref(0)
  
  const isProcessing = ref(false)
  const showGrid = ref(true)
  const showCellCode = ref(false)
  const zoomLevel = ref(1)
  const previewUrl = ref(null)

  const brands = computed(() => getBrandList())
  const currentBrandColors = computed(() => getBrandColors(selectedBrandId.value))

  function setImage(file, imageData) {
    uploadedImage.value = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: imageData
    }
    originalImageData.value = null
    generatedPattern.value = null
    generatedStats.value = null
  }

  function setOriginalImageData(data) {
    originalImageData.value = data
  }

  function setPattern(pattern, stats) {
    generatedPattern.value = pattern
    generatedStats.value = stats
  }

  function setBrand(brandId) {
    selectedBrandId.value = brandId
  }

  function setGridSize(size) {
    gridSize.value = Math.max(10, Math.min(100, size))
  }

  function setMaxColors(count) {
    maxColors.value = Math.max(2, Math.min(100, count))
  }

  function setColorTolerance(value) {
    colorTolerance.value = value
  }

  function setDithering(enabled) {
    useDithering.value = enabled
  }

  function setBrightness(value) {
    brightness.value = value
  }

  function setContrast(value) {
    contrast.value = value
  }

  function setSaturation(value) {
    saturation.value = value
  }

  function setShowGrid(show) {
    showGrid.value = show
  }

  function setShowCellCode(show) {
    showCellCode.value = show
  }

  function setZoom(level) {
    zoomLevel.value = Math.max(0.5, Math.min(5, level))
  }

  function setPreviewUrl(url) {
    previewUrl.value = url
  }

  function setProcessing(processing) {
    isProcessing.value = processing
  }

  function reset() {
    uploadedImage.value = null
    originalImageData.value = null
    generatedPattern.value = null
    generatedStats.value = null
    brightness.value = 0
    contrast.value = 0
    saturation.value = 0
  }

  return {
    uploadedImage,
    originalImageData,
    generatedPattern,
    generatedStats,
    selectedBrandId,
    gridSize,
    maxColors,
    colorTolerance,
    useDithering,
    brightness,
    contrast,
    saturation,
    isProcessing,
    showGrid,
    showCellCode,
    zoomLevel,
    previewUrl,
    brands,
    currentBrandColors,
    setImage,
    setOriginalImageData,
    setPattern,
    setBrand,
    setGridSize,
    setMaxColors,
    setColorTolerance,
    setDithering,
    setBrightness,
    setContrast,
    setSaturation,
    setShowGrid,
    setShowCellCode,
    setZoom,
    setPreviewUrl,
    setProcessing,
    reset
  }
})
