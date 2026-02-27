<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 mb-4">
      <i data-lucide="bar-chart-3" class="w-5 h-5 text-coral"></i>
      <h3 class="text-lg font-medium text-deep-navy">材料统计</h3>
    </div>

    <div v-if="!store.generatedStats" class="text-center py-8 text-gray-400">
      <p>暂无统计数据</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-peach/20 to-mint/20 rounded-xl p-4">
          <p class="text-sm text-soft-purple mb-1">总珠子数</p>
          <p class="text-2xl font-bold text-deep-navy">
            {{ store.generatedStats.totalBeads.toLocaleString() }}
          </p>
        </div>
        <div class="bg-gradient-to-br from-mint/20 to-peach/20 rounded-xl p-4">
          <p class="text-sm text-soft-purple mb-1">颜色种类</p>
          <p class="text-2xl font-bold text-deep-navy">
            {{ store.generatedStats.colorCount }}
          </p>
        </div>
      </div>

      <div class="max-h-64 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-white">
            <tr class="border-b">
              <th class="text-left py-2 px-2 font-medium text-gray-500">色号</th>
              <th class="text-left py-2 px-2 font-medium text-gray-500">颜色</th>
              <th class="text-right py-2 px-2 font-medium text-gray-500">数量</th>
              <th class="text-right py-2 px-2 font-medium text-gray-500">占比</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="color in sortedColors" 
              :key="color.code"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <td class="py-2 px-2 font-mono text-coral">{{ color.code }}</td>
              <td class="py-2 px-2">
                <div class="flex items-center gap-2">
                  <div 
                    class="w-4 h-4 rounded border"
                    :style="{ backgroundColor: color.hex }"
                  ></div>
                  <span class="text-gray-600">{{ color.name }}</span>
                </div>
              </td>
              <td class="py-2 px-2 text-right font-medium">{{ color.count.toLocaleString() }}</td>
              <td class="py-2 px-2 text-right text-gray-500">{{ color.percentage }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()

const sortedColors = computed(() => {
  if (!store.generatedStats) return []
  return [...store.generatedStats.colors].sort((a, b) => b.count - a.count)
})

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
