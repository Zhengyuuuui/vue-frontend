<template>
  <div class="card">
    <div class="flex items-start gap-4 p-4">
      <img :src="defaultAvatar" alt="用户头像" class="w-10 h-10 rounded-full object-cover flex-shrink-0">
      <div class="flex-1">
        <button 
          v-if="!isExpanded" 
          class="w-full text-left px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          @click="isExpanded = true"
        >
          What's on Your Mind?
        </button>
        
        <div v-else class="space-y-4">
          <textarea 
            v-model="content" 
            placeholder="分享你的想法..." 
            class="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            rows="4"
          ></textarea>
          
          <!-- 图片预览 -->
          <div v-if="images.length > 0" class="grid grid-cols-3 gap-2">
            <div v-for="(image, index) in images" :key="index" class="relative aspect-square rounded-lg overflow-hidden">
              <img :src="image" alt="预览" class="w-full h-full object-cover">
              <button 
                class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                @click="removeImage(index)"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 标签选择 -->
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="tag in tags" 
              :key="tag"
              :class="['px-3 py-1 rounded-full text-sm', selectedTag === tag ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
              @click="selectedTag = tag"
            >
              {{ tag }}
            </button>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex items-center gap-3">
              <button 
                class="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
                @click="triggerFileInput"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm">图片</span>
              </button>
              <input 
                ref="fileInput" 
                type="file" 
                multiple 
                accept="image/*" 
                class="hidden"
                @change="handleFileChange"
              >
            </div>
            <div class="flex items-center gap-2">
              <button 
                class="btn-secondary"
                @click="resetForm"
              >
                取消
              </button>
              <button 
                class="btn-primary"
                :disabled="!content.trim() || !selectedTag"
                @click="submitPost"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import defaultAvatar from '../assets/images/default-avatar.png'

const emit = defineEmits(['post']) 
const isExpanded = ref(false)
const content = ref('')
const selectedTag = ref('')
const images = ref([])
const fileInput = ref(null)

const tags = ['失物招领', '随便说说', '捞人', '出闲置']

const triggerFileInput = () => {
  if (images.value.length < 9) {
    fileInput.value.click()
  }
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files) {
    for (let i = 0; i < files.length && images.value.length < 9; i++) {
      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push(e.target.result)
      }
      reader.readAsDataURL(files[i])
    }
  }
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const resetForm = () => {
  content.value = ''
  selectedTag.value = ''
  images.value = []
  isExpanded.value = false
}

const submitPost = () => {
  if (content.value.trim() && selectedTag.value) {
    const newPost = {
      id: Date.now(),
      author: {
        name: '张同学',
        avatar: 'https://picsum.photos/id/237/40/40',
        handle: '@zhangtongxue'
      },
      content: content.value,
      images: [...images.value],
      tag: selectedTag.value,
      createdAt: '刚刚',
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      isLiked: false
    }
    
    emit('post', newPost)
    resetForm()
  }
}
</script>
