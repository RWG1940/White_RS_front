<template>
  <div class="academy-container">
    <!-- 顶部横幅 -->
    <div class="academy-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <BookOutlined />
          AI 创意学院
        </h1>
        <p class="hero-subtitle">探索人工智能的无限可能，开启创意之旅</p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">100+</div>
            <div class="stat-label">精品课程</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5,000+</div>
            <div class="stat-label">学习用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">98%</div>
            <div class="stat-label">满意度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 课程分类导航 -->
    <div class="category-nav">
      <div class="nav-container">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['nav-btn', { active: activeCategory === category.id }]"
          @click="activeCategory = category.id"
        >
          <component :is="category.icon" />
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="academy-content">
      <!-- 推荐课程 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">热门推荐</h2>
          <a class="view-all">查看全部 <RightOutlined /></a>
        </div>
        <div class="courses-grid">
          <div 
            v-for="course in featuredCourses" 
            :key="course.id"
            class="course-card"
          >
            <div class="course-image">
              <div class="difficulty-tag" :class="course.difficulty">
                {{ course.difficulty }}
              </div>
              <div class="duration">{{ course.duration }}</div>
            </div>
            <div class="course-content">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-description">{{ course.description }}</p>
              <div class="course-meta">
                <div class="instructor">
                  <UserOutlined />
                  {{ course.instructor }}
                </div>
                <div class="rating">
                  <StarFilled />
                  {{ course.rating }}
                </div>
              </div>
              <div class="course-footer">
                <div class="price">
                  <span v-if="course.price === 0" class="free">免费</span>
                  <span v-else>¥{{ course.price }}</span>
                </div>
                <button class="enroll-btn">立即学习</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习路径 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">学习路径</h2>
          <p class="section-description">系统化学习，从入门到精通</p>
        </div>
        <div class="learning-paths">
          <div 
            v-for="path in learningPaths" 
            :key="path.id"
            class="path-card"
          >
            <div class="path-icon">
              <component :is="path.icon" />
            </div>
            <div class="path-content">
              <h3 class="path-title">{{ path.title }}</h3>
              <p class="path-description">{{ path.description }}</p>
              <div class="path-steps">
                <div 
                  v-for="step in path.steps" 
                  :key="step"
                  class="step"
                >
                  {{ step }}
                </div>
              </div>
              <button class="path-btn">开始学习</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 成功案例 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">学员作品</h2>
          <p class="section-description">看看其他学员的精彩创作</p>
        </div>
        <div class="showcase-grid">
          <div 
            v-for="showcase in showcases" 
            :key="showcase.id"
            class="showcase-card"
          >
            <div class="showcase-image">
              <div class="showcase-overlay">
                <button class="view-btn">查看详情</button>
              </div>
            </div>
            <div class="showcase-info">
              <div class="student-info">
                <div class="avatar"></div>
                <div class="student-details">
                  <div class="student-name">{{ showcase.student }}</div>
                  <div class="course-name">{{ showcase.course }}</div>
                </div>
              </div>
              <div class="showcase-actions">
                <button class="like-btn">
                  <HeartOutlined />
                  {{ showcase.likes }}
                </button>
                <button class="comment-btn">
                  <MessageOutlined />
                  {{ showcase.comments }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 讲师团队 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">专业讲师团队</h2>
          <p class="section-description">行业专家，倾囊相授</p>
        </div>
        <div class="instructors-grid">
          <div 
            v-for="instructor in instructors" 
            :key="instructor.id"
            class="instructor-card"
          >
            <div class="instructor-avatar"></div>
            <h3 class="instructor-name">{{ instructor.name }}</h3>
            <p class="instructor-title">{{ instructor.title }}</p>
            <p class="instructor-bio">{{ instructor.bio }}</p>
            <div class="instructor-stats">
              <div class="stat">
                <div class="stat-value">{{ instructor.courses }}</div>
                <div class="stat-label">课程数</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{ instructor.students }}+</div>
                <div class="stat-label">学员数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部行动号召 -->
    <div class="academy-cta">
      <div class="cta-content">
        <h2 class="cta-title">准备好开始你的AI创意之旅了吗？</h2>
        <p class="cta-description">加入我们，与数千名创意者一起探索人工智能的无限可能</p>
        <div class="cta-buttons">
          <button class="cta-btn primary">立即注册</button>
          <button class="cta-btn secondary">了解更多</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  BookOutlined,
  RightOutlined,
  UserOutlined,
  StarFilled,
  HeartOutlined,
  MessageOutlined,
  CodeOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SoundOutlined
} from '@ant-design/icons-vue'

