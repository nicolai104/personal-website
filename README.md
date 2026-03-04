# 个人品牌网站 - 技术说明文档

## 项目概述

这是一个现代化的个人品牌网站，采用温暖活力的设计风格，融合了动态效果和精致的交互体验。网站基于参考网站 `https://xmmxovo.online/` 进行差异化创新，添加了丰富的动画效果、温暖的配色方案和非对称布局。

## 技术栈

### 核心框架
- **HTML5** - 语义化结构
- **CSS3** - 现代样式和动画
- **JavaScript (ES6+)** - 交互逻辑

### 动画库
- **GSAP 3.12.2** - 高性能动画库
  - ScrollTrigger 插件 - 滚动触发动画
- **Lenis 1.1.13** - 平滑滚动体验

### UI 框架
- **Tailwind CSS (CDN)** - 实用类优先的CSS框架

### 图标
- **Lucide Icons** - 现代简洁的图标库

### 字体
- **Space Grotesk** - 英文字体（来自 Google Fonts）
- **Noto Sans SC** - 中文字体（来自 Google Fonts）

## 文件结构

```
personal-website/
├── index.html          # 主页面（包含所有HTML、CSS、JS）
└── README.md          # 技术说明文档
```

> 注：本项目采用单文件架构，所有代码集成在 `index.html` 中，便于部署和维护。

## 功能特性

### 1. 动态效果

#### 粒子背景系统
- Canvas 绘制的动态粒子
- 粒子间自动连线（距离检测）
- 响应式设计（移动端15个粒子，桌面端25个）
- 页面不可见时自动暂停以节省性能

#### 打字机效果
- 循环展示多个职业标签
- 打字/删除动画
- 可自定义打字速度和暂停时间

#### 滚动触发动画
- 使用 GSAP ScrollTrigger
- 元素进入视口时渐显
- 交错动画（stagger）效果
- 支持减少动画偏好（prefers-reduced-motion）

### 2. 交互体验

#### 导航栏
- 滚动时添加毛玻璃效果
- 导航链接下划线动画
- 移动端响应式菜单
- 平滑滚动到锚点

#### 卡片悬停效果
- 上浮动画（translateY）
- 阴影加深
- 图片放大效果
- 颜色过渡

#### 表单交互
- 输入框聚焦动画
- 提交按钮加载状态
- Formspree 表单集成

### 3. 布局创新

#### Bento Grid 作品展示
- 不规则网格布局
- 大小卡片交错
- 统一圆角（24px）
- 响应式适配

#### 杂志式文章排版
- 左侧特色文章大图
- 右侧时间线式文章列表
- 悬停显示详细信息

#### 瀑布流视频墙
- 三列网格布局
- 播放按钮悬停显示
- 视频数据统计展示

### 4. 视觉设计

#### 配色方案
- 背景色：`#FDF8F3`（温暖奶油白）
- 主文字：`#1A1A2E`（深海蓝黑）
- 次要文字：`#4A4A68`（柔和紫灰）
- 强调色：蜜桃粉渐变（`#FF9A9E` → `#FECFEF`）

#### 渐变效果
- 文字渐变（姓名标题）
- 按钮渐变背景
- 装饰元素渐变
- 滚动条渐变

#### 动画时间函数
- 主要使用 `cubic-bezier(0.4, 0, 0.2, 1)`
- 悬停效果 0.3s-0.4s
- 滚动动画 0.6s-0.8s

## 性能优化

### 1. 加载优化
- 字体预连接（preconnect）
- CDN 资源加载
- 图片懒加载（浏览器原生支持）

### 2. 动画性能
- 使用 `transform` 和 `opacity` 进行动画
- 启用 GPU 加速（will-change）
- 粒子系统性能控制（限制连接数）
- 页面不可见时暂停动画

### 3. 代码优化
- 单文件架构减少HTTP请求
- 内联关键CSS
- 异步加载非关键资源

## 响应式设计

### 断点设置
- **Desktop**: > 1280px（完整布局）
- **Laptop**: 1024px - 1280px（调整间距）
- **Tablet**: 768px - 1024px（Bento Grid 2列）
- **Mobile**: < 768px（单列布局）

### 移动端适配
- 汉堡菜单
- 触摸友好的按钮尺寸
- 简化动画效果
- 优化的粒子数量

## 无障碍访问

### 已实现功能
- 语义化HTML标签
- ARIA 标签（部分）
- 键盘导航支持
- 色彩对比度符合 WCAG 2.1 AA 标准
- 减少动画支持（prefers-reduced-motion）

### 建议改进
- 添加更多 ARIA 标签
- 实现跳过导航链接
- 添加焦点可见样式
- 提供高对比度模式

## 部署指南

### 推荐平台

#### 1. Vercel（推荐）
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### 2. Netlify
- 连接 GitHub 仓库
- 自动部署
- 支持表单处理

#### 3. GitHub Pages
```bash
# 推送到 gh-pages 分支
git subtree push --prefix personal-website origin gh-pages
```

### 自定义域名
1. 在域名服务商添加 CNAME 记录
2. 指向部署平台提供的域名
3. 在平台设置中配置自定义域名

## 内容管理

### 修改个人信息
编辑 `index.html` 中的以下部分：
- 姓名：搜索 "西门美月匈XD"
- 职业描述：Hero 区域的段落
- 社交链接：Contact 部分的链接

### 添加新作品
在 Creations 部分的 Bento Grid 中添加：
```html
<div class="bento-card">
    <!-- 作品内容 -->
</div>
```

### 添加新文章
在 Articles 部分添加新的时间线项：
```html
<a href="#" class="timeline-item">
    <!-- 文章信息 -->
</a>
```

### 添加新视频
在 Videos 部分添加新的视频卡片：
```html
<a href="视频链接" class="video-card">
    <!-- 视频信息 -->
</a>
```

## 表单配置

### Formspree 集成
表单已配置为使用 Formspree 服务：
- 端点：`https://formspree.io/f/mbdajzrj`
- 方法：POST
- 字段：name, email, subject, message

### 自定义表单
如需修改表单字段，请：
1. 修改 HTML 中的表单字段
2. 在 Formspree 控制面板中配置对应的表单
3. 更新 form action 属性

## 浏览器兼容性

### 支持浏览器
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 已知限制
- IE 11 不支持（使用了 CSS 变量和现代 API）
- 部分动画在低端设备上可能不流畅

## 开发建议

### 本地开发
```bash
# 使用 Live Server 或其他本地服务器
npx live-server personal-website/
```

### 调试技巧
- 使用 Chrome DevTools 的 Performance 面板分析动画性能
- 使用 Lighthouse 进行性能审计
- 使用 WAVE 进行无障碍测试

### 扩展建议
1. 添加博客功能（可使用静态站点生成器）
2. 集成 CMS（如 Sanity、Strapi）
3. 添加暗黑模式切换
4. 实现多语言支持
5. 添加分析工具（Google Analytics、Plausible）

## 许可证

本项目采用 MIT 许可证，可自由使用和修改。

## 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 邮箱: nicosun@bupt.edu.cn

---

**版本**: 1.0.0  
**更新日期**: 2026年  
**作者**: Nicolai104
