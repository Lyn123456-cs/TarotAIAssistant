// AI塔罗牌助手 - 主要功能实现
class TarotAssistant {
    constructor() {
        this.currentQuestion = '';
        this.selectedCategory = '';
        this.detectedQuestionType = null;
        this.isReading = false;
        this.selectedDrawingMethod = null;
        
        // 初始化AI解牌服务
        this.aiService = new AITarotService();
        this.useAIReading = false;
        
        this.initializeElements();
        this.bindEvents();
        
        // 检查是否有保存的API配置
        this.loadApiConfig();
    }

    // 初始化DOM元素
    initializeElements() {
        this.questionSection = document.getElementById('questionSection');
        this.readingSection = document.getElementById('readingSection');
        this.userQuestion = document.getElementById('userQuestion');
        this.startReadingBtn = document.getElementById('startReading');
        this.clearQuestionBtn = document.getElementById('clearQuestion');
        this.newReadingBtn = document.getElementById('newReading');
        this.questionDisplay = document.getElementById('questionDisplay');
        this.tarotCards = document.getElementById('tarotCards');
        this.readingResult = document.getElementById('readingResult');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.questionTypeDisplay = null; // 将在需要时动态创建
        this.drawingMethodSelection = document.getElementById('drawingMethodSelection');
        this.cardSelectionArea = document.getElementById('cardSelectionArea');
        this.cardGrid = document.getElementById('cardGrid');
        this.selectedDrawingMethod = null;
        
        // AI配置相关元素
        this.aiConfigSection = document.getElementById('aiConfigSection');
        this.aiProviderSelect = document.getElementById('aiProvider');
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveApiConfigBtn = document.getElementById('saveApiConfig');
        this.testApiConnectionBtn = document.getElementById('testApiConnection');
        this.skipAiConfigBtn = document.getElementById('skipAiConfig');
        this.apiStatus = document.getElementById('apiStatus');
    }

