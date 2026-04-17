<style>
/*消除页面右上角的查看与编辑按钮*/
.md-content__button {
    display: none !important;
}

/* 增加权重并强制隐藏锚点链接 */
.md-typeset .headerlink {
  display: none !important;
  pointer-events: none;
}

/* 基础容器 */
.md-typeset .home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* 英雄区 */
.md-typeset .hero-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2.3rem 2.3rem;
    margin: 0.5rem 0;
    position: relative;
    background-image: radial-gradient(var(--md-default-fg-color--lightest) 1.2px, transparent 1.2px);
    background-size: 18px 18px;
    border-radius: 16px;
}

.hero-content {
    flex: 1;
    text-align: left;
    z-index: 2;
}

.hero-title {
    font-size: 1.8rem !important;
    font-weight: 800;
    margin: 0;
    color: var(--md-default-fg-color);
    line-height: 1.3;
}

/* 加上 .md-typeset 确保优先级最高，博客介绍语 */
.md-typeset .hero-intro {
    font-size: 1.2rem !important;
    margin: 0.8rem 0 1.5rem 0 !important;
    color: var(--md-default-fg-color--light);
    font-weight: 500;
}

/* 马克笔涂抹高亮背景 */
.marker-highlight {
    background: linear-gradient(to bottom, transparent 60%, rgba(100, 108, 255, 0.25) 0%);
    padding: 0 6px;
    border-radius: 4px;
    color: var(--md-primary-fg-color);
}

/* 打字机样式 */
.typewriter-container {
    height: 1.8rem;
    margin: 1.2rem 0;
    display: flex;
    align-items: center;
}
#typewriter-text {
    font-family: 'JetBrains Mono', 'Segoe UI', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--md-default-fg-color--light);
}
.cursor {
    display: inline-block;
    width: 3px;
    height: 1.4rem;
    background-color: var(--md-primary-fg-color);
    margin-left: 5px;
    animation: blink 0.8s infinite;
}
@keyframes blink { 50% { opacity: 0; } }

/* 头像 */
.avatar-glow {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    padding: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);   
    box-shadow: 0 10px 30px rgba(118, 75, 162, 0.4);
    flex-shrink: 0;
    margin-right: 0.3rem;
}
.avatar-glow img {
    width: 100%; height: 100%;
    border-radius: 50%; object-fit: cover;
    background: var(--md-default-bg-color);
}

/* 按钮组 */
.hero-btns {
    display: flex;
    gap: 15px;
    margin-top: 1.5rem;
}
.custom-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0.5rem 1.0rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none !important;
    transition: all 0.2s;
}
.btn-primary {
    background-color: var(--md-primary-fg-color);
    color: var(--md-primary-bg-color) !important;
}
.btn-secondary {
    background-color: var(--md-default-fg-color--lightest);
    color: var(--md-default-fg-color) !important;
}
.custom-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* 调整按钮内图标大小 */
.custom-btn .twemoji {
    width: 1.1rem;
    height: 1.1rem;
}

/* 四格磁贴布局 - 极简文字风格 */
.grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 1.5rem 0;
}

