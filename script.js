/**
 * 日期文字记录器 - JavaScript模块
 * 使用DOM操作管理用户输入的文字记录
 */

class TextManager {
    constructor() {
        this.texts = this.loadFromStorage();
        this.tasks = this.loadTasksFromStorage();
        this.currentDate = new Date();
        this.selectedDate = new Date(); // 当日日历选中的日期
        this.initializeEventListeners();
        this.updateDisplay();
        this.updateDailyCalendar();
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        const textForm = document.getElementById('textForm');
        const taskForm = document.getElementById('taskForm');
        const dateInput = document.getElementById('dateInput');
        const taskDateInput = document.getElementById('taskDateInput');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const prevDayBtn = document.getElementById('prevDay');
        const nextDayBtn = document.getElementById('nextDay');
        const modal = document.getElementById('recordModal');
        const closeBtn = document.querySelector('.close');
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        // 设置默认日期为今天
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        taskDateInput.value = today;
        
        // 记录表单
        textForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addText();
        });

        // 任务表单
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Tab切换
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // 月历控制按钮
        prevMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateDisplay();
        });

        nextMonthBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateDisplay();
        });

        // 当日日历控制按钮
        prevDayBtn.addEventListener('click', () => {
            this.selectedDate.setDate(this.selectedDate.getDate() - 1);
            this.updateDailyCalendar();
        });

        nextDayBtn.addEventListener('click', () => {
            this.selectedDate.setDate(this.selectedDate.getDate() + 1);
            this.updateDailyCalendar();
        });

        // 模态框关闭
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * 添加新的文字记录
     */
    addText() {
        const textInput = document.getElementById('textInput');
        const dateInput = document.getElementById('dateInput');
        
        const text = textInput.value.trim();
        const date = dateInput.value;
        
        if (!text) {
            this.showNotification('请输入要记录的文字！', 'error');
            return;
        }
        
        const textItem = {
            id: Date.now(),
            text: text,
            date: date,
            timestamp: new Date().toLocaleTimeString('zh-CN'),
            type: 'record'
        };
        
        this.texts.push(textItem);
        this.saveToStorage();
        this.updateDisplay();
        this.updateDailyCalendar();
        
        // 清空输入框
        textInput.value = '';
        
        // 显示添加成功提示
        this.showNotification('记录添加成功！', 'success');
    }

    /**
     * 添加新的任务
     */
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskDateInput = document.getElementById('taskDateInput');
        const taskPriority = document.getElementById('taskPriority');
        
        const text = taskInput.value.trim();
        const date = taskDateInput.value;
        const priority = taskPriority.value;
        
        if (!text) {
            this.showNotification('请输入任务内容！', 'error');
            return;
        }
        
        const taskItem = {
            id: Date.now(),
            text: text,
            date: date,
            timestamp: new Date().toLocaleTimeString('zh-CN'),
            type: 'task',
            priority: priority,
            completed: false
        };
        
        this.tasks.push(taskItem);
        this.saveTasksToStorage();
        this.updateDisplay();
        this.updateDailyCalendar();
        this.updateMonthlyProgress();
        
        // 清空输入框
        taskInput.value = '';
        
        // 显示添加成功提示
        this.showNotification('任务添加成功！', 'success');
    }

    /**
     * 切换Tab
     */
    switchTab(tab) {
        // 更新Tab按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // 更新表单显示
        document.querySelectorAll('.input-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(tab === 'task' ? 'taskForm' : 'textForm').classList.add('active');
    }

    /**
     * 删除指定的文字记录
     * @param {number} id - 记录的唯一ID
     */
    deleteText(id) {
        if (confirm('确定要删除这条记录吗？')) {
            this.texts = this.texts.filter(item => item.id !== id);
            this.saveToStorage();
            this.updateDisplay();
            this.updateDailyCalendar();
            this.showNotification('记录已删除', 'info');
        }
    }

    /**
     * 删除指定的任务
     * @param {number} id - 任务的唯一ID
     */
    deleteTask(id) {
        if (confirm('确定要删除这个任务吗？')) {
            this.tasks = this.tasks.filter(item => item.id !== id);
            this.saveTasksToStorage();
            this.updateDisplay();
            this.updateDailyCalendar();
            this.updateMonthlyProgress();
            this.showNotification('任务已删除', 'info');
        }
    }

    /**
     * 切换任务完成状态
     * @param {number} id - 任务的唯一ID
     */
    toggleTask(id) {
        const task = this.tasks.find(item => item.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasksToStorage();
            this.updateDisplay();
            this.updateDailyCalendar();
            this.updateMonthlyProgress();
            this.showNotification(task.completed ? '任务已完成' : '任务已标记为未完成', 'success');
        }
    }

    /**
     * 更新显示区域
     */
    updateDisplay() {
        const calendar = document.getElementById('calendar');
        const stats = document.getElementById('stats');
        const currentMonthSpan = document.getElementById('currentMonth');
        
        // 更新月份显示
        currentMonthSpan.textContent = this.currentDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
        });
        
        if (this.texts.length === 0 && this.tasks.length === 0) {
            calendar.innerHTML = '<div class="empty-state">还没有任何记录，开始添加你的第一条记录吧！</div>';
            stats.style.display = 'none';
            return;
        }
        
        // 生成日历
        this.generateCalendar();
        
        // 更新月度进度条
        this.updateMonthlyProgress();
        
        // 更新统计信息
        this.updateStats();
    }

    /**
     * 更新月度进度条
     */
    updateMonthlyProgress() {
        const currentDate = new Date(this.currentDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // 获取当月所有日期
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        
        let completedDays = 0;
        let totalDaysWithTasks = 0;
        const dayMarkers = [];
        
        // 遍历当月每一天
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = this.tasks.filter(task => task.date === dateStr);
            const completedTasks = dayTasks.filter(task => task.completed);
            
            const isToday = isCurrentMonth && day === today.getDate();
            const hasTasks = dayTasks.length > 0;
            const allTasksCompleted = hasTasks && completedTasks.length === dayTasks.length;
            
            if (hasTasks) {
                totalDaysWithTasks++;
                if (allTasksCompleted) {
                    completedDays++;
                }
            }
            
            // 创建日期标记
            const marker = document.createElement('div');
            marker.className = 'monthly-day-marker';
            if (allTasksCompleted) {
                marker.classList.add('completed');
            }
            if (isToday) {
                marker.classList.add('today');
            }
            dayMarkers.push(marker);
        }
        
        // 更新进度条
        this.updateMonthlyProgressBar(completedDays, totalDaysWithTasks, dayMarkers);
    }

    /**
     * 更新月度进度条显示
     */
    updateMonthlyProgressBar(completedDays, totalDaysWithTasks, dayMarkers) {
        const progressText = document.getElementById('monthlyProgressText');
        const progressPercentage = document.getElementById('monthlyProgressPercentage');
        const progressFill = document.getElementById('monthlyProgressFill');
        const progressDays = document.getElementById('monthlyProgressDays');
        const progressIcon = document.querySelector('.monthly-progress-icon');
        const progressTitle = document.querySelector('.monthly-progress-title span:last-child');
        const motivationText = document.getElementById('monthlyMotivationText');
        const motivationEmoji = document.getElementById('monthlyMotivationEmoji');
        const progressSection = document.querySelector('.monthly-progress-section');
        
        const progressPercent = totalDaysWithTasks === 0 ? 0 : Math.round((completedDays / totalDaysWithTasks) * 100);
        
        // 更新进度文本和百分比
        if (totalDaysWithTasks === 0) {
            progressText.textContent = '暂无任务';
            progressPercentage.textContent = '0%';
        } else {
            progressText.textContent = `${completedDays} / ${totalDaysWithTasks} 天完成`;
            progressPercentage.textContent = `${progressPercent}%`;
        }
        
        // 更新进度条宽度
        progressFill.style.width = `${progressPercent}%`;
        
        // 更新日期标记
        progressDays.innerHTML = '';
        dayMarkers.forEach(marker => {
            progressDays.appendChild(marker);
        });
        
        // 更新激励内容
        this.updateMonthlyMotivation(totalDaysWithTasks, completedDays, progressPercent, progressIcon, progressTitle, motivationText, motivationEmoji);
        
        // 更新进度条状态和动画
        progressFill.className = 'monthly-progress-fill';
        progressSection.classList.remove('celebration');
        
        if (totalDaysWithTasks === 0) {
            progressFill.classList.add('no-progress');
        } else if (progressPercent === 100) {
            progressFill.classList.add('completed');
            progressSection.classList.add('celebration');
            this.triggerMonthlyCelebration();
        } else if (progressPercent >= 50) {
            progressFill.classList.add('half-completed');
        }
    }

    /**
     * 更新月度激励内容
     */
    updateMonthlyMotivation(totalDaysWithTasks, completedDays, progressPercent, icon, title, text, emoji) {
        const motivations = {
            noTasks: {
                icon: '●',
                title: '本月打卡进度',
                text: '添加任务开始你的月度打卡之旅！',
                emoji: '●'
            },
            justStarted: {
                icon: '●',
                title: '本月打卡进度',
                text: '好的开始！继续保持这个节奏！',
                emoji: '●'
            },
            inProgress: {
                icon: '●',
                title: '本月打卡进度',
                text: '坚持就是胜利！你做得很好！',
                emoji: '●'
            },
            halfWay: {
                icon: '●',
                title: '本月打卡进度',
                text: '已经完成一半了！继续加油！',
                emoji: '●'
            },
            almostDone: {
                icon: '●',
                title: '本月打卡进度',
                text: '即将完成月度目标！冲刺吧！',
                emoji: '●'
            },
            completed: {
                icon: '●',
                title: '本月打卡进度',
                text: '太棒了！本月所有任务都完成了！',
                emoji: '●'
            }
        };

        let motivation;
        if (totalDaysWithTasks === 0) {
            motivation = motivations.noTasks;
        } else if (completedDays === 0) {
            motivation = motivations.justStarted;
        } else if (progressPercent < 25) {
            motivation = motivations.inProgress;
        } else if (progressPercent < 50) {
            motivation = motivations.halfWay;
        } else if (progressPercent < 100) {
            motivation = motivations.almostDone;
        } else {
            motivation = motivations.completed;
        }

        icon.textContent = motivation.icon;
        title.textContent = motivation.title;
        text.textContent = motivation.text;
        emoji.textContent = motivation.emoji;
    }

    /**
     * 触发月度庆祝动画
     */
    triggerMonthlyCelebration() {
        // 创建月度庆祝粒子效果
        this.createMonthlyCelebrationParticles();
        
        // 显示庆祝通知
        this.showNotification('恭喜！本月所有任务都完成了！', 'success');
    }

    /**
     * 创建月度庆祝粒子效果
     */
    createMonthlyCelebrationParticles() {
        const progressSection = document.querySelector('.monthly-progress-section');
        const particles = ['●', '◆', '▲', '■', '★', '♦', '◊'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.cssText = `
                    position: absolute;
                    font-size: 1.8em;
                    pointer-events: none;
                    z-index: 1000;
                    animation: monthlyParticleFall 3s ease-out forwards;
                    left: ${Math.random() * 100}%;
                    top: 0;
                `;
                
                progressSection.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 150);
        }
    }

    /**
     * 更新当日日历
     */
    updateDailyCalendar() {
        const currentDaySpan = document.getElementById('currentDay');
        const dailyItems = document.getElementById('dailyItems');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        // 更新日期显示
        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const formattedDate = this.formatDate(dateStr);
        currentDaySpan.textContent = formattedDate;
        
        // 获取当天的记录和任务
        const dayRecords = this.texts.filter(item => item.date === dateStr);
        const dayTasks = this.tasks.filter(item => item.date === dateStr);
        const completedTasks = dayTasks.filter(task => task.completed);
        
        // 更新进度条
        this.updateProgressBar(dayTasks, completedTasks);
        
        // 合并并排序所有项目（任务优先，未完成任务在前）
        const allItems = [
            ...dayTasks.filter(task => !task.completed), // 未完成任务
            ...dayRecords, // 记录
            ...dayTasks.filter(task => task.completed)   // 已完成任务
        ];
        
        if (allItems.length === 0) {
            dailyItems.innerHTML = '<div class="daily-empty-state">这一天还没有记录或任务</div>';
        } else {
            let html = '';
            allItems.forEach(item => {
                if (item.type === 'task') {
                    const priorityIcon = item.completed ? '✅' : 
                        item.priority === 'high' ? '🔴' : 
                        item.priority === 'medium' ? '🟡' : '🟢';
                    
                    html += `
                        <div class="daily-item task-item ${item.completed ? 'completed' : ''}">
                            <div class="daily-item-content">
                                <div class="daily-item-icon">${priorityIcon}</div>
                                <div class="daily-item-text ${item.completed ? 'completed' : ''}">${this.escapeHtml(item.text)}</div>
                                <div class="daily-item-time">${item.timestamp}</div>
                            </div>
                            <div class="daily-item-actions">
                                <button class="daily-action-btn" onclick="textManager.toggleTask(${item.id}); textManager.updateDailyCalendar()" title="${item.completed ? '标记为未完成' : '标记为完成'}">
                                    ${item.completed ? '↩️' : '✅'}
                                </button>
                                <button class="daily-action-btn delete" onclick="textManager.deleteTask(${item.id}); textManager.updateDailyCalendar()" title="删除">×</button>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="daily-item record-item">
                            <div class="daily-item-content">
                                <div class="daily-item-icon">📝</div>
                                <div class="daily-item-text">${this.escapeHtml(item.text)}</div>
                                <div class="daily-item-time">${item.timestamp}</div>
                            </div>
                            <div class="daily-item-actions">
                                <button class="daily-action-btn delete" onclick="textManager.deleteText(${item.id}); textManager.updateDailyCalendar()" title="删除">×</button>
                            </div>
                        </div>
                    `;
                }
            });
            dailyItems.innerHTML = html;
        }
    }

    /**
     * 更新进度条
     * @param {Array} dayTasks - 当天的所有任务
     * @param {Array} completedTasks - 已完成的任务
     */
    updateProgressBar(dayTasks, completedTasks) {
        const progressText = document.getElementById('progressText');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressFill = document.getElementById('progressFill');
        const progressIcon = document.getElementById('progressIcon');
        const progressTitle = document.getElementById('progressTitle');
        const motivationText = document.getElementById('motivationText');
        const motivationEmoji = document.getElementById('motivationEmoji');
        const progressMilestones = document.getElementById('progressMilestones');
        const progressSection = document.querySelector('.progress-section');
        
        const totalTasks = dayTasks.length;
        const completedCount = completedTasks.length;
        const progressPercent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
        
        // 更新进度文本和百分比
        if (totalTasks === 0) {
            progressText.textContent = '暂无任务';
            progressPercentage.textContent = '0%';
        } else {
            progressText.textContent = `${completedCount} / ${totalTasks} 已完成`;
            progressPercentage.textContent = `${progressPercent}%`;
        }
        
        // 更新进度条宽度
        progressFill.style.width = `${progressPercent}%`;
        
        // 更新里程碑
        this.updateMilestones(progressMilestones, totalTasks, completedCount);
        
        // 更新激励内容
        this.updateMotivation(totalTasks, completedCount, progressPercent, progressIcon, progressTitle, motivationText, motivationEmoji);
        
        // 更新进度条状态和动画
        progressFill.className = 'progress-fill';
        progressSection.classList.remove('celebration');
        
        if (totalTasks === 0) {
            progressFill.classList.add('no-tasks');
        } else if (progressPercent === 100) {
            progressFill.classList.add('completed');
            progressSection.classList.add('celebration');
            this.triggerCelebration();
        } else if (progressPercent >= 50) {
            progressFill.classList.add('half-completed');
        }
    }

    /**
     * 更新里程碑
     */
    updateMilestones(container, totalTasks, completedCount) {
        container.innerHTML = '';
        if (totalTasks === 0) return;
        
        const milestones = Math.min(totalTasks, 5); // 最多显示5个里程碑
        for (let i = 0; i < milestones; i++) {
            const milestone = document.createElement('div');
            milestone.className = 'milestone';
            if (i < completedCount) {
                milestone.classList.add('achieved');
            }
            container.appendChild(milestone);
        }
    }

    /**
     * 更新激励内容
     */
    updateMotivation(totalTasks, completedCount, progressPercent, icon, title, text, emoji) {
        const motivations = {
            noTasks: {
                icon: '●',
                title: '准备开始',
                text: '添加你的第一个任务吧！',
                emoji: '●'
            },
            justStarted: {
                icon: '●',
                title: '开始冲刺',
                text: '好的开始是成功的一半！',
                emoji: '●'
            },
            inProgress: {
                icon: '●',
                title: '持续努力',
                text: '保持这个节奏，你做得很好！',
                emoji: '●'
            },
            halfWay: {
                icon: '●',
                title: '过半完成',
                text: '已经完成一半了，继续加油！',
                emoji: '●'
            },
            almostDone: {
                icon: '●',
                title: '即将完成',
                text: '就差一点了，冲刺吧！',
                emoji: '●'
            },
            completed: {
                icon: '●',
                title: '全部完成',
                text: '太棒了！今天任务全部完成！',
                emoji: '●'
            }
        };

        let motivation;
        if (totalTasks === 0) {
            motivation = motivations.noTasks;
        } else if (completedCount === 0) {
            motivation = motivations.justStarted;
        } else if (progressPercent < 25) {
            motivation = motivations.inProgress;
        } else if (progressPercent < 50) {
            motivation = motivations.halfWay;
        } else if (progressPercent < 100) {
            motivation = motivations.almostDone;
        } else {
            motivation = motivations.completed;
        }

        icon.textContent = motivation.icon;
        title.textContent = motivation.title;
        text.textContent = motivation.text;
        emoji.textContent = motivation.emoji;
    }

    /**
     * 触发庆祝动画
     */
    triggerCelebration() {
        // 创建庆祝粒子效果
        this.createCelebrationParticles();
        
        // 显示庆祝通知
        this.showNotification('恭喜！今天所有任务都完成了！', 'success');
    }

    /**
     * 创建庆祝粒子效果
     */
    createCelebrationParticles() {
        const progressSection = document.querySelector('.progress-section');
        const particles = ['●', '◆', '▲', '■', '★'];
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.cssText = `
                    position: absolute;
                    font-size: 1.5em;
                    pointer-events: none;
                    z-index: 1000;
                    animation: particleFall 2s ease-out forwards;
                    left: ${Math.random() * 100}%;
                    top: 0;
                `;
                
                progressSection.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    /**
     * 生成日历HTML
     */
    generateCalendar() {
        const calendar = document.getElementById('calendar');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // 获取上个月的最后几天
        const prevMonth = new Date(year, month - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        let html = '';
        
        // 星期标题
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            html += `<div class="calendar-header-cell">${day}</div>`;
        });
        
        // 上个月的日期
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day other-month">
                <div class="day-number">${day}</div>
            </div>`;
        }
        
        // 当月的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRecords = this.texts.filter(item => item.date === dateStr);
            const dayTasks = this.tasks.filter(item => item.date === dateStr);
            const completedTasks = dayTasks.filter(task => task.completed);
            const today = new Date();
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            
            // 检查是否所有任务都已完成
            const allTasksCompleted = dayTasks.length > 0 && completedTasks.length === dayTasks.length;
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (dayRecords.length > 0 || dayTasks.length > 0) dayClass += ' has-records';
            if (allTasksCompleted) dayClass += ' completed';
            
            html += `<div class="${dayClass}" onclick="textManager.showDayRecords('${dateStr}')">
                <div class="day-number">${day}</div>
                ${allTasksCompleted ? '<div class="completion-badge"></div>' : ''}`;
            
            // 合并记录和任务，任务优先显示
            const allItems = [...dayTasks, ...dayRecords];
            if (allItems.length > 0) {
                html += `<div class="record-tags">`;
                // 根据格子大小限制显示记录数量
                const maxRecords = 3; // 最多显示3条记录
                const maxTextLength = 6; // 每条记录最多6个字符
                
                allItems.slice(0, maxRecords).forEach(item => {
                    let shortText = item.text;
                    if (shortText.length > maxTextLength) {
                        shortText = shortText.substring(0, maxTextLength) + '...';
                    }
                    
                    if (item.type === 'task') {
                        const priorityClass = item.completed ? 'completed' : item.priority + '-priority';
                        html += `<div class="task-tag ${priorityClass}" title="${this.escapeHtml(item.text)}">${this.escapeHtml(shortText)}</div>`;
                    } else {
                        html += `<div class="record-tag" title="${this.escapeHtml(item.text)}">${this.escapeHtml(shortText)}</div>`;
                    }
                });
                
                if (allItems.length > maxRecords) {
                    html += `<div class="record-count">+${allItems.length - maxRecords}</div>`;
                }
                html += `</div>`;
            }
            
            html += `</div>`;
        }
        
        // 下个月的日期
        const remainingDays = 42 - (firstDayOfWeek + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month">
                <div class="day-number">${day}</div>
            </div>`;
        }
        
        calendar.innerHTML = html;
    }

    /**
     * 显示指定日期的记录
     * @param {string} dateStr - 日期字符串
     */
    showDayRecords(dateStr) {
        const dayRecords = this.texts.filter(item => item.date === dateStr);
        const dayTasks = this.tasks.filter(item => item.date === dateStr);
        const modal = document.getElementById('recordModal');
        const modalDate = document.getElementById('modalDate');
        const modalBody = document.getElementById('modalBody');
        
        const formattedDate = this.formatDate(dateStr);
        modalDate.textContent = formattedDate;
        
        // 合并记录和任务，任务优先显示
        const allItems = [...dayTasks, ...dayRecords];
        
        if (allItems.length === 0) {
            modalBody.innerHTML = '<div class="empty-state">这一天还没有记录或任务</div>';
        } else {
            let html = '';
            
            // 先显示任务
            dayTasks.forEach(task => {
                const completedClass = task.completed ? 'completed' : '';
                const priorityIcon = task.completed ? '✅' : 
                    task.priority === 'high' ? '🔴' : 
                    task.priority === 'medium' ? '🟡' : '🟢';
                
                html += `
                    <div class="modal-record-item task-item ${completedClass}">
                        <div class="task-controls">
                            <button class="task-toggle-btn" onclick="textManager.toggleTask(${task.id}); textManager.showDayRecords('${dateStr}')" title="${task.completed ? '标记为未完成' : '标记为完成'}">
                                ${task.completed ? '↩️' : '✅'}
                            </button>
                            <button class="modal-delete-btn" onclick="textManager.deleteTask(${task.id}); textManager.showDayRecords('${dateStr}')" title="删除">×</button>
                        </div>
                        <div class="modal-record-content">
                            <span class="priority-icon">${priorityIcon}</span>
                            <span class="${task.completed ? 'completed-text' : ''}">${this.escapeHtml(task.text)}</span>
                        </div>
                        <div class="modal-record-time">添加时间：${task.timestamp}</div>
                    </div>
                `;
            });
            
            // 再显示记录
            dayRecords.forEach(record => {
                html += `
                    <div class="modal-record-item">
                        <button class="modal-delete-btn" onclick="textManager.deleteText(${record.id}); textManager.showDayRecords('${dateStr}')" title="删除">×</button>
                        <div class="modal-record-content">${this.escapeHtml(record.text)}</div>
                        <div class="modal-record-time">添加时间：${record.timestamp}</div>
                    </div>
                `;
            });
            
            modalBody.innerHTML = html;
        }
        
        modal.style.display = 'block';
    }

    /**
     * 按日期分组文字记录
     * @returns {Object} 按日期分组的对象
     */
    groupTextsByDate() {
        const grouped = {};
        this.texts.forEach(item => {
            if (!grouped[item.date]) {
                grouped[item.date] = [];
            }
            grouped[item.date].push(item);
        });
        return grouped;
    }

    /**
     * 格式化日期显示
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (dateString === today.toISOString().split('T')[0]) {
            return '今天';
        } else if (dateString === yesterday.toISOString().split('T')[0]) {
            return '昨天';
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const stats = document.getElementById('stats');
        const totalCount = document.getElementById('totalCount');
        const dateCount = document.getElementById('dateCount');
        
        const uniqueDates = new Set(this.texts.map(item => item.date));
        
        totalCount.textContent = this.texts.length;
        dateCount.textContent = uniqueDates.size;
        stats.style.display = 'flex';
    }

    /**
     * HTML转义，防止XSS攻击
     * @param {string} text - 原始文本
     * @returns {string} 转义后的HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示通知消息
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, error, info)
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // 添加动画样式（如果还没有添加过）
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 保存数据到本地存储
     */
    saveToStorage() {
        try {
            localStorage.setItem('textRecords', JSON.stringify(this.texts));
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showNotification('保存数据失败', 'error');
        }
    }

    /**
     * 从本地存储加载数据
     * @returns {Array} 文字记录数组
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('textRecords');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showNotification('加载数据失败', 'error');
            return [];
        }
    }

    /**
     * 保存任务数据到本地存储
     */
    saveTasksToStorage() {
        try {
            localStorage.setItem('textTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('保存任务数据失败:', error);
            this.showNotification('保存任务数据失败', 'error');
        }
    }

    /**
     * 从本地存储加载任务数据
     * @returns {Array} 任务数组
     */
    loadTasksFromStorage() {
        try {
            const stored = localStorage.getItem('textTasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('加载任务数据失败:', error);
            this.showNotification('加载任务数据失败', 'error');
            return [];
        }
    }

}


// 全局变量
let textManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    textManager = new TextManager();
});

// 导出到全局作用域（用于HTML中的onclick事件）
window.textManager = textManager;