const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全部课程', icon: BookOutlined },
  { id: 'coding', name: '编程AI', icon: CodeOutlined },
  { id: 'image', name: '图像生成', icon: PictureOutlined },
  { id: 'video', name: '视频创作', icon: VideoCameraOutlined },
  { id: 'audio', name: '音频处理', icon: SoundOutlined }
]

const featuredCourses = [
  {
    id: 1,
    title: 'AI绘画从入门到精通',
    description: '学习使用AI工具创作精美画作，掌握构图、色彩、风格等核心技巧',
    instructor: '张艺',
    rating: 4.9,
    price: 299,
    duration: '12小时',
    difficulty: 'beginner'
  },
  {
    id: 2,
    title: 'Midjourney实战指南',
    description: '深入掌握Midjourney的提示词编写技巧，创作专业级AI艺术作品',
    instructor: '李思',
    rating: 4.8,
    price: 0,
    duration: '8小时',
    difficulty: 'intermediate'
  },
  {
    id: 3,
    title: 'Stable Diffusion高级应用',
    description: '学习LoRA模型训练、ControlNet控制等高级技巧',
    instructor: '王五',
    rating: 4.7,
    price: 599,
    duration: '20小时',
    difficulty: 'advanced'
  },
  {
    id: 4,
    title: 'AI视频剪辑与特效',
    description: '使用AI工具快速完成视频剪辑、特效添加和色彩调整',
    instructor: '赵六',
    rating: 4.6,
    price: 399,
    duration: '15小时',
    difficulty: 'intermediate'
  }
]

const learningPaths = [
  {
    id: 1,
    title: 'AI绘画入门路径',
    description: '从零开始学习AI绘画，逐步掌握核心技巧',
    icon: PictureOutlined,
    steps: ['基础概念', '工具使用', '风格掌握', '实战创作']
  },
  {
    id: 2,
    title: 'AI编程开发路径',
    description: '学习AI编程，开发智能应用',
    icon: CodeOutlined,
    steps: ['Python基础', '机器学习', '深度学习', '项目实战']
  },
  {
    id: 3,
    title: 'AI音视频创作路径',
    description: '掌握AI在音视频创作中的应用',
    icon: VideoCameraOutlined,
    steps: ['音频处理', '视频剪辑', '特效制作', '整合创作']
  }
]

const showcases = [
  {
    id: 1,
    student: '小明同学',
    course: 'AI绘画入门',
    likes: 128,
    comments: 24
  },
  {
    id: 2,
    student: '小红',
    course: 'Midjourney实战',
    likes: 256,
    comments: 42
  },
  {
    id: 3,
    student: '小李',
    course: 'Stable Diffusion',
    likes: 189,
    comments: 31
  },
  {
    id: 4,
    student: '小王',
    course: 'AI视频剪辑',
    likes: 156,
    comments: 18
  }
]

const instructors = [
  {
    id: 1,
    name: '张艺',
    title: 'AI艺术总监',
    bio: '拥有10年数字艺术创作经验，专注于AI绘画技术研究',
    courses: 15,
    students: 2000
  },
  {
    id: 2,
    name: '李思',
    title: 'AI技术专家',
    bio: '资深AI工程师，擅长机器学习算法和模型优化',
    courses: 12,
    students: 1500
  },
  {
    id: 3,
    name: '王五',
    title: '创意总监',
    bio: '跨界创意人，专注于AI在创意产业的应用',
    courses: 8,
    students: 1200
  }
]
</script>

<style scoped>
.academy-container {
  min-height: 100%;
  background: #202020;
  color: #fff;
}

/* 顶部横幅 */
.academy-hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 60px 0;
  text-align: center;
  border-bottom: 1px solid #333;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #18d5ff, #1ac49f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #ccc;
  margin-bottom: 40px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #18d5ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #999;
}

