/**
 * 网站可视化编辑器核心脚本
 * NicoSun Lab Editor
 * 
 * 使用方式:
 * 1. URL参数: ?edit=true 或 ?admin
 * 2. 快捷键: Ctrl + Shift + E
 * 3. 点击导航栏编辑按钮
 */

class WebsiteEditor {
    constructor() {
        this.isEditing = false;
        this.selectedElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.editableSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'a', 'li', 'td', 'th',
            '.bento-item h3', '.bento-item p',
            '.tag', '.stat', '.description'
        ];
        this.imageSelectors = ['img', '.bento-item__image'];
        this.cardSelectors = ['.bento-item'];
        
        this.init();
    }
    
    init() {
        this.checkEditMode();
        this.bindEvents();
    }
    
    checkEditMode() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') === 'true' || params.get('admin') !== null) {
            this.enableEditMode();
        }
    }
    
    enableEditMode() {
        if (this.isEditing) return;
        
        this.isEditing = true;
        document.body.classList.add('editor-active');
        
        this.createToolbar();
        this.createEditPanel();
        this.createFloatingToolbar();
        this.bindEditorEvents();
        
        console.log('🎨 编辑器已启用');
    }
    
    disableEditMode() {
        if (!this.isEditing) return;
        
        this.isEditing = false;
        document.body.classList.remove('editor-active');
        
        document.querySelector('.editor-toolbar')?.remove();
        document.querySelector('.editor-panel')?.remove();
        document.querySelector('.editor-floating')?.remove();
        
        console.log('🎨 编辑器已关闭');
    }
    
    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.innerHTML = `
            <div class="editor-toolbar-content">
                <div class="editor-toolbar-left">
                    <button class="editor-btn" onclick="editor.disableEditMode()" title="退出编辑">
                        <span>✕</span> 退出
                    </button>
                    <div class="editor-divider"></div>
                    <button class="editor-btn" onclick="editor.undo()" title="撤销 (Ctrl+Z)">
                        <span>↶</span> 撤销
                    </button>
                    <button class="editor-btn" onclick="editor.redo()" title="重做 (Ctrl+Y)">
                        <span>↷</span> 重做
                    </button>
                    <div class="editor-divider"></div>
                    <button class="editor-btn" onclick="editor.saveConfig()" title="保存配置">
                        <span>💾</span> 保存
                    </button>
                    <button class="editor-btn" onclick="editor.exportConfig()" title="导出配置">
                        <span>📤</span> 导出
                    </button>
                    <button class="editor-btn" onclick="editor.loadConfig()" title="导入配置">
                        <span>📥</span> 导入
                    </button>
                </div>
                <div class="editor-toolbar-right">
                    <span class="editor-status">编辑模式已开启</span>
                </div>
            </div>
        `;
        document.body.appendChild(toolbar);
    }
    
    createEditPanel() {
        const panel = document.createElement('div');
        panel.className = 'editor-panel';
        panel.innerHTML = `
            <div class="editor-panel-header">
                <h3>元素属性</h3>
                <button class="editor-panel-close" onclick="editor.closePanel()">✕</button>
            </div>
            <div class="editor-panel-content" id="editor-panel-content">
                <p class="editor-hint">点击页面中的元素进行编辑</p>
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    createFloatingToolbar() {
        const floating = document.createElement('div');
        floating.className = 'editor-floating';
        floating.style.display = 'none';
        floating.innerHTML = `
            <button class="editor-float-btn" onclick="editor.editText()" title="编辑文本">✏️ 文本</button>
            <button class="editor-float-btn" onclick="editor.editImage()" title="编辑图片">🖼️ 图片</button>
            <button class="editor-float-btn" onclick="editor.editCard()" title="编辑卡片">📝 卡片</button>
            <button class="editor-float-btn" onclick="editor.deleteElement()" title="删除元素">🗑️ 删除</button>
        `;
        document.body.appendChild(floating);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                if (this.isEditing) {
                    this.disableEditMode();
                } else {
                    this.enableEditMode();
                }
            }
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
                e.preventDefault();
                this.redo();
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveConfig();
            }
        });
    }
    
    bindEditorEvents() {
        document.querySelectorAll(this.editableSelectors.join(', ')).forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.addEventListener('click', (e) => this.handleElementClick(e));
            el.addEventListener('input', () => this.saveToHistory());
        });
        
        document.querySelectorAll(this.imageSelectors.join(', ')).forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectElement(el);
            });
        });
        
        document.querySelectorAll(this.cardSelectors.join(', ')).forEach(el => {
            el.addEventListener('click', (e) => {
                if (this.isEditing) {
                    e.preventDefault();
                    this.selectElement(el);
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.editor-panel') && 
                !e.target.closest('.editor-floating') &&
                !e.target.closest('.editor-toolbar')) {
                this.closePanel();
            }
        });
    }
    
    handleElementClick(e) {
        if (this.isEditing && e.target.isContentEditable) {
            e.stopPropagation();
            this.selectElement(e.target);
        }
    }
    
    selectElement(element) {
        this.selectedElement = element;
        
        document.querySelectorAll('.editor-selected').forEach(el => {
            el.classList.remove('editor-selected');
        });
        element.classList.add('editor-selected');
        
        const rect = element.getBoundingClientRect();
        const floating = document.querySelector('.editor-floating');
        
        floating.style.display = 'flex';
        floating.style.left = `${rect.right + 10}px`;
        floating.style.top = `${rect.top}px`;
        
        this.updatePanel(element);
    }
    
    updatePanel(element) {
        const panel = document.querySelector('#editor-panel-content');
        if (!panel) return;
        
        let html = `
            <div class="editor-group">
                <label>元素类型</label>
                <input type="text" value="${element.tagName.toLowerCase()}" disabled>
            </div>
        `;
        
        if (element.tagName === 'IMG' || element.classList.contains('bento-item__image')) {
            html += this.getImageControls(element);
        } else if (element.classList.contains('bento-item')) {
            html += this.getCardControls(element);
        } else {
            html += this.getTextControls(element);
        }
        
        html += this.getStyleControls(element);
        
        panel.innerHTML = html;
    }
    
    getTextControls(element) {
        const style = window.getComputedStyle(element);
        return `
            <div class="editor-group">
                <label>文本内容</label>
                <textarea id="editor-text-content" rows="3">${element.innerText}</textarea>
            </div>
            <div class="editor-group">
                <label>字体大小</label>
                <input type="range" id="editor-font-size" min="12" max="72" value="${parseInt(style.fontSize)}" 
                    onchange="editor.updateStyle('fontSize', this.value + 'px')">
                <span>${style.fontSize}</span>
            </div>
            <div class="editor-group">
                <label>颜色</label>
                <input type="color" id="editor-color" value="${this.rgbToHex(style.color)}" 
                    onchange="editor.updateStyle('color', this.value)">
            </div>
            <div class="editor-group">
                <label>文字粗细</label>
                <select onchange="editor.updateStyle('fontWeight', this.value)">
                    <option value="normal" ${style.fontWeight === 'normal' ? 'selected' : ''}>正常</option>
                    <option value="bold" ${style.fontWeight === 'bold' ? 'selected' : ''}>粗体</option>
                    <option value="lighter" ${style.fontWeight === 'lighter' ? 'selected' : ''}>细体</option>
                </select>
            </div>
            <div class="editor-group">
                <label>对齐方式</label>
                <select onchange="editor.updateStyle('textAlign', this.value)">
                    <option value="left" ${style.textAlign === 'left' ? 'selected' : ''}>左对齐</option>
                    <option value="center" ${style.textAlign === 'center' ? 'selected' : ''}>居中</option>
                    <option value="right" ${style.textAlign === 'right' ? 'selected' : ''}>右对齐</option>
                </select>
            </div>
            <button class="editor-btn-primary" onclick="editor.applyTextChanges()">应用修改</button>
        `;
    }
    
    getImageControls(element) {
        const src = element.src || element.style.backgroundImage?.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
        return `
            <div class="editor-group">
                <label>图片地址</label>
                <input type="text" id="editor-img-src" value="${src}">
            </div>
            <div class="editor-group">
                <label>上传新图片</label>
                <input type="file" id="editor-img-upload" accept="image/*" onchange="editor.uploadImage(this)">
            </div>
            <div class="editor-group">
                <label>图片替换URL</label>
                <input type="text" id="editor-img-url" placeholder="输入图片URL">
                <button onclick="editor.updateImageFromUrl()">应用URL</button>
            </div>
            <div class="editor-group">
                <label>宽度</label>
                <input type="range" id="editor-img-width" min="50" max="800" value="${element.width || 300}" 
                    onchange="editor.updateStyle('width', this.value + 'px')">
            </div>
            <div class="editor-group">
                <label>圆角</label>
                <input type="range" id="editor-img-radius" min="0" max="50" value="${parseInt(style.borderRadius) || 0}" 
                    onchange="editor.updateStyle('borderRadius', this.value + 'px')">
            </div>
            <button class="editor-btn-primary" onclick="editor.applyImageChanges()">应用修改</button>
        `;
    }
    
    getCardControls(element) {
        const link = element.querySelector('a')?.href || '';
        const title = element.querySelector('h3')?.innerText || '';
        const desc = element.querySelector('p')?.innerText || '';
        
        return `
            <div class="editor-group">
                <label>卡片标题</label>
                <input type="text" id="editor-card-title" value="${title}">
            </div>
            <div class="editor-group">
                <label>卡片描述</label>
                <textarea id="editor-card-desc" rows="2">${desc}</textarea>
            </div>
            <div class="editor-group">
                <label>跳转链接</label>
                <input type="text" id="editor-card-link" value="${link}">
            </div>
            <div class="editor-group">
                <label>卡片状态</label>
                <select id="editor-card-status">
                    <option value="">无</option>
                    <option value="已完成" ${element.querySelector('.bento-item__status--completed') ? 'selected' : ''}>已完成</option>
                    <option value="开发中" ${element.querySelector('.bento-item__status--development') ? 'selected' : ''}>开发中</option>
                    <option value="规划中" ${element.querySelector('.bento-item__status--planned') ? 'selected' : ''}>规划中</option>
                </select>
            </div>
            <button class="editor-btn-primary" onclick="editor.applyCardChanges()">应用修改</button>
        `;
    }
    
    getStyleControls(element) {
        const style = window.getComputedStyle(element);
        return `
            <div class="editor-group">
                <label>外边距 (px)</label>
                <div class="editor-margin-inputs">
                    <input type="number" placeholder="上" value="${parseInt(style.marginTop) || 0}" 
                        onchange="editor.updateStyle('marginTop', this.value + 'px')">
                    <input type="number" placeholder="右" value="${parseInt(style.marginRight) || 0}" 
                        onchange="editor.updateStyle('marginRight', this.value + 'px')">
                    <input type="number" placeholder="下" value="${parseInt(style.marginBottom) || 0}" 
                        onchange="editor.updateStyle('marginBottom', this.value + 'px')">
                    <input type="number" placeholder="左" value="${parseInt(style.marginLeft) || 0}" 
                        onchange="editor.updateStyle('marginLeft', this.value + 'px')">
                </div>
            </div>
            <div class="editor-group">
                <label>内边距 (px)</label>
                <div class="editor-margin-inputs">
                    <input type="number" placeholder="上" value="${parseInt(style.paddingTop) || 0}" 
                        onchange="editor.updateStyle('paddingTop', this.value + 'px')">
                    <input type="number" placeholder="右" value="${parseInt(style.paddingRight) || 0}" 
                        onchange="editor.updateStyle('paddingRight', this.value + 'px')">
                    <input type="number" placeholder="下" value="${parseInt(style.paddingBottom) || 0}" 
                        onchange="editor.updateStyle('paddingBottom', this.value + 'px')">
                    <input type="number" placeholder="左" value="${parseInt(style.paddingLeft) || 0}" 
                        onchange="editor.updateStyle('paddingLeft', this.value + 'px')">
                </div>
            </div>
        `;
    }
    
    updateStyle(property, value) {
        if (this.selectedElement) {
            this.selectedElement.style[property] = value;
            this.saveToHistory();
        }
    }
    
    applyTextChanges() {
        const content = document.getElementById('editor-text-content');
        if (content && this.selectedElement) {
            this.selectedElement.innerText = content.value;
            this.saveToHistory();
        }
    }
    
    applyImageChanges() {
        const src = document.getElementById('editor-img-src');
        if (src && this.selectedElement) {
            this.selectedElement.src = src.value;
            this.saveToHistory();
        }
    }
    
    applyCardChanges() {
        const title = document.getElementById('editor-card-title');
        const desc = document.getElementById('editor-card-desc');
        const link = document.getElementById('editor-card-link');
        const status = document.getElementById('editor-card-status');
        
        if (this.selectedElement) {
            if (title) {
                const titleEl = this.selectedElement.querySelector('h3');
                if (titleEl) titleEl.innerText = title.value;
            }
            if (desc) {
                const descEl = this.selectedElement.querySelector('p');
                if (descEl) descEl.innerText = desc.value;
            }
            if (link) {
                let linkEl = this.selectedElement.querySelector('a');
                if (linkEl) {
                    linkEl.href = link.value;
                } else if (link.value) {
                    linkEl = document.createElement('a');
                    linkEl.href = link.value;
                    linkEl.className = 'bento-item__link';
                    this.selectedElement.appendChild(linkEl);
                }
            }
            this.saveToHistory();
        }
    }
    
    uploadImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (this.selectedElement) {
                    if (this.selectedElement.tagName === 'IMG') {
                        this.selectedElement.src = e.target.result;
                    } else {
                        this.selectedElement.style.backgroundImage = `url(${e.target.result})`;
                    }
                    this.saveToHistory();
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    updateImageFromUrl() {
        const url = document.getElementById('editor-img-url');
        if (url && url.value && this.selectedElement) {
            if (this.selectedElement.tagName === 'IMG') {
                this.selectedElement.src = url.value;
            } else {
                this.selectedElement.style.backgroundImage = `url(${url.value})`;
            }
            this.saveToHistory();
        }
    }
    
    editText() {
        if (this.selectedElement && this.selectedElement.isContentEditable) {
            this.selectedElement.focus();
            this.updatePanel(this.selectedElement);
        }
    }
    
    editImage() {
        if (this.selectedElement) {
            this.updatePanel(this.selectedElement);
        }
    }
    
    editCard() {
        if (this.selectedElement && this.selectedElement.classList.contains('bento-item')) {
            this.updatePanel(this.selectedElement);
        }
    }
    
    deleteElement() {
        if (this.selectedElement && confirm('确定要删除这个元素吗？')) {
            this.saveToHistory();
            this.selectedElement.remove();
            this.closePanel();
        }
    }
    
    closePanel() {
        document.querySelectorAll('.editor-selected').forEach(el => {
            el.classList.remove('editor-selected');
        });
        const floating = document.querySelector('.editor-floating');
        if (floating) {
            floating.style.display = 'none';
        }
        this.selectedElement = null;
    }
    
    saveToHistory() {
        const html = document.body.innerHTML;
        
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(html);
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            document.body.innerHTML = this.history[this.historyIndex];
            this.bindEditorEvents();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            document.body.innerHTML = this.history[this.historyIndex];
            this.bindEditorEvents();
        }
    }
    
    saveConfig() {
        const config = {
            page: window.location.pathname,
            html: document.body.innerHTML,
            timestamp: new Date().toISOString()
        };
        
        const pageName = window.location.pathname.replace(/\//g, '_') || 'index';
        localStorage.setItem(`editor_config_${pageName}`, JSON.stringify(config));
        
        alert('配置已保存到浏览器存储！');
    }
    
    exportConfig() {
        const config = {
            page: window.location.pathname,
            html: document.body.innerHTML,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `editor-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    loadConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const config = JSON.parse(e.target.result);
                        if (config.html) {
                            document.body.innerHTML = config.html;
                            this.bindEditorEvents();
                            alert('配置导入成功！');
                        }
                    } catch (err) {
                        alert('配置导入失败：' + err.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        const result = rgb.match(/\d+/g);
        if (!result) return '#000000';
        return '#' + result.slice(0, 3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}

const editor = new WebsiteEditor();

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true' || params.get('admin') !== null) {
        editor.enableEditMode();
    }
});