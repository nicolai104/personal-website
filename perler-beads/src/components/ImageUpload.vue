<template>
  <div 
    class="upload-area p-8 text-center cursor-pointer"
    :class="{ 'drag-over': isDragOver }"
    @click="triggerFileInput"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/gif"
      class="hidden"
      @change="handleFileSelect"
    >
    
    <div v-if="!imagePreview" class="space-y-4">
      <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-peach/30 to-mint/30 flex items-center justify-center">
        <i data-lucide="upload" class="w-10 h-10 text-coral"></i>
      </div>
      <div>
        <p class="text-lg font-medium text-deep-navy mb-2">
          点击或拖拽图片到这里上传
        </p>
        <p class="text-sm text-soft-purple">
          支持 JPG、PNG、GIF 格式，最大 10MB
        </p>
      </div>
    </div>
    
    <div v-else class="relative">
      <img 
        :src="imagePreview" 
        alt="预览图" 
        class="max-h-64 mx-auto rounded-lg shadow-lg"
      >
      <button 
        @click.stop="removeImage"
        class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center hover:bg-red-600 transition-colors"
      >
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const fileInput = ref(null)
const isDragOver = ref(false)
const imagePreview = ref(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleDragOver(e) {
  isDragOver.value = true
}

function handleDragLeave(e) {
  isDragOver.value = false
}

function handleDrop(e) {
  isDragOver.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file) {
  if (!file.type.match(/^image\/(png|jpeg|jpg|gif)$/)) {
    alert('请上传 PNG、JPG 或 GIF 格式的图片')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
    store.setImage(file, e.target.result)
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = null
  store.reset()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

watch(() => store.uploadedImage, (newVal) => {
  if (!newVal) {
    imagePreview.value = null
  }
})

onMounted(() => {
  if (window.lucide) {
    window.lucide.createIcons()
  }
})
</script>