/* 分类导航 */
.category-nav {
  background: #2a2a2a;
  padding: 20px 0;
  border-bottom: 1px solid #333;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #333;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-btn:hover {
  border-color: #18d5ff;
  color: #fff;
  background: #3a3a3a;
}

.nav-btn.active {
  background: linear-gradient(135deg, #11589a, #0b5142);
  border-color: #18d5ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* 主要内容区域 */
.academy-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.section-description {
  color: #ccc;
  margin: 8px 0 0 0;
}

.view-all {
  color: #18d5ff;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #1ac49f;
}

/* 课程网格 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.course-card {
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #333;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.course-image {
  height: 160px;
  background: linear-gradient(135deg, #3a3a3a, #4a4a4a);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
}

.difficulty-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty-tag.beginner {
  background: #1ac49f;
  color: #fff;
}

.difficulty-tag.intermediate {
  background: #1890ff;
  color: #fff;
}

.difficulty-tag.advanced {
  background: #ff4d4f;
  color: #fff;
}

.duration {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #fff;
}

.course-content {
  padding: 20px;
}

.course-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.course-description {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 16px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 0.8rem;
  color: #999;
}

.instructor, .rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #18d5ff;
}

.price .free {
  color: #1ac49f;
}

.enroll-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enroll-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 学习路径 */
.learning-paths {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.path-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #333;
  display: flex;
  gap: 20px;
  transition: transform 0.3s ease;
}

.path-card:hover {
  transform: translateY(-2px);
}

.path-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
}

.path-content {
  flex: 1;
}

.path-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.path-description {
  color: #ccc;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.path-steps {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.step {
  padding: 4px 8px;
  background: #3a3a3a;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #ccc;
}

.path-btn {
  padding: 8px 16px;
  background: #333;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-btn:hover {
  background: #3a3a3a;
  border-color: #18d5ff;
}

/* 作品展示 */
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.showcase-card {
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #333;
}

.showcase-image {
  height: 200px;
  background: linear-gradient(135deg, #3a3a3a, #4a4a4a);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 3rem;
}

.showcase-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.showcase-image:hover .showcase-overlay {
  opacity: 1;
}

.view-btn {
  padding: 8px 16px;
  background: #fff;
  border: none;
  border-radius: 6px;
  color: #333;
  font-weight: 500;
  cursor: pointer;
}

.showcase-info {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #3a3a3a;
  border-radius: 50%;
}

.student-name {
  font-weight: 500;
  color: #fff;
}

.course-name {
  font-size: 0.8rem;
  color: #999;
}

.showcase-actions {
  display: flex;
  gap: 12px;
}

.like-btn, .comment-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3a3a3a;
  border: none;
  border-radius: 6px;
  color: #ccc;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-btn:hover, .comment-btn:hover {
  background: #4a4a4a;
  color: #fff;
}

/* 讲师团队 */
.instructors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.instructor-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #333;
  transition: transform 0.3s ease;
}

.instructor-card:hover {
  transform: translateY(-2px);
}

.instructor-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  border-radius: 50%;
  margin: 0 auto 16px;
}

.instructor-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.instructor-title {
  color: #18d5ff;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.instructor-bio {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 20px;
}

.instructor-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #18d5ff;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
}

/* 底部行动号召 */
.academy-cta {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 60px 0;
  text-align: center;
  border-top: 1px solid #333;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.cta-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
}

.cta-description {
  font-size: 1.1rem;
  color: #ccc;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.cta-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.cta-btn.primary {
  background: linear-gradient(135deg, #1890ff, #1ac49f);
  color: #fff;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
}

.cta-btn.secondary {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
}

.cta-btn.secondary:hover {
  border-color: #18d5ff;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-stats {
    gap: 30px;
  }
  
  .nav-container {
    flex-wrap: wrap;
  }
  
  .section-header {
    flex-direction: column;
    align-items: start;
    gap: 8px;
  }
  
  .courses-grid,
  .showcase-grid,
  .instructors-grid {
    grid-template-columns: 1fr;
  }
  
  .learning-paths {
    grid-template-columns: 1fr;
  }
  
  .path-card {
    flex-direction: column;
    text-align: center;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