.grid-card {
    background: var(--md-default-bg-color);
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    position: relative;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.grid-card:hover { 
    border-color: var(--md-primary-fg-color);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transform: translateY(-2px);
}

.grid-card h3 { 
    margin: 0 0 0.4rem 0 !important; 
    font-size: 0.95rem !important; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    color: var(--md-default-fg-color);
}

.grid-card p { 
    margin: 0 !important; 
    font-size: 0.8rem; 
    line-height: 1.4; 
    color: var(--md-default-fg-color--light); 
    flex-grow: 1; 
}

/* 标签容器 */
.tag-box { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 15px;
    margin-top: 0.8rem; 
    align-items: center;
}

/* --- 普通标签：# 风格 --- */
.tag-box span { 
    font-size: 0.75rem; 
    color: var(--md-default-fg-color--light);
    background: none; 
    border: none; 
    padding: 0;   
    display: inline-flex;
    align-items: center;
    cursor: default;
    font-weight: 400;
    opacity: 0.8;
}

/* 伪元素添加 # 号 */
.tag-box span::before {
    content: "#";
    margin-right: 1px;
    color: var(--md-default-fg-color--light);
    font-family: var(--md-code-font-family);
    opacity: 0.6;
}

/* --- 链接标签：纯文字 + 动效 --- */
.tag-link {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    color: var(--md-primary-fg-color) !important;
    background: none;
    border: none;
    padding: 0;
    text-decoration: none !important;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
}

/* 链接悬停：轻微透明度变化 */
.tag-link:hover {
    opacity: 0.8; 
}

/* 图标样式 */
.jump-icon {
    width: 13px;
    height: 13px;
    fill: currentColor;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 悬停时图标大幅度向右上弹出 */
.tag-link:hover .jump-icon {
    transform: translate(3px, -3px);
}

/* 推荐阅读部分标题 - 居中线条风格 */
.rec-title {
    margin: 2rem 0 1.5rem !important;
    font-weight: 700;
    color: var(--md-default-fg-color) !important;
    
    /* Flex布局实现居中和线条 */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    text-align: center;
}

/* 专门针对标题内的图标进行着色（使用主题色）*/
.rec-title .twemoji {
    color: var(--md-primary-fg-color);
    width: 1.2rem;
    height: 1.2rem;
}

/* 推荐阅读标题两侧的线条 */
.rec-title::before,
.rec-title::after {
    content: "";
    display: block;
    height: 1px;
    flex: 1; 
    max-width: 20px; 
    background: linear-gradient(90deg, transparent, var(--md-default-fg-color--light)); 
    opacity: 0.6;
}

/* 右侧线条反向渐变 */
.rec-title::after {
    background: linear-gradient(90deg, var(--md-default-fg-color--light), transparent);
}

/*卡片网格样式优化*/
/* 减少分隔线的边距 */
hr {
  margin: 0.5rem 0 !important;
}

/* 减少卡片网格的间距 */
.grid.cards {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

/* 减少卡片内部的间距 */
.grid.cards > ul > li {
  padding: 0.8rem !important;
}

.md-typeset a {
  text-decoration: none;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
    /* 布局调整 */
    .hero-wrapper { 
        flex-direction: column-reverse; 
        padding: 1.5rem 1rem; 
        gap: 1.5rem; 
        text-align: center; 
    }

    /* 内容区域居中 */
    .hero-content {
        text-align: center !important; 
        width: 100%; 
    }

    /* 头像区域 */
    .hero-avatar-area { 
        width: 100%;
        display: flex;
        justify-content: center; 
        align-items: center;
    }
    
    .avatar-glow { 
        width: 160px; 
        height: 160px;
        margin: 0 auto !important; 
    }

    /* 标题适配 */
    .hero-title { 
        font-size: 1.7rem !important; 
        text-align: center; 
        display: block; 
    }

    /* 介绍语适配 */
    .md-typeset .hero-intro {
        font-size: 1.35rem !important;
        margin: 0.5rem 0 1rem 0 !important;
        line-height: 1.3;
        text-align: center; 
    }

    /* 打字机适配 */
    #typewriter-text {
        font-size: 1.1rem; 
    }
    .typewriter-container {
        justify-content: center; 
        margin: 1rem 0;
    }

    /* 按钮组适配 */
    .hero-btns { 
        justify-content: center; 
        gap: 10px; 
        flex-wrap: wrap; 
    }

    .custom-btn {
        font-size: 0.75rem;   
    }

    /* 磁贴网格适配 */
    .grid-container { 
        grid-template-columns: 1fr; 
        gap: 0.7rem; 
    }
}

</style>

<div class="home-container" markdown="1">

<div class="hero-wrapper">
<div class="hero-content">

<div class="hero-title">
Hi, I'm <span class="marker-highlight">Quinn</span>. 
</div>
<h1 class="hero-intro">
Welcome to my blog! 👋
</h1>

<div class="typewriter-container">
<span id="typewriter-text"></span><span class="cursor"></span>
</div>

<div class="hero-btns">
<a href="https://github.com/quinn-dj" class="custom-btn btn-primary">
    <span class="twemoji"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></span>
    Github
</a>
<a href="mailto:yv40403@gmail.com" class="custom-btn btn-secondary">
    <span class="twemoji"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></span>
    Email me
</a>
</div>
</div>

<div class="hero-avatar-area">
<div class="avatar-glow">
<img src="https://avatars.githubusercontent.com/u/184342973" alt="avatar">
</div>
</div>
</div>

!!! quote
    这些漂亮的数学问题带给我很多思考的乐趣

    这些乐趣让我感觉在一生之中稍有所得
    
    比那些在思想真空中挣扎一世的人幸福

<div class="grid cards" markdown>
-   :material-notebook-edit-outline:{ .lg .middle } __参考资料__

    ---
    
    - 在构建本网站的过程中参考了[Wcowin 同学的 Zensical 中文教程](https://wcowin.work/Zensical-Chinese-Tutorial/)
</div>

<script>
  (() => {
    const phrases = ["A College Student!", 
                    "Creat U Young Story!","生如逆旅，一苇以航。"];
    let typeTimeout = null; // 用于存储定时器ID，方便清理

    function runTypewriter() {
      const textElement = document.getElementById('typewriter-text');
      
      // 如果当前页面没有打字机容器（说明不在主页），直接退出
      if (!textElement) return;

      // 重置状态
      let phraseIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      let typeSpeed = 100;

      // 清除可能存在的旧定时器，防止冲突
      if (typeTimeout) clearTimeout(typeTimeout);

      function type() {
        // 安全检查：如果元素已经被移除（例如用户快速跳转），停止运行
        if (!document.body.contains(textElement)) return;

        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
          textElement.textContent = currentPhrase.substring(0, charIndex - 1);
          charIndex--;
          typeSpeed = 50;
        } else {
          textElement.textContent = currentPhrase.substring(0, charIndex + 1);
          charIndex++;
          typeSpeed = 150;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
          isDeleting = true;
          typeSpeed = 2000; 
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typeSpeed = 500;
        }

        typeTimeout = setTimeout(type, typeSpeed);
      }

      type();
    }

    // 监听 MkDocs Material/Zensical 的页面加载事件
    // document$ 是主题提供的 RxJS 对象，每次页面内容更新时都会触发
    if (typeof document$ !== 'undefined') {
      document$.subscribe(function() {
        runTypewriter();
      });
    } else {
      // 降级处理：如果没有开启 Instant Loading，则使用原生事件
      document.addEventListener('DOMContentLoaded', runTypewriter);
    }
  })();
</script>