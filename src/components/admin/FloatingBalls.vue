<template>
  <div class="floating-balls">
    <!-- 主悬浮球 -->
    <div
      class="main-ball"
      :class="{ 'expanded': isExpanded }"
      @click="toggleExpanded"
    >
      <el-icon v-if="!isExpanded"><Plus /></el-icon>
      <el-icon v-else><Close /></el-icon>
    </div>
    
    <!-- 功能悬浮球 -->
    <transition-group name="ball" tag="div" class="function-balls">
      <div
        v-for="(ball, index) in functionBalls"
        :key="ball.id"
        class="function-ball"
        :class="ball.type"
        :style="getBallStyle(index)"
        @click="handleBallClick(ball)"
        v-show="isExpanded"
      >
        <el-tooltip
          :content="ball.tooltip"
          placement="left"
          :show-after="500"
        >
          <el-icon>
            <component :is="ball.icon" />
          </el-icon>
        </el-tooltip>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Plus, 
  Close, 
  ChatDotRound, 
  QuestionFilled, 
  Bell, 
  Setting 
} from '@element-plus/icons-vue'

const emit = defineEmits(['feedback', 'help', 'notification', 'settings'])

const isExpanded = ref(false)

const functionBalls = ref([
  {
    id: 'feedback',
    icon: 'ChatDotRound',
    tooltip: '用户反馈',
    type: 'feedback',
    action: 'feedback'
  },
  {
    id: 'help',
    icon: 'QuestionFilled',
    tooltip: '帮助中心',
    type: 'help',
    action: 'help'
  },
  {
    id: 'notification',
    icon: 'Bell',
    tooltip: '消息通知',
    type: 'notification',
    action: 'notification'
  },
  {
    id: 'settings',
    icon: 'Setting',
    tooltip: '系统设置',
    type: 'settings',
    action: 'settings'
  }
])

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const getBallStyle = (index) => {
  const angle = (index * 90) * (Math.PI / 180)
  const radius = 80
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

const handleBallClick = (ball) => {
  emit(ball.action, ball)
  
  // 根据功能类型执行不同操作
  switch (ball.action) {
    case 'feedback':
      // 触发反馈事件
      break
    case 'help':
      // 打开帮助中心
      window.open('/help', '_blank')
      break
    case 'notification':
      // 显示通知面板
      break
    case 'settings':
      // 打开设置面板
      break
  }
}
</script>

<style scoped>
.floating-balls {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}

.main-ball {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 20px;
  z-index: 1000;
}

.main-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.main-ball.expanded {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.function-balls {
  position: absolute;
  bottom: 0;
  right: 0;
}

.function-ball {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.function-ball.feedback {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.function-ball.help {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.function-ball.notification {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.function-ball.settings {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.function-ball:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 动画效果 */
.ball-enter-active,
.ball-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ball-enter-from {
  opacity: 0;
  transform: scale(0) translate(0, 0);
}

.ball-leave-to {
  opacity: 0;
  transform: scale(0) translate(0, 0);
}

@media (max-width: 768px) {
  .floating-balls {
    bottom: 20px;
    right: 20px;
  }
  
  .main-ball {
    width: 50px;
    height: 50px;
    font-size: 16px;
  }
  
  .function-ball {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
}
</style> 