    // 绑定事件监听器
    bindEvents() {
        // 问题输入框事件
        this.userQuestion.addEventListener('input', () => {
            this.validateQuestion();
            this.analyzeQuestionType();
        });

        // 分类按钮事件
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCategory(e.target);
            });
        });

        // 开始占卜按钮
        this.startReadingBtn.addEventListener('click', () => {
            this.startReading();
        });

        // 清空问题按钮
        this.clearQuestionBtn.addEventListener('click', () => {
            this.clearQuestion();
        });

        // 新的占卜按钮
        this.newReadingBtn.addEventListener('click', () => {
            this.resetToQuestion();
        });

        // 抽牌方式选择按钮 - 直接绑定到按钮上，提高响应速度
        this.methodButtons = document.querySelectorAll('.method-btn');
        this.methodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 确保获取的是按钮元素本身，而不是其子元素
                const button = e.currentTarget;
                this.selectDrawingMethod(button);
            });
        });

        // AI配置相关事件
        if (this.saveApiConfigBtn) {
            this.saveApiConfigBtn.addEventListener('click', () => {
                this.saveApiConfig();
            });
        }

        if (this.testApiConnectionBtn) {
            this.testApiConnectionBtn.addEventListener('click', () => {
                this.testApiConnection();
            });
        }

        if (this.skipAiConfigBtn) {
            this.skipAiConfigBtn.addEventListener('click', () => {
                this.skipAiConfig();
            });
        }
    }

    // 选择问题分类
    selectCategory(button) {
        // 移除所有按钮的active状态
        this.categoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // 添加当前按钮的active状态
        button.classList.add('active');
        this.selectedCategory = button.dataset.category;

        // 根据分类提供建议问题
        this.suggestQuestionForCategory(this.selectedCategory);
        
        // 重新验证问题
        this.validateQuestion();
    }

    // 选择抽牌方式
    selectDrawingMethod(button) {
        // 防止重复点击
        if (button.classList.contains('selected')) return;
        
        // 移除所有按钮的selected状态
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 添加selected状态到当前按钮
        button.classList.add('selected');
        this.selectedDrawingMethod = button.dataset.method;
        
        // 减少延迟，提高响应速度
        setTimeout(() => {
            this.proceedWithDrawing();
        }, 200);
    }

    // 根据分类建议问题
    suggestQuestionForCategory(category) {
        const suggestions = {
            love: '例如：我最近的感情发展会如何？我是否应该主动追求某个人？',
            career: '例如：我的事业方向是否正确？我应该换工作吗？',
            health: '例如：我的健康状况如何？我应该注意什么？',
            finance: '例如：我的财运如何？投资方向是否正确？',
            family: '例如：我的家庭关系如何？应该如何改善？',
            general: '例如：我当前面临的主要挑战是什么？应该如何应对？'
        };

        if (suggestions[category]) {
            this.userQuestion.placeholder = suggestions[category];
        }
    }

    // 验证问题输入
    validateQuestion() {
        this.currentQuestion = this.userQuestion.value.trim();
        
        if (this.currentQuestion.length >= 5) {
            this.startReadingBtn.disabled = false;
            this.startReadingBtn.style.opacity = '1';
        } else {
            this.startReadingBtn.disabled = true;
            this.startReadingBtn.style.opacity = '0.6';
        }
    }

    // AI问题类型分析
    analyzeQuestionType() {
        const question = this.userQuestion.value.trim();
        
        if (question.length < 3) {
            this.detectedQuestionType = null;
            this.displayQuestionType(null);
            return;
        }

        // 问题类型检测算法
        this.detectedQuestionType = this.detectQuestionType(question);
        this.displayQuestionType(this.detectedQuestionType);
    }

    // 检测问题类型
    detectQuestionType(question) {
        const lowerQuestion = question.toLowerCase();
        
        // 趋势题检测（优先级最高，避免被是非题误判）
        const trendPatterns = [
            /走向|趋势|发展|变化|方向|未来|以后|接下来|将会|即将/,
            /如何发展|怎么变化|什么趋势|什么走向|什么方向|什么样子的/,
            /会.*发展|会.*变化|会.*走向|会.*趋势|会.*样子/,
            /发展.*如何|变化.*如何|走向.*如何|趋势.*如何|样子.*如何/,
            /.*走向.*什么|.*趋势.*什么|.*发展.*什么|.*变化.*什么/,
            /.*未来.*如何|.*以后.*如何|.*接下来.*如何/
        ];
        
        // 是非题检测
        const yesNoPatterns = [
            /是否|会不会|能不能|可不可以|行不行|对不对|好不好/,
            /应该.*吗|可以.*吗|会.*吗|能.*吗|要.*吗|需要.*吗|适合.*吗/,
            /是不是|对不对|好不好|行不行|对不对|对不对/,
            /^.*[？?]$/ // 以问号结尾的简单问题
        ];
        
        // 选择题检测
        const choicePatterns = [
            /选择|决定|应该.*还是|是.*还是|要.*还是|选.*还是/,
            /A.*B|甲.*乙|这个.*那个|前者.*后者|前者.*后者/,
            /哪个.*更好|哪个.*更合适|哪个.*更有利|哪个.*更合适/,
            /选择.*哪个|选择.*什么|决定.*哪个|决定.*什么/
        ];
        
        // 建议题检测
        const advicePatterns = [
            /建议|推荐|应该.*做|如何.*做|怎么.*做|怎样.*做/,
            /怎么办|如何办|怎么处理|如何解决|怎样应对|如何改善/,
            /给我.*建议|给我.*指导|给我.*意见|给我.*方法/,
            /如何.*提高|怎么.*提高|怎样.*提高|如何.*改善/
        ];
        
        // 预测题检测
        const predictionPatterns = [
            /预测|预知|预见|预判|将会.*发生|可能.*发生/,
            /什么时候|何时|多久|多长时间|什么时候.*会/,
            /结果.*如何|结局.*如何|最终.*如何|后果.*如何/,
            /.*会发生.*什么|.*会变成.*什么|.*会如何.*发展/
        ];
        
        // 时间题检测
        const timePatterns = [
            /什么时候|何时|多久|多长时间|什么时候.*会|何时.*会/,
            /.*时间.*会|.*时候.*会|.*时候.*发生|.*时间.*发生/,
            /.*多久.*会|.*多长时间.*会|.*多久.*能|.*多长时间.*能/
        ];
        
        // 原因题检测
        const reasonPatterns = [
            /为什么|为何|什么原因|什么导致|什么造成|什么引起/,
            /.*为什么.*会|.*为何.*会|.*原因.*是|.*导致.*是/,
            /.*造成.*是|.*引起.*是|.*原因.*什么|.*导致.*什么/
        ];
        
        // 比较题检测
        const comparisonPatterns = [
            /比较|对比|相比|比较.*如何|对比.*如何|相比.*如何/,
            /.*比.*如何|.*比.*怎么样|.*比.*更好|.*比.*更差/,
            /.*和.*哪个|.*与.*哪个|.*跟.*哪个|.*同.*哪个/
        ];

        // 按优先级检测（趋势题优先级最高，避免被是非题误判）
        if (trendPatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'trend',
                name: '趋势题',
                description: '了解事物的发展趋势和走向',
                icon: '📈',
                readingMethod: '三牌时间线占卜，展示过去-现在-未来'
            };
        }
        
        if (timePatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'time',
                name: '时间题',
                description: '询问时间相关的具体信息',
                icon: '⏰',
                readingMethod: '时间占卜，揭示时机和周期'
            };
        }
        
        if (reasonPatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'reason',
                name: '原因题',
                description: '探寻问题的根本原因',
                icon: '🔍',
                readingMethod: '因果占卜，分析原因和影响'
            };
        }
        
        if (comparisonPatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'comparison',
                name: '比较题',
                description: '比较不同选项或情况',
                icon: '⚖️',
                readingMethod: '对比占卜，分析各选项优劣'
            };
        }
        
        if (choicePatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'choice',
                name: '选择题',
                description: '在多个选项中选择最佳方案',
                icon: '🔀',
                readingMethod: '选择占卜，分析各选项的优劣'
            };
        }
        
        if (advicePatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'advice',
                name: '建议题',
                description: '寻求具体的行动建议和指导',
                icon: '💡',
                readingMethod: '指导占卜，提供具体的行动方案'
            };
        }
        
        if (predictionPatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'prediction',
                name: '预测题',
                description: '预测未来可能发生的情况',
                icon: '🔮',
                readingMethod: '预测占卜，揭示未来可能性'
            };
        }
        
        if (yesNoPatterns.some(pattern => pattern.test(lowerQuestion))) {
            return {
                type: 'yesno',
                name: '是非题',
                description: '寻求是或否的明确答案',
                icon: '❓',
                readingMethod: '单牌占卜，直接给出明确指引'
            };
        }
        
        // 默认分类
        return {
            type: 'general',
            name: '综合题',
            description: '综合性问题，需要全面分析',
            icon: '🌟',
            readingMethod: '综合占卜，多角度分析问题'
        };
    }

    // 显示问题类型
    displayQuestionType(questionType) {
        if (!this.questionTypeDisplay) {
            // 创建问题类型显示区域
            const typeDisplay = document.createElement('div');
            typeDisplay.id = 'questionTypeDisplay';
            typeDisplay.className = 'question-type-display';
            this.userQuestion.parentNode.insertBefore(typeDisplay, this.userQuestion.nextSibling);
            this.questionTypeDisplay = typeDisplay;
        }

        if (!questionType) {
            this.questionTypeDisplay.style.display = 'none';
            return;
        }

        this.questionTypeDisplay.innerHTML = `
            <div class="type-info">
                <span class="type-icon">${questionType.icon}</span>
                <span class="type-name">${questionType.name}</span>
                <span class="type-description">${questionType.description}</span>
            </div>
            <div class="reading-method">
                <small>推荐占卜方式：${questionType.readingMethod}</small>
            </div>
        `;
        this.questionTypeDisplay.style.display = 'block';
    }

    // 清空问题
    clearQuestion() {
        this.userQuestion.value = '';
        this.currentQuestion = '';
        this.selectedCategory = '';
        this.detectedQuestionType = null;
        
        // 移除所有分类按钮的active状态
        this.categoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // 隐藏问题类型显示
        this.displayQuestionType(null);

        // 重置占卜按钮状态
        this.startReadingBtn.disabled = true;
        this.startReadingBtn.style.opacity = '0.6';

        // 重置占卜按钮文本
        this.startReadingBtn.innerHTML = '开始占卜';
    }

    // 开始占卜
    async startReading() {
        if (!this.currentQuestion || this.isReading) {
            return;
        }

        this.isReading = true;
        this.startReadingBtn.innerHTML = '<span class="loading"></span> 正在占卜...';
        this.startReadingBtn.disabled = true;

        try {
            // 显示问题
            this.displayQuestion();
            
            // 显示塔罗牌区域
            this.showReadingSection();
            
            // 模拟占卜过程
            await this.performReading();
            
        } catch (error) {
            console.error('占卜过程中出现错误:', error);
            this.showError('占卜过程中出现错误，请重试。');
        } finally {
            this.isReading = false;
        }
    }

    // 显示用户问题
    displayQuestion() {
        let categoryInfo = '';
        if (this.selectedCategory) {
            categoryInfo += `<br><small>主题分类：${this.getCategoryName(this.selectedCategory)}</small>`;
        }
        if (this.detectedQuestionType) {
            categoryInfo += `<br><small>问题类型：${this.detectedQuestionType.icon} ${this.detectedQuestionType.name}</small>`;
        }
        
        this.questionDisplay.innerHTML = `
            <strong>你的问题：</strong><br>
            "${this.currentQuestion}"
            ${categoryInfo}
        `;
    }

    // 获取分类名称
    getCategoryName(category) {
        const names = {
            love: '感情',
            career: '事业',
            health: '健康',
            finance: '财运',
            family: '家庭',
            general: '综合'
        };
        return names[category] || '未分类';
    }

    // 显示占卜区域
    showReadingSection() {
        this.questionSection.style.display = 'none';
        this.readingSection.style.display = 'block';
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 执行占卜
    async performReading() {
        // 检查是否已配置AI服务
        const apiStatus = this.aiService.checkApiStatus();
        
        if (!apiStatus.hasApiKey && !this.useAIReading) {
            // 显示AI配置界面
            this.showAiConfig();
        } else {
            // 直接显示抽牌方式选择界面
            this.showDrawingMethodSelection();
        }
    }

    // 显示抽牌方式选择界面
    showDrawingMethodSelection() {
        this.drawingMethodSelection.style.display = 'block';
        this.cardSelectionArea.style.display = 'none';
    }

    // 根据选择的抽牌方式继续抽牌
    async proceedWithDrawing() {
        // 检查是否已选择抽牌方式
        if (!this.selectedDrawingMethod) {
            console.log('尚未选择抽牌方式，等待用户选择...');
            return;
        }
        
        let cardCount, positions, selectedCards = [];
        
        // 检查是否是补牌占卜
        if (this.isAdditionalReading) {
            cardCount = 1; // 补牌只抽一张
            positions = ['补充指引'];
        } else {
            cardCount = this.getCardCountByType();
            positions = this.getPositionsByType();
        }
        
        console.log('开始占卜过程，抽牌方式:', this.selectedDrawingMethod);
        console.log('需要抽取的牌数:', cardCount);
        console.log('牌的位置:', positions);
        console.log('是否补牌占卜:', this.isAdditionalReading);
        
        // 显示占卜过程开始
        this.showDivinationProcess();
        
        if (this.selectedDrawingMethod === 'mouse') {
            // 鼠标选择方式
            this.drawingMethodSelection.style.display = 'none';
            this.showCardSelection(cardCount, positions);
            selectedCards = await this.waitForUserCardSelection(cardCount, positions);
            console.log('用户选择的牌:', selectedCards);
            this.displaySelectedCards(selectedCards);
        } else if (this.selectedDrawingMethod === 'random') {
            // 随机抽取方式
            this.drawingMethodSelection.style.display = 'none';
            this.showRandomDrawingProcess(cardCount, positions);
            selectedCards = this.generateRandomCards(cardCount);
            console.log('随机抽取的牌:', selectedCards);
            this.displaySelectedCards(selectedCards);
        }
        
        // 显示解牌过程
        console.log('开始显示解牌过程');
        this.showCardInterpretationProcess(selectedCards);
        
        // 根据问题类型生成占卜结果
        console.log('开始生成占卜结果');
        console.log('useAIReading:', this.useAIReading);
        console.log('API状态:', this.aiService.checkApiStatus());
        console.log('用户问题:', this.currentQuestion);
        console.log('抽取的牌:', selectedCards);
        
        let reading;
        
        if (this.useAIReading && this.aiService.checkApiStatus().hasApiKey) {
            // 使用AI生成专业解牌
            try {
                console.log('使用AI生成专业解牌...');
                const aiReading = await this.aiService.generateProfessionalReading(
                    selectedCards, 
                    this.currentQuestion, 
                    this.selectedCategory, 
                    this.detectedQuestionType
                );
                console.log('AI解牌结果:', aiReading);
                reading = this.formatAIReading(aiReading, selectedCards);
            } catch (error) {
                console.error('AI解牌失败，使用备用解牌:', error);
                reading = this.generateReadingByType(selectedCards);
            }
        } else {
            // 使用传统解牌
            console.log('使用传统解牌方式');
            if (this.isAdditionalReading) {
                reading = this.generateAdditionalReadingResult(selectedCards);
            } else {
                reading = this.generateReadingByType(selectedCards);
            }
        }
        
        console.log('占卜结果生成完成');
        this.displayReadingResult(reading);
        
        // 重置补牌占卜标志
        this.isAdditionalReading = false;
        this.additionalReadingType = null;
    }

    // 显示占卜过程开始
    showDivinationProcess() {
        // 检查是否已经存在占卜过程容器
        let processDiv = document.querySelector('.divination-process');
        
        if (!processDiv) {
            processDiv = document.createElement('div');
            processDiv.className = 'divination-process';
            
            // 插入到占卜结果区域之前
            this.readingResult.parentNode.insertBefore(processDiv, this.readingResult);
            
            // 添加淡入动画
            processDiv.style.opacity = '0';
            processDiv.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                processDiv.style.transition = 'all 0.6s ease-out';
                processDiv.style.opacity = '1';
                processDiv.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // 检查是否已经有开始步骤，避免重复添加
        const existingSteps = processDiv.querySelectorAll('.process-step');
        const hasStartStep = Array.from(existingSteps).some(step => 
            step.textContent.includes('开始占卜仪式')
        );
        
        if (!hasStartStep) {
            processDiv.innerHTML = `
                <div class="process-step active">
                    <div class="step-icon">🔮</div>
                    <div class="step-text">开始占卜仪式...</div>
                </div>
            `;
        }
    }

    // 显示随机抽牌过程
    showRandomDrawingProcess(cardCount, positions) {
        const processDiv = document.querySelector('.divination-process');
        if (!processDiv) return;
        
        // 检查是否已经有抽牌步骤，避免重复添加
        const existingSteps = processDiv.querySelectorAll('.process-step');
        const hasDrawingStep = Array.from(existingSteps).some(step => 
            step.textContent.includes('正在随机抽取') || 
            step.textContent.includes('塔罗牌已选定')
        );
        
        if (hasDrawingStep) {
            console.log('抽牌步骤已存在，跳过重复添加');
            return;
        }
        
        processDiv.innerHTML += `
            <div class="process-step">
                <div class="step-icon">🎲</div>
                <div class="step-text">正在随机抽取 ${cardCount} 张牌...</div>
            </div>
        `;
        
        // 模拟抽牌过程
        setTimeout(() => {
            const steps = processDiv.querySelectorAll('.process-step');
            if (steps.length > 1) {
                steps[steps.length - 1].classList.add('active');
            }
        }, 500);
        
        setTimeout(() => {
            processDiv.innerHTML += `
                <div class="process-step">
                    <div class="step-icon">✨</div>
                    <div class="step-text">塔罗牌已选定，准备揭示...</div>
                </div>
            `;
            const steps = processDiv.querySelectorAll('.process-step');
            if (steps.length > 2) {
                steps[steps.length - 1].classList.add('active');
            }
        }, 1000);
    }

    // 显示解牌过程
    showCardInterpretationProcess(selectedCards) {
        const processDiv = document.querySelector('.divination-process');
        if (!processDiv) return;
        
        // 检查是否已经有解牌步骤，避免重复添加
        const existingSteps = processDiv.querySelectorAll('.process-step');
        const hasInterpretationStep = Array.from(existingSteps).some(step => 
            step.textContent.includes('正在解读牌面含义') || 
            step.textContent.includes('结合您的问题进行深度分析') ||
            step.textContent.includes('占卜结果即将揭晓')
        );
        
        if (hasInterpretationStep) {
            console.log('解牌步骤已存在，跳过重复添加');
            return;
        }
        
        setTimeout(() => {
            processDiv.innerHTML += `
                <div class="process-step">
                    <div class="step-icon">🔍</div>
                    <div class="step-text">正在解读牌面含义...</div>
                </div>
            `;
            const steps = processDiv.querySelectorAll('.process-step');
            if (steps.length > 2) {
                steps[steps.length - 1].classList.add('active');
            }
        }, 1500);
        
        setTimeout(() => {
            processDiv.innerHTML += `
                <div class="process-step">
                    <div class="step-icon">💫</div>
                    <div class="step-text">结合您的问题进行深度分析...</div>
                </div>
            `;
            const steps = processDiv.querySelectorAll('.process-step');
            if (steps.length > 3) {
                steps[steps.length - 1].classList.add('active');
            }
        }, 2000);
        
        setTimeout(() => {
            processDiv.innerHTML += `
                <div class="process-step">
                    <div class="step-icon">🌟</div>
                    <div class="step-text">占卜结果即将揭晓...</div>
                </div>
            `;
            const steps = processDiv.querySelectorAll('.process-step');
            if (steps.length > 4) {
                steps[steps.length - 1].classList.add('active');
            }
        }, 2500);
    }

    // 生成随机卡片
    generateRandomCards(cardCount) {
        const allCards = this.getAllTarotCards();
        const positions = this.getPositionsByType();
        const selectedCards = [];
        
        for (let i = 0; i < cardCount; i++) {
            const randomIndex = Math.floor(Math.random() * allCards.length);
            selectedCards.push({
                name: allCards[randomIndex],
                position: positions[i] || `位置${i + 1}`
            });
        }
        
        return selectedCards;
    }

    // 根据问题类型获取牌数
    getCardCountByType() {
        const questionType = this.detectedQuestionType?.type || 'general';
        switch (questionType) {
            case 'yesno': return 1;
            case 'choice':
            case 'comparison': return 2;
            case 'time':
            case 'reason':
            case 'trend':
            case 'advice':
            case 'prediction': return 3;
            case 'general':
                return this.currentQuestion.length > 20 ? 10 : 3;
            default: return 3;
        }
    }

    // 根据问题类型获取位置含义
    getPositionsByType() {
        const questionType = this.detectedQuestionType?.type || 'general';
        switch (questionType) {
            case 'yesno': return ['答案'];
            case 'choice':
            case 'comparison': return ['选项A', '选项B'];
            case 'time': return ['近期', '中期', '远期'];
            case 'reason': return ['表面原因', '深层原因', '根本原因'];
            case 'trend': return ['过去/起因', '现在/发展', '未来/趋势'];
            case 'advice': return ['现状分析', '行动建议', '预期结果'];
            case 'prediction': return ['当前状况', '可能发展', '最终结果'];
            case 'general':
                return this.currentQuestion.length > 20 ? 
                    ['现状', '挑战', '过去', '未来', '可能', '近期', '你的方法', '外界影响', '希望恐惧', '最终结果'] :
                    ['过去/原因', '现在/现状', '未来/结果'];
            default: return ['过去/原因', '现在/现状', '未来/结果'];
        }
    }

    // 显示牌选择界面
    showCardSelection(cardCount, positions) {
        this.cardSelectionArea.style.display = 'block';
        this.cardGrid.innerHTML = '';
        
        // 更新选择说明
        const instruction = document.querySelector('.selection-instruction');
        instruction.textContent = `请选择 ${cardCount} 张牌（${positions.join('、')}）`;
        
        // 获取所有塔罗牌
        const allCards = this.getAllTarotCards();
        
        // 将78张牌分成3排，每排26张牌
        const cardsPerRow = 26;
        const rows = [];
        
        for (let i = 0; i < allCards.length; i += cardsPerRow) {
            const rowCards = allCards.slice(i, i + cardsPerRow);
            rows.push(rowCards);
        }
        
        // 创建每一排
        rows.forEach((rowCards, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'card-row';
            
            // 显示这一排的所有牌，不限制数量
            rowCards.forEach((card, cardIndex) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'selectable-card';
                cardElement.dataset.cardIndex = rowIndex * cardsPerRow + cardIndex;
                cardElement.dataset.cardName = card;
                cardElement.title = `点击选择：${card}`;
                
                rowElement.appendChild(cardElement);
            });
            
            this.cardGrid.appendChild(rowElement);
        });
    }

    // 获取所有塔罗牌
    getAllTarotCards() {
        return [
            // 大阿卡纳牌（22张）
            '愚者', '魔术师', '女祭司', '皇后', '皇帝', '教皇', '恋人', '战车',
            '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔',
            '塔', '星星', '月亮', '太阳', '审判', '世界',
            // 小阿卡纳牌（56张）
            '权杖一', '权杖二', '权杖三', '权杖四', '权杖五', '权杖六', '权杖七', '权杖八', '权杖九', '权杖十',
            '权杖侍从', '权杖骑士', '权杖皇后', '权杖国王',
            '圣杯一', '圣杯二', '圣杯三', '圣杯四', '圣杯五', '圣杯六', '圣杯七', '圣杯八', '圣杯九', '圣杯十',
            '圣杯侍从', '圣杯骑士', '圣杯皇后', '圣杯国王',
            '宝剑一', '宝剑二', '宝剑三', '宝剑四', '宝剑五', '宝剑六', '宝剑七', '宝剑八', '宝剑九', '宝剑十',
            '宝剑侍从', '宝剑骑士', '宝剑皇后', '宝剑国王',
            '星币一', '星币二', '星币三', '星币四', '星币五', '星币六', '星币七', '星币八', '星币九', '星币十',
            '星币侍从', '星币骑士', '星币皇后', '星币国王'
        ];
    }

    // 等待用户选择牌
    async waitForUserCardSelection(cardCount, positions) {
        return new Promise((resolve) => {
            const selectedCards = [];
            const selectableCards = document.querySelectorAll('.selectable-card');
            
            selectableCards.forEach((cardElement) => {
                cardElement.addEventListener('click', () => {
                    if (cardElement.classList.contains('disabled')) return;
                    
                    const cardName = cardElement.dataset.cardName;
                    const cardIndex = selectedCards.length;
                    
                    if (selectedCards.length < cardCount) {
                        // 选择这张牌
                        cardElement.classList.add('selected');
                        cardElement.classList.add('disabled');
                        
                        selectedCards.push({
                            name: cardName,
                            index: cardElement.dataset.cardIndex,
                            position: positions[cardIndex],
                            positionIndex: cardIndex
                        });
                        
                        // 更新选择说明
                        const instruction = document.querySelector('.selection-instruction');
                        const remaining = cardCount - selectedCards.length;
                        if (remaining > 0) {
                            instruction.textContent = `已选择 ${selectedCards.length} 张，还需选择 ${remaining} 张牌`;
                        } else {
                            instruction.textContent = `已选择完成！正在生成占卜结果...`;
                            
                            // 禁用所有未选择的牌
                            selectableCards.forEach(card => {
                                if (!card.classList.contains('selected')) {
                                    card.classList.add('disabled');
                                }
                            });
                            
                            // 延迟一下让用户看到完成状态
                            setTimeout(() => {
                                this.cardSelectionArea.style.display = 'none';
                                resolve(selectedCards);
                            }, 1000);
                        }
                    }
                });
            });
        });
    }

    // 显示选中的牌
    displaySelectedCards(selectedCards) {
        this.tarotCards.innerHTML = '';
        
        selectedCards.forEach((card, index) => {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'tarot-card-container';
            
            const positionLabel = document.createElement('div');
            positionLabel.className = 'card-position';
            positionLabel.textContent = card.position;
            
            const cardElement = document.createElement('div');
            cardElement.className = 'tarot-card card-front';
            cardElement.dataset.cardIndex = index;
            cardElement.innerHTML = this.getCardDisplayContent(card.name);
            cardElement.title = `${card.position}：${card.name}`;
            
            cardContainer.appendChild(positionLabel);
            cardContainer.appendChild(cardElement);
            this.tarotCards.appendChild(cardContainer);
        });
    }

    // 获取牌的显示内容
    getCardDisplayContent(cardName) {
        // 这里可以根据牌名返回对应的图案或符号
        const cardSymbols = {
            // 大阿卡纳牌符号
            '愚者': '🃏', '魔术师': '🎩', '女祭司': '🌙', '皇后': '👑', '皇帝': '👨‍💼', '教皇': '⛪',
            '恋人': '💕', '战车': '🏛️', '力量': '💪', '隐者': '🔦', '命运之轮': '🎡', '正义': '⚖️',
            '倒吊人': '🙃', '死神': '💀', '节制': '🍷', '恶魔': '😈', '塔': '🗼', '星星': '⭐',
            '月亮': '🌙', '太阳': '☀️', '审判': '📯', '世界': '🌍',
            // 小阿卡纳牌符号
            '权杖一': '🪄', '权杖二': '🪄', '权杖三': '🪄', '权杖四': '🪄', '权杖五': '🪄',
            '权杖六': '🪄', '权杖七': '🪄', '权杖八': '🪄', '权杖九': '🪄', '权杖十': '🪄',
            '权杖侍从': '🪄', '权杖骑士': '🪄', '权杖皇后': '🪄', '权杖国王': '🪄',
            '圣杯一': '🏺', '圣杯二': '🏺', '圣杯三': '🏺', '圣杯四': '🏺', '圣杯五': '🏺',
            '圣杯六': '🏺', '圣杯七': '🏺', '圣杯八': '🏺', '圣杯九': '🏺', '圣杯十': '🏺',
            '圣杯侍从': '🏺', '圣杯骑士': '🏺', '圣杯皇后': '🏺', '圣杯国王': '🏺',
            '宝剑一': '⚔️', '宝剑二': '⚔️', '宝剑三': '⚔️', '宝剑四': '⚔️', '宝剑五': '⚔️',
            '宝剑六': '⚔️', '宝剑七': '⚔️', '宝剑八': '⚔️', '宝剑九': '⚔️', '宝剑十': '⚔️',
            '宝剑侍从': '⚔️', '宝剑骑士': '⚔️', '宝剑皇后': '⚔️', '宝剑国王': '⚔️',
            '星币一': '🪙', '星币二': '🪙', '星币三': '🪙', '星币四': '🪙', '星币五': '🪙',
            '星币六': '🪙', '星币七': '🪙', '星币八': '🪙', '星币九': '🪙', '星币十': '🪙',
            '星币侍从': '🪙', '星币骑士': '🪙', '星币皇后': '🪙', '星币国王': '🪙'
        };
        
        const symbol = cardSymbols[cardName] || '🔮';
        return `<div style="font-size: 2rem; margin-bottom: 5px;">${symbol}</div><div style="font-size: 0.7rem; font-weight: bold;">${cardName}</div>`;
    }

    // 根据问题类型生成塔罗牌
    generateTarotCardsByType() {
        // 完整的78张塔罗牌
        const allTarotCards = {
            // 大阿卡纳牌（22张）
            majorArcana: [
                '愚者', '魔术师', '女祭司', '皇后', '皇帝', '教皇', '恋人', '战车',
                '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔',
                '塔', '星星', '月亮', '太阳', '审判', '世界'
            ],
            // 小阿卡纳牌（56张）
            minorArcana: {
                // 权杖（火元素）- 行动力、激情、创造力
                wands: [
                    '权杖一', '权杖二', '权杖三', '权杖四', '权杖五', '权杖六', '权杖七', '权杖八', '权杖九', '权杖十',
                    '权杖侍从', '权杖骑士', '权杖皇后', '权杖国王'
                ],
                // 圣杯（水元素）- 情感、关系、直觉
                cups: [
                    '圣杯一', '圣杯二', '圣杯三', '圣杯四', '圣杯五', '圣杯六', '圣杯七', '圣杯八', '圣杯九', '圣杯十',
                    '圣杯侍从', '圣杯骑士', '圣杯皇后', '圣杯国王'
                ],
                // 宝剑（风元素）- 思维、决策、冲突
                swords: [
                    '宝剑一', '宝剑二', '宝剑三', '宝剑四', '宝剑五', '宝剑六', '宝剑七', '宝剑八', '宝剑九', '宝剑十',
                    '宝剑侍从', '宝剑骑士', '宝剑皇后', '宝剑国王'
                ],
                // 星币（土元素）- 物质、财富、健康
                pentacles: [
                    '星币一', '星币二', '星币三', '星币四', '星币五', '星币六', '星币七', '星币八', '星币九', '星币十',
                    '星币侍从', '星币骑士', '星币皇后', '星币国王'
                ]
            }
        };

        // 将所有牌合并为一个数组
        const allCards = [
            ...allTarotCards.majorArcana,
            ...allTarotCards.minorArcana.wands,
            ...allTarotCards.minorArcana.cups,
            ...allTarotCards.minorArcana.swords,
            ...allTarotCards.minorArcana.pentacles
        ];

        const questionType = this.detectedQuestionType?.type || 'general';
        let cardCount = 3; // 默认3张牌
        let positions = ['过去/原因', '现在/现状', '未来/结果'];
        let useComplexSpread = false; // 是否使用复杂牌阵

        // 根据问题类型调整牌数和位置含义
        switch (questionType) {
            case 'yesno':
                cardCount = 1;
                positions = ['答案'];
                break;
            case 'choice':
                cardCount = 2;
                positions = ['选项A', '选项B'];
                break;
            case 'comparison':
                cardCount = 2;
                positions = ['选项A', '选项B'];
                break;
            case 'time':
                cardCount = 3;
                positions = ['近期', '中期', '远期'];
                break;
            case 'reason':
                cardCount = 3;
                positions = ['表面原因', '深层原因', '根本原因'];
                break;
            case 'trend':
                cardCount = 3;
                positions = ['过去/起因', '现在/发展', '未来/趋势'];
                break;
            case 'advice':
                cardCount = 3;
                positions = ['现状分析', '行动建议', '预期结果'];
                break;
            case 'prediction':
                cardCount = 3;
                positions = ['当前状况', '可能发展', '最终结果'];
                break;
            case 'general':
                // 对于复杂问题，使用十字牌阵
                if (this.currentQuestion.length > 20) {
                    useComplexSpread = true;
                    cardCount = 10;
                    positions = [
                        '现状', '挑战', '过去', '未来', '可能', 
                        '近期', '你的方法', '外界影响', '希望恐惧', '最终结果'
                    ];
                } else {
                    cardCount = 3;
                    positions = ['过去/原因', '现在/现状', '未来/结果'];
                }
                break;
            default:
                cardCount = 3;
                positions = ['过去/原因', '现在/现状', '未来/结果'];
        }

        // 随机选择指定数量的牌
        const selectedCards = [];
        const usedIndices = new Set();
        
        while (selectedCards.length < cardCount) {
            const randomIndex = Math.floor(Math.random() * allCards.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                selectedCards.push({
                    name: allCards[randomIndex],
                    index: randomIndex,
                    position: positions[selectedCards.length],
                    positionIndex: selectedCards.length
                });
            }
        }

        return selectedCards;
    }

    // 显示塔罗牌
    displayTarotCards(cards) {
        this.tarotCards.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'tarot-card-container';
            
            const positionLabel = document.createElement('div');
            positionLabel.className = 'card-position';
            positionLabel.textContent = card.position;
            
            const cardElement = document.createElement('div');
            cardElement.className = 'tarot-card';
            cardElement.dataset.cardIndex = index;
            cardElement.innerHTML = '🔮';
            cardElement.title = `点击翻开${card.position}的牌`;
            
            cardContainer.appendChild(positionLabel);
            cardContainer.appendChild(cardElement);
            this.tarotCards.appendChild(cardContainer);
        });
    }

    // 等待用户选择卡片
    waitForCardSelection(cards) {
        return new Promise((resolve) => {
            const cardElements = document.querySelectorAll('.tarot-card');
            let flippedCount = 0;
            
            cardElements.forEach((cardElement, index) => {
                cardElement.addEventListener('click', () => {
                    if (!cardElement.classList.contains('flipped')) {
                        cardElement.classList.add('flipped');
                        cardElement.innerHTML = cards[index].name;
                        flippedCount++;
                        
                        if (flippedCount === cards.length) {
                            setTimeout(resolve, 1000); // 等待1秒后继续
                        }
                    }
                });
            });
        });
    }

    // 根据问题类型生成占卜结果
    generateReadingByType(cards) {
        const category = this.selectedCategory || 'general';
        const question = this.currentQuestion;
        const questionType = this.detectedQuestionType?.type || 'general';
        
        // 根据问题类型和卡片生成个性化的解读
        const reading = this.createPersonalizedReadingByType(cards, category, question, questionType);
        
        return reading;
    }

    // 根据问题类型创建个性化解读
    createPersonalizedReadingByType(cards, category, question, questionType) {
        const categoryName = this.getCategoryName(category);
        const spreadName = this.getSpreadName(questionType);
        
        let reading = `
            <div class="reading-header">
                <h2>🔮 <strong>塔罗牌占卜：${categoryName}分析</strong></h2>
                <p>我为您抽取了${cards.length}张牌，采用 <strong>「${spreadName}」</strong> 牌阵，为您解读${categoryName}的能量走向。</p>
            </div>
            
            <hr class="reading-divider">
            
            <div class="spread-results">
                <h3>### **牌阵结果**</h3>
        `;

        // 为每张牌生成专业的解读
        cards.forEach((card, index) => {
            const cardData = this.getProfessionalCardData(card.name, category, questionType);
            const positionMeaning = this.getPositionMeaning(card.position, questionType);
            
            reading += `
                <div class="card-professional-interpretation">
                    <h4>${index + 1}. <strong>${card.position} · ${card.name}${cardData.orientation}</strong></h4>
                    <div class="card-core-meaning">
                        <p><strong>核心含义</strong>：${cardData.coreMeaning}</p>
                    </div>
                    <div class="card-detailed-analysis">
                        <p>${cardData.detailedAnalysis}</p>
                    </div>
                    <div class="card-position-guidance">
                        <p><strong>提示</strong>：${positionMeaning}</p>
                    </div>
                </div>
            `;
        });

        // 添加整体解读与建议
        const overallAnalysis = this.getOverallAnalysis(cards, category, questionType);
        
        reading += `
            </div>
            
            <hr class="reading-divider">
            
            <div class="overall-analysis">
                <h3>### **整体解读与建议**</h3>
                <div class="energy-trend">
                    <p><strong>能量趋势</strong>：${overallAnalysis.energyTrend}</p>
                </div>
                <div class="key-advice">
                    <p><strong>关键建议</strong>：</p>
                    <ul>
                        ${overallAnalysis.keyAdvice.map(advice => `<li>${advice}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <hr class="reading-divider">
            
            <div class="reading-footer">
                <p>✨ 以上解读由AI生成，仅供娱乐参考。</p>
                <p><strong>记住：塔罗是映照内心的工具，真正的答案始终在你心中。</strong></p>
            </div>
        `;

        return reading;
    }

    // 获取牌阵名称
    getSpreadName(questionType) {
        const spreadNames = {
            yesno: '单牌指引',
            choice: '选择对比',
            comparison: '对比分析',
            time: '时间流',
            reason: '原因探索',
            trend: '过去-现在-未来',
            advice: '建议指引',
            prediction: '未来预测',
            general: '综合解读'
        };
        return spreadNames[questionType] || '综合解读';
    }

    // 获取专业的牌面数据
    getProfessionalCardData(cardName, category, questionType) {
        // 随机决定正位或逆位（50%概率）
        const isReversed = Math.random() < 0.5;
        const orientation = isReversed ? '（逆位）' : '（正位）';
        
        const cardData = this.getCardProfessionalMeanings(cardName, category, isReversed);
        
        return {
            orientation: orientation,
            coreMeaning: cardData.coreMeaning,
            detailedAnalysis: cardData.detailedAnalysis
        };
    }

    // 获取牌的专业含义
    getCardProfessionalMeanings(cardName, category, isReversed) {
        const cardMeanings = {
            '愚者': {
                upright: {
                    coreMeaning: '新的开始，冒险精神，纯真无畏的探索',
                    detailedAnalysis: '这张牌象征着生命的新篇章即将开启。在当前的处境中，它提醒你要保持开放的心态，勇敢地踏出第一步。不要被过去的经验束缚，相信自己的直觉，新的机遇就在前方等待着你。'
                },
                reversed: {
                    coreMeaning: '鲁莽冲动，缺乏计划，逃避责任',
                    detailedAnalysis: '逆位的愚者提醒你要谨慎行事，不要因为一时的冲动而做出草率的决定。现在是时候停下来思考，制定更周密的计划，避免因为缺乏准备而陷入困境。'
                }
            },
            '魔术师': {
                upright: {
                    coreMeaning: '创造力，意志力，技能，显化能力',
                    detailedAnalysis: '魔术师代表着你有实现目标所需的所有资源和技能。现在是展现你能力的时候，相信自己的力量，集中精力，运用你的技能和智慧，成功就在眼前。'
                },
                reversed: {
                    coreMeaning: '滥用权力，缺乏技能，欺骗',
                    detailedAnalysis: '逆位的魔术师提醒你要诚实地评估自己的能力，不要夸大或隐瞒事实。可能需要更多的学习和准备，或者重新审视你的方法和动机。'
                }
            },
            '女祭司': {
                upright: {
                    coreMeaning: '直觉，潜意识，神秘智慧，内在知识',
                    detailedAnalysis: '女祭司提醒你要相信自己的直觉和内在智慧。有时候沉默比言语更有力量，倾听内心的声音，答案会自然浮现。现在是内省和反思的时候。'
                },
                reversed: {
                    coreMeaning: '忽视直觉，缺乏内省，秘密泄露',
                    detailedAnalysis: '逆位的女祭司提醒你要重新连接自己的内在智慧，不要忽视直觉的指引。可能需要更多的内省和反思，或者注意保护自己的隐私。'
                }
            },
            '皇后': {
                upright: {
                    coreMeaning: '母性，丰盛，创造力，自然与生育力',
                    detailedAnalysis: '皇后代表着丰盛和创造力。在当前的处境中，它预示着收获和成长，提醒你要保持耐心和关爱，用温暖和智慧来滋养你关心的事物。'
                },
                reversed: {
                    coreMeaning: '过度依赖，缺乏自信，创造力受阻',
                    detailedAnalysis: '逆位的皇后提醒你要重新找回自己的自信和创造力，不要过度依赖他人。可能需要更多的自我关爱和独立，或者重新平衡给予和接受。'
                }
            },
            '皇帝': {
                upright: {
                    coreMeaning: '权威，稳定，领导力，秩序与控制',
                    detailedAnalysis: '皇帝代表着稳定和权威。在当前的处境中，它提醒你要建立秩序和结构，运用你的领导力来引导局势朝着正确的方向发展。'
                },
                reversed: {
                    coreMeaning: '专制，缺乏灵活性，滥用权力',
                    detailedAnalysis: '逆位的皇帝提醒你要保持灵活性，不要过于专制或固执。可能需要更多的合作和妥协，或者重新审视你的控制方式。'
                }
            },
            '恋人': {
                upright: {
                    coreMeaning: '爱情，选择，价值观的契合，和谐关系',
                    detailedAnalysis: '恋人牌预示着重要的选择即将到来。在当前的处境中，它提醒你要选择与你的价值观和内心真正契合的道路，无论是感情还是其他重要决定。'
                },
                reversed: {
                    coreMeaning: '关系失衡，错误选择，价值观冲突',
                    detailedAnalysis: '逆位的恋人提醒你要重新审视你的选择，可能存在价值观的冲突或关系的不平衡。需要更深入地了解自己的真实需求和对方的真实情况。'
                }
            },
            '正义': {
                upright: {
                    coreMeaning: '平衡，公正，真理，因果与责任',
                    detailedAnalysis: '正义牌提醒你要保持公正和平衡。在当前的处境中，它预示着真相即将揭露，提醒你要为自己的行为负责，相信因果循环。'
                },
                reversed: {
                    coreMeaning: '不公正，逃避责任，失衡',
                    detailedAnalysis: '逆位的正义提醒你要正视不公正的情况，不要逃避责任。可能需要重新平衡各种关系，或者勇敢地面对和纠正错误。'
                }
            },
            '死神': {
                upright: {
                    coreMeaning: '结束与重生，彻底转变，释放过去',
                    detailedAnalysis: '死神牌预示着重要的转变即将发生。在当前的处境中，它提醒你要勇敢地结束旧的阶段，为新的开始做好准备。转变虽然痛苦，但却是成长的必要过程。'
                },
                reversed: {
                    coreMeaning: '抗拒改变，停滞不前，恐惧转变',
                    detailedAnalysis: '逆位的死神提醒你要接受必要的改变，不要抗拒转变。可能需要勇敢地面对恐惧，或者主动地结束不再适合的情况。'
                }
            },
            '太阳': {
                upright: {
                    coreMeaning: '成功，活力，纯真与快乐，成就',
                    detailedAnalysis: '太阳牌预示着成功和快乐即将到来。在当前的处境中，它提醒你要保持积极的心态，享受当下的美好时光，你的努力将得到回报。'
                },
                reversed: {
                    coreMeaning: '过度乐观，缺乏现实感，延迟成功',
                    detailedAnalysis: '逆位的太阳提醒你要保持现实的态度，不要过度乐观。可能需要更多的耐心，或者重新调整你的期望和方法。'
                }
            },
            '星星': {
                upright: {
                    coreMeaning: '希望，疗愈，灵性指引，灵感',
                    detailedAnalysis: '星星牌代表着希望和疗愈。在当前的处境中，它提醒你要保持信心，相信美好的未来即将到来。保持开放的心态，接受灵性的指引。'
                },
                reversed: {
                    coreMeaning: '失去希望，缺乏信心，灵性迷失',
                    detailedAnalysis: '逆位的星星提醒你要重新找回希望和信心，不要被暂时的困难所击倒。可能需要更多的自我疗愈，或者重新连接你的灵性指引。'
                }
            }
        };

        const card = cardMeanings[cardName];
        if (card) {
            return isReversed ? card.reversed : card.upright;
        }
        
        // 默认含义
        return {
            coreMeaning: '这张牌在当前的处境中为你带来了重要的指引',
            detailedAnalysis: '请仔细思考牌面的含义，结合你的实际情况来理解这张牌想要传达的信息。相信你的直觉，它会引导你找到正确的方向。'
        };
    }

    // 获取位置含义
    getPositionMeaning(position, questionType) {
        const positionMeanings = {
            '过去/起因': '这代表了影响当前情况的过去因素。理解这些因素有助于你更好地处理现在的问题，避免重复过去的错误。',
            '现在/发展': '这反映了你当前的状况。要客观地看待现状，这是做出正确决定的基础，也是改变未来的起点。',
            '未来/趋势': '这预示了可能的发展方向。记住，未来是可以改变的，你的行动会影响最终结果，保持积极的态度。',
            '建议/指引': '这为你提供了具体的行动建议。按照这个指引去行动，会帮助你实现目标，但要结合实际情况灵活运用。',
            '挑战/障碍': '这指出了你可能面临的挑战。了解这些挑战，有助于你提前做好准备，将困难转化为成长的机会。',
            '结果/结局': '这预示了可能的结果。保持积极的心态，努力朝着好的方向发展，你的努力会得到回报。'
        };

        return positionMeanings[position] || '这个位置为你提供了重要的指引，请结合牌面的含义来理解。';
    }

    // 获取整体分析
    getOverallAnalysis(cards, category, questionType) {
        const categoryName = this.getCategoryName(category);
        
        // 根据牌的组合生成能量趋势分析
        const energyTrend = this.generateEnergyTrend(cards, category);
        
        // 生成关键建议
        const keyAdvice = this.generateKeyAdvice(cards, category, questionType);
        
        return {
            energyTrend: energyTrend,
            keyAdvice: keyAdvice
        };
    }

    // 生成能量趋势分析
    generateEnergyTrend(cards, category) {
        const categoryName = this.getCategoryName(category);
        const cardNames = cards.map(card => card.name);
        
        // 简单的能量趋势分析逻辑
        if (cardNames.includes('太阳') || cardNames.includes('星星')) {
            return `从当前的挑战中，${categoryName}正在朝向积极的方向发展。牌面显示希望和成功的能量正在聚集，预示着美好的转变即将到来。`;
        } else if (cardNames.includes('死神') || cardNames.includes('塔')) {
            return `${categoryName}正在经历重要的转变期。虽然可能面临一些挑战，但这是成长和更新的必要过程，最终会带来更好的结果。`;
        } else if (cardNames.includes('恋人') || cardNames.includes('圣杯二')) {
            return `${categoryName}的能量正在朝着和谐与平衡的方向发展。关系或选择方面可能出现积极的变化，需要保持开放和真诚的态度。`;
        } else {
            return `${categoryName}的能量正在稳定发展，需要保持耐心和坚持。当前的状况虽然可能不够理想，但通过持续的努力和正确的方向，会逐渐改善。`;
        }
    }

    // 生成关键建议
    generateKeyAdvice(cards, category, questionType) {
        const categoryName = this.getCategoryName(category);
        const advice = [];
        
        // 根据问题类型生成建议
        if (questionType === 'trend') {
            advice.push(`若处于${categoryName}关系中：用坦诚沟通替代旧有矛盾，避免翻旧账；`);
            advice.push(`若单身：近期可能遇到精神契合的对象，但需理性观察对方行动；`);
            advice.push(`通用：信任直觉，但不要让期待掩盖现实细节。`);
        } else if (questionType === 'choice') {
            advice.push(`仔细权衡各个选项的利弊，不要急于做决定；`);
            advice.push(`考虑长期影响，选择与你的价值观最符合的选项；`);
            advice.push(`相信自己的判断，但也要听取可信赖的人的建议。`);
        } else if (questionType === 'yesno') {
            advice.push(`根据牌面的指引，相信你的直觉判断；`);
            advice.push(`无论答案如何，都要积极面对结果；`);
            advice.push(`记住，是或否只是开始，重要的是你如何应对。`);
        } else {
            advice.push(`保持开放的心态，相信自己的直觉；`);
            advice.push(`将占卜结果作为参考，结合实际情况做出决定；`);
            advice.push(`记住，你的行动会影响最终的结果。`);
        }
        
        return advice;
    }

    // 获取详细的牌面含义
    getDetailedCardMeaning(cardName, category, questionType) {
        const detailedMeanings = {
            // 大阿卡纳牌详细含义
            '愚者': {
                love: '在感情中，这张牌提醒你要保持纯真的心，不要被过去的伤痛束缚。新的感情机会即将到来，要勇敢地接受。',
                career: '事业上，这是一个新的开始。不要害怕冒险，相信自己的直觉，新的机会正在等待你。',
                general: '生活即将迎来新的篇章。保持开放的心态，勇敢地踏出第一步，新的机遇就在前方。'
            },
            '魔术师': {
                love: '在感情中，你拥有创造美好关系的能力。主动表达你的感受，用你的魅力吸引对的人。',
                career: '事业上，你具备了成功所需的所有技能。现在是展现你能力的时候，相信自己的力量。',
                general: '你拥有实现目标的所有资源。集中精力，运用你的技能和智慧，成功就在眼前。'
            },
            '女祭司': {
                love: '在感情中，相信你的直觉。有时候沉默比言语更有力量，倾听内心的声音。',
                career: '事业上，需要更多的内省和思考。相信你的直觉，答案就在你的内心深处。',
                general: '现在是内省的时候。相信你的直觉和内在智慧，答案会自然浮现。'
            },
            '恋人': {
                love: '在感情中，这张牌预示着重要的选择。要选择真正与你价值观相符的人。',
                career: '事业上，你面临重要的选择。选择与你的价值观和长期目标一致的道路。',
                general: '生活中重要的选择即将到来。要选择与你的内心真正契合的道路。'
            },
            '死神': {
                love: '在感情中，旧的模式需要结束，为新的开始让路。放下过去，迎接新的可能性。',
                career: '事业上，旧的阶段即将结束。这是转变的时刻，新的机会即将出现。',
                general: '生活中重要的转变即将发生。结束旧的，为新的开始做好准备。'
            },
            '太阳': {
                love: '在感情中，快乐和成功即将到来。享受当下的美好时光，积极的态度会带来好运。',
                career: '事业上，成功和认可即将到来。保持积极的态度，你的努力将得到回报。',
                general: '生活中充满阳光和希望。保持积极的心态，美好的时光即将到来。'
            }
        };

        const cardDetail = detailedMeanings[cardName];
        if (cardDetail) {
            return cardDetail[category] || cardDetail.general || '这张牌在当前的处境中为你带来了重要的指引。';
        }
        
        return '这张牌在当前的处境中为你带来了重要的指引。请仔细思考牌面的含义，结合你的实际情况来理解。';
    }

    // 获取位置指引
    getPositionGuidance(position, questionType) {
        const positionGuidance = {
            '过去/起因': '这代表了影响当前情况的过去因素。理解这些因素有助于你更好地处理现在的问题。',
            '现在/发展': '这反映了你当前的状况。要客观地看待现状，这是做出正确决定的基础。',
            '未来/趋势': '这预示了可能的发展方向。记住，未来是可以改变的，你的行动会影响最终结果。',
            '建议/指引': '这为你提供了具体的行动建议。按照这个指引去行动，会帮助你实现目标。',
            '挑战/障碍': '这指出了你可能面临的挑战。了解这些挑战，有助于你提前做好准备。',
            '结果/结局': '这预示了可能的结果。保持积极的心态，努力朝着好的方向发展。'
        };

        return positionGuidance[position] || '这个位置为你提供了重要的指引。请结合牌面的含义来理解。';
    }

    // 根据问题类型获取指引
    getGuidanceByType(questionType, category) {
        const categoryName = this.getCategoryName(category);
        
        const guidanceByType = {
            yesno: `对于你的${categoryName}问题，塔罗牌给出了明确的指引。请相信这个答案，并按照牌面的指引去行动。记住，是或否的答案只是开始，更重要的是你如何应对这个结果。`,
            choice: `面对${categoryName}的选择，塔罗牌为你分析了各个选项的优劣。请仔细考虑每张牌的含义，结合你的实际情况做出最适合的决定。选择没有对错，只有适合与否。`,
            comparison: `对于${categoryName}的比较，塔罗牌为你展现了不同方面的对比。请仔细分析每张牌的含义，权衡利弊，做出明智的判断。`,
            time: `关于${categoryName}的时间问题，塔罗牌揭示了不同时间段的状况。请根据牌面的指引，合理安排时间，把握最佳时机。`,
            reason: `对于${categoryName}的原因分析，塔罗牌从不同层面为你揭示了问题的根源。理解这些原因，有助于你从根本上解决问题。`,
            trend: `关于${categoryName}的发展趋势，塔罗牌揭示了从过去到未来的完整脉络。理解这个发展过程，有助于你更好地把握现在，为未来做好准备。`,
            advice: `在${categoryName}方面，塔罗牌为你提供了具体的行动建议。请按照牌面的指引，制定切实可行的计划，并付诸行动。行动是改变现状的关键。`,
            prediction: `对于${categoryName}的未来预测，塔罗牌展现了可能的发展方向。请保持开放的心态，同时也要明白未来是可以改变的，你的行动会影响最终的结果。`,
            general: `关于你的${categoryName}问题，塔罗牌从多个角度为你提供了指引。请综合考虑所有信息，相信自己的直觉，勇敢地面对挑战。`
        };

        return guidanceByType[questionType] || guidanceByType.general;
    }

    // 显示占卜结果
    displayReadingResult(reading) {
        this.readingResult.innerHTML = reading;
        
        // 添加淡入动画
        this.readingResult.style.opacity = '0';
        this.readingResult.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.readingResult.style.transition = 'all 0.6s ease-out';
            this.readingResult.style.opacity = '1';
            this.readingResult.style.transform = 'translateY(0)';
            
            // 显示占卜后的建议和补牌选项
            this.showPostReadingOptions();
        }, 100);
    }

    // 显示占卜后的选项
    showPostReadingOptions() {
        const postReadingDiv = document.createElement('div');
        postReadingDiv.className = 'post-reading-options';
        postReadingDiv.innerHTML = `
            <div class="reading-summary">
                <h4>✨ 占卜完成</h4>
                <p>感谢您的信任！塔罗牌已经为您揭示了重要的指引。</p>
            </div>
            <div class="suggestions">
                <h5>💡 建议与提醒：</h5>
                <ul>
                    <li>请保持开放的心态，相信自己的直觉</li>
                    <li>将占卜结果作为参考，结合实际情况做出决定</li>
                    <li>记住，你的行动会影响最终的结果</li>
                </ul>
            </div>
            <div class="additional-options">
                <h5>🔮 是否需要进一步了解？</h5>
                <div class="option-buttons">
                    <button class="option-btn" id="additionalCard">补牌占卜</button>
                    <button class="option-btn" id="clarifyCard">澄清牌</button>
                    <button class="option-btn" id="newQuestion">新问题</button>
                </div>
            </div>
        `;
        
        this.readingResult.appendChild(postReadingDiv);
        
        // 绑定事件
        this.bindPostReadingEvents();
    }

    // 绑定占卜后的事件
    bindPostReadingEvents() {
        const additionalCardBtn = document.getElementById('additionalCard');
        const clarifyCardBtn = document.getElementById('clarifyCard');
        const newQuestionBtn = document.getElementById('newQuestion');
        
        if (additionalCardBtn) {
            additionalCardBtn.addEventListener('click', () => {
                this.performAdditionalReading();
            });
        }
        
        if (clarifyCardBtn) {
            clarifyCardBtn.addEventListener('click', () => {
                this.performClarifyReading();
            });
        }
        
        if (newQuestionBtn) {
            newQuestionBtn.addEventListener('click', () => {
                this.resetToQuestion();
            });
        }
    }

    // 补牌占卜
    async performAdditionalReading() {
        // 清理当前结果，准备进行补牌占卜
        this.readingResult.innerHTML = '';
        this.tarotCards.innerHTML = '';
        
        // 清理占卜过程容器
        const processDiv = document.querySelector('.divination-process');
        if (processDiv) {
            processDiv.remove();
        }
        
        // 重置抽牌方式选择
        this.selectedDrawingMethod = null;
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 显示抽牌方式选择
        this.showDrawingMethodSelection();
        
        // 设置补牌占卜标志
        this.isAdditionalReading = true;
        this.additionalReadingType = 'additional';
    }

    // 生成补牌占卜结果
    generateAdditionalReadingResult(selectedCards) {
        const card = selectedCards[0];
        const cardData = this.getProfessionalCardData(card.name, this.selectedCategory || 'general', 'general');
        
        const isClarify = this.additionalReadingType === 'clarify';
        const title = isClarify ? '澄清牌占卜：澄清指引' : '补牌占卜：补充指引';
        const description = isClarify ? '我为您抽取了1张牌，帮助澄清之前占卜中的模糊信息。' : '我为您抽取了1张牌，为您提供额外的指引和洞察。';
        
        let reading = `
            <div class="reading-header">
                <h2>🔮 <strong>${title}</strong></h2>
                <p>${description}</p>
            </div>
            
            <hr class="reading-divider">
            
            <div class="spread-results">
                <h3>### **${isClarify ? '澄清牌结果' : '补牌结果'}**</h3>
                
                <div class="card-professional-interpretation">
                    <h4>${isClarify ? '澄清指引' : '补充指引'} · ${card.name}${cardData.orientation}</h4>
                    <div class="card-core-meaning">
                        <p><strong>核心含义</strong>：${cardData.coreMeaning}</p>
                    </div>
                    <div class="card-detailed-analysis">
                        <p>${cardData.detailedAnalysis}</p>
                    </div>
                    <div class="card-position-guidance">
                        <p><strong>提示</strong>：${isClarify ? '这张澄清牌帮助澄清之前占卜中的模糊信息。' : '这张补牌为您提供了额外的指引。'}请结合之前的占卜结果，综合考虑所有信息，相信自己的直觉做出决定。</p>
                    </div>
                </div>
            </div>
            
            <hr class="reading-divider">
            
            <div class="overall-analysis">
                <h3>### **${isClarify ? '澄清牌指引' : '补牌指引'}**</h3>
                <div class="energy-trend">
                    <p><strong>${isClarify ? '澄清信息' : '补充信息'}</strong>：${isClarify ? '这张牌帮助澄清您之前占卜中的模糊信息，为您提供更清晰的方向。' : '这张牌为您的' + this.getCategoryName(this.selectedCategory || 'general') + '问题提供了额外的视角。它可能揭示了之前没有注意到的重要信息，或者为您的决定提供了新的思路。'}</p>
                </div>
                <div class="key-advice">
                    <p><strong>关键建议</strong>：</p>
                    <ul>
                        ${isClarify ? 
                            '<li>将这张澄清牌的信息与之前的占卜结果结合考虑；</li><li>注意澄清牌可能揭示的隐藏信息或新的角度；</li><li>相信自己的直觉，但也要保持理性思考；</li><li>记住，澄清牌是对原有占卜的澄清，不是替代。</li>' :
                            '<li>将这张补牌的信息与之前的占卜结果结合考虑；</li><li>注意补牌可能揭示的新角度或隐藏信息；</li><li>相信自己的直觉，但也要保持理性思考；</li><li>记住，补牌是对原有占卜的补充，不是替代。</li>'
                        }
                    </ul>
                </div>
            </div>
            
            <hr class="reading-divider">
            
            <div class="reading-footer">
                <p>✨ 以上解读由AI生成，仅供娱乐参考。</p>
                <p><strong>记住：塔罗是映照内心的工具，真正的答案始终在你心中。</strong></p>
            </div>
        `;

        return reading;
    }

    // 抽取补牌
    drawAdditionalCard() {
        const allCards = [
            '愚者', '魔术师', '女祭司', '皇后', '皇帝', '教皇', '恋人', '战车',
            '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔',
            '塔', '星星', '月亮', '太阳', '审判', '世界',
            '权杖一', '权杖二', '权杖三', '权杖四', '权杖五', '权杖六', '权杖七', '权杖八', '权杖九', '权杖十',
            '权杖侍从', '权杖骑士', '权杖皇后', '权杖国王',
            '圣杯一', '圣杯二', '圣杯三', '圣杯四', '圣杯五', '圣杯六', '圣杯七', '圣杯八', '圣杯九', '圣杯十',
            '圣杯侍从', '圣杯骑士', '圣杯皇后', '圣杯国王',
            '宝剑一', '宝剑二', '宝剑三', '宝剑四', '宝剑五', '宝剑六', '宝剑七', '宝剑八', '宝剑九', '宝剑十',
            '宝剑侍从', '宝剑骑士', '宝剑皇后', '宝剑国王',
            '星币一', '星币二', '星币三', '星币四', '星币五', '星币六', '星币七', '星币八', '星币九', '星币十',
            '星币侍从', '星币骑士', '星币皇后', '星币国王'
        ];
        
        const randomIndex = Math.floor(Math.random() * allCards.length);
        return {
            name: allCards[randomIndex],
            index: randomIndex
        };
    }

    // 生成补牌解读
    generateAdditionalReading(card) {
        const cardMeanings = {
            '愚者': '新的开始，冒险精神，纯真，无畏的探索',
            '魔术师': '创造力，意志力，技能，显化能力',
            '女祭司': '直觉，潜意识，神秘智慧，内在知识',
            '皇后': '母性，丰盛，创造力，自然与生育力',
            '皇帝': '权威，稳定，领导力，秩序与控制',
            '教皇': '传统，精神指导，学习，制度与道德',
            '恋人': '爱情，选择，价值观的契合，和谐关系',
            '战车': '意志力，胜利，自我控制，决心',
            '力量': '内在力量，勇气，耐心与慈悲，柔克刚',
            '隐者': '内省，孤独，寻求真理，精神指引',
            '命运之轮': '变化，命运，周期循环，接受无常',
            '正义': '平衡，公正，真理，因果与责任',
            '倒吊人': '牺牲，换位思考，暂停，新视角',
            '死神': '结束与重生，彻底转变，释放过去',
            '节制': '调和，中庸，融合对立面，平衡',
            '恶魔': '欲望束缚，物质沉迷，恐惧，诱惑',
            '塔': '剧变，崩塌，真相揭露，突然变化',
            '星星': '希望，疗愈，灵性指引，灵感',
            '月亮': '潜意识，幻觉，恐惧与迷茫，直觉',
            '太阳': '成功，活力，纯真与快乐，成就',
            '审判': '觉醒，重生，使命召唤，宽恕',
            '世界': '圆满，整合，旅程完成，成功'
        };
        
        return cardMeanings[card.name] || '这张牌为你提供了额外的指引和启示。';
    }

    // 澄清牌占卜
    async performClarifyReading() {
        // 清理当前结果，准备进行澄清牌占卜
        this.readingResult.innerHTML = '';
        this.tarotCards.innerHTML = '';
        
        // 清理占卜过程容器
        const processDiv = document.querySelector('.divination-process');
        if (processDiv) {
            processDiv.remove();
        }
        
        // 重置抽牌方式选择
        this.selectedDrawingMethod = null;
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 显示抽牌方式选择
        this.showDrawingMethodSelection();
        
        // 设置澄清牌占卜标志
        this.isAdditionalReading = true;
        this.additionalReadingType = 'clarify';
    }

    // 生成澄清牌解读
    generateClarifyReading(card) {
        const clarifyMeanings = {
            '愚者': '保持纯真的心态，勇敢地迈出第一步',
            '魔术师': '运用你的技能和资源，创造你想要的结果',
            '女祭司': '相信你的直觉，倾听内心的声音',
            '皇后': '展现你的创造力，享受丰盛的生活',
            '皇帝': '建立秩序，承担责任，展现领导力',
            '教皇': '寻求传统智慧，遵循道德准则',
            '恋人': '在关系中保持真诚，做出明智的选择',
            '战车': '保持决心，克服障碍，追求胜利',
            '力量': '用温柔的力量克服困难，保持耐心',
            '隐者': '进行内省，寻求内在的智慧',
            '命运之轮': '接受变化，相信命运的安排',
            '正义': '保持公正，承担应有的责任',
            '倒吊人': '换个角度看问题，接受必要的牺牲',
            '死神': '结束旧的事物，迎接新的开始',
            '节制': '保持平衡，调和不同的力量',
            '恶魔': '识别并摆脱束缚，获得自由',
            '塔': '接受突然的变化，重建新的基础',
            '星星': '保持希望，相信美好的未来',
            '月亮': '面对恐惧，相信直觉的指引',
            '太阳': '享受成功，保持积极的心态',
            '审判': '接受觉醒，迎接新的使命',
            '世界': '庆祝完成，准备新的旅程'
        };
        
        return clarifyMeanings[card.name] || '这张牌为你澄清了重要的信息，请仔细思考其含义。';
    }

    // 显示错误信息
    showError(message) {
        this.readingResult.innerHTML = `
            <h3>❌ 出现错误</h3>
            <p>${message}</p>
        `;
    }

    // 重置到问题输入
    resetToQuestion() {
        this.readingSection.style.display = 'none';
        this.questionSection.style.display = 'block';
        
        // 重置状态
        this.isReading = false;
        this.detectedQuestionType = null;
        this.startReadingBtn.innerHTML = '开始占卜';
        this.startReadingBtn.disabled = true;
        this.startReadingBtn.style.opacity = '0.6';
        
        // 清空结果和占卜过程
        this.readingResult.innerHTML = '';
        this.tarotCards.innerHTML = '';
        this.cardSelectionArea.style.display = 'none';
        this.cardGrid.innerHTML = '';
        this.drawingMethodSelection.style.display = 'none';
        this.selectedDrawingMethod = null;
        this.displayQuestionType(null);
        
        // 清理占卜过程容器
        const processDiv = document.querySelector('.divination-process');
        if (processDiv) {
            processDiv.remove();
        }
        
        // 重置抽牌方式选择按钮
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // AI配置相关方法
    showAiConfig() {
        this.aiConfigSection.style.display = 'block';
        this.drawingMethodSelection.style.display = 'none';
        this.cardSelectionArea.style.display = 'none';
    }

    saveApiConfig() {
        const provider = this.aiProviderSelect.value;
        const apiKey = this.apiKeyInput.value.trim();

        if (!apiKey) {
            this.showApiStatus('请输入API密钥', 'error');
            return;
        }

        // 保存到本地存储
        localStorage.setItem('tarot_ai_config', JSON.stringify({
            provider: provider,
            apiKey: apiKey
        }));

        // 配置AI服务
        this.aiService.setApiConfig(provider, apiKey);
        this.useAIReading = true;

        this.showApiStatus('API配置已保存', 'success');
        
        // 延迟后显示抽牌方式选择
        setTimeout(() => {
            this.showDrawingMethodSelection();
        }, 1500);
    }

    async testApiConnection() {
        const provider = this.aiProviderSelect.value;
        const apiKey = this.apiKeyInput.value.trim();

        if (!apiKey) {
            this.showApiStatus('请输入API密钥', 'error');
            return;
        }

        this.showApiStatus('正在测试连接...', 'loading');

        try {
            // 临时配置AI服务进行测试
            this.aiService.setApiConfig(provider, apiKey);
            
            // 发送测试请求
            const testPrompt = "请回复'连接成功'来确认API连接正常。";
            const response = await this.aiService.callAI(testPrompt);
            
            if (response && response.includes('连接成功')) {
                this.showApiStatus('API连接测试成功！', 'success');
            } else {
                this.showApiStatus('API连接测试失败，请检查密钥', 'error');
            }
        } catch (error) {
            this.showApiStatus(`连接测试失败: ${error.message}`, 'error');
        }
    }

    skipAiConfig() {
        this.useAIReading = false;
        this.showDrawingMethodSelection();
    }

    showApiStatus(message, type) {
        this.apiStatus.textContent = message;
        this.apiStatus.className = `api-status ${type}`;
        
        // 3秒后隐藏状态信息
        setTimeout(() => {
            this.apiStatus.className = 'api-status';
        }, 3000);
    }

    loadApiConfig() {
        try {
            // 首先检查代码中是否已经配置了API密钥
            const apiStatus = this.aiService.checkApiStatus();
            if (apiStatus.hasApiKey) {
                console.log('检测到代码中已配置的API密钥，启用AI解牌');
                this.useAIReading = true;
                return;
            }
            
            // 然后检查localStorage中的配置
            const savedConfig = localStorage.getItem('tarot_ai_config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.aiService.setApiConfig(config.provider, config.apiKey);
                this.useAIReading = true;
                
                // 更新UI
                if (this.aiProviderSelect) {
                    this.aiProviderSelect.value = config.provider;
                }
                if (this.apiKeyInput) {
                    this.apiKeyInput.value = config.apiKey;
                }
            }
        } catch (error) {
            console.error('加载API配置失败:', error);
        }
    }

    // 格式化AI解牌结果
    formatAIReading(aiReading, selectedCards) {
        const categoryName = this.getCategoryName(this.selectedCategory || 'general');
        const spreadName = this.getSpreadName(this.detectedQuestionType || 'general');
        
        return `
            <div class="reading-header">
                <h2>🔮 <strong>AI专业塔罗牌占卜：${categoryName}分析</strong></h2>
                <p>我为您抽取了${selectedCards.length}张牌，采用 <strong>「${spreadName}」</strong> 牌阵，结合AI深度分析为您解读${categoryName}的能量走向。</p>
            </div>
            
            <hr class="reading-divider">
            
            <div class="ai-reading-result">
                <h4>🤖 AI专业解牌分析</h4>
                ${aiReading}
            </div>
            
            <hr class="reading-divider">
            
            <div class="spread-results">
                <h3>### **抽取的牌**</h3>
                ${selectedCards.map((card, index) => `
                    <div class="card-professional-interpretation">
                        <h4>${index + 1}. <strong>${card.position} · ${card.name}${card.orientation || ''}</strong></h4>
                        <p>这张牌在${card.position}位置为您的问题提供了重要指引。</p>
                    </div>
                `).join('')}
            </div>
            
            <hr class="reading-divider">
            
            <div class="reading-footer">
                <p>✨ 以上解读由AI生成，结合了传统塔罗智慧和现代AI分析。</p>
                <p><strong>记住：塔罗是映照内心的工具，真正的答案始终在你心中。</strong></p>
            </div>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new TarotAssistant();
    
    // 添加一些交互提示
    console.log('🔮 AI塔罗牌助手已启动！');
    console.log('请诚实地提出你的问题，让塔罗牌为你指引方向。');
});
