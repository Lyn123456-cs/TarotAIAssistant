/**
 * AI塔罗牌解牌服务 - 公开版本
 * 支持多种AI API进行专业解牌分析
 */
class AITarotService {
    constructor() {
        this.apiConfig = {
            // OpenAI ChatGPT API配置
            openai: {
                baseUrl: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-4',
                apiKey: '', // 用户需要自己配置API Key
            },
            // 默认使用OpenAI ChatGPT
            defaultProvider: 'openai'
        };
        
        this.currentProvider = this.apiConfig.defaultProvider;
    }

    /**
     * 设置API配置
     * @param {string} provider - API提供商 ('openai')
     * @param {string} apiKey - API密钥
     */
    setApiConfig(provider, apiKey) {
        if (this.apiConfig[provider]) {
            this.apiConfig[provider].apiKey = apiKey;
            this.currentProvider = provider;
            console.log(`已设置${provider} API配置`);
        } else {
            console.error('不支持的API提供商:', provider);
        }
    }

    /**
     * 生成专业的塔罗牌解牌分析
     * @param {Array} cards - 抽取的塔罗牌数组
     * @param {string} question - 用户的问题
     * @param {string} category - 问题分类
     * @param {string} questionType - 问题类型
     * @returns {Promise<string>} - AI生成的解牌分析
     */
    async generateProfessionalReading(cards, question, category, questionType) {
        try {
            const prompt = this.buildTarotPrompt(cards, question, category, questionType);
            const response = await this.callAI(prompt);
            return this.formatResponse(response);
        } catch (error) {
            console.error('AI解牌分析失败:', error);
            return this.getFallbackReading(cards, category, questionType);
        }
    }

    /**
     * 构建塔罗牌解牌提示词
     */
    buildTarotPrompt(cards, question, category, questionType) {
        const categoryName = this.getCategoryName(category);
        const spreadName = this.getSpreadName(questionType);
        
        // 根据问题类型构建针对性的分析框架
        const analysisFramework = this.getAnalysisFramework(questionType, category);
        
        let prompt = `你是一位资深的塔罗牌占卜师，拥有20年的解牌经验。请为以下塔罗牌占卜提供专业、深入且针对性极强的分析：

**🔮 占卜信息：**
- 用户问题：「${question}」
- 问题分类：${categoryName}
- 牌阵类型：${spreadName}
- 抽取牌数：${cards.length}张

**🃏 抽取的牌：**
`;

        cards.forEach((card, index) => {
            prompt += `${index + 1}. ${card.position} - ${card.name}${card.orientation || ''}\n`;
        });

        prompt += `
**📋 请严格按照以下结构进行针对性分析：**

## 🎯 **直接回答用户问题**
首先，基于牌面直接回答用户的核心问题「${question}」，给出明确的答案或方向。

## 🔍 **问题深度解析**
${analysisFramework.depthAnalysis}

## 🃏 **牌面专业解读**
${analysisFramework.cardAnalysis}

## ⚡ **关键信息提取**
${analysisFramework.keyInfo}

## 💡 **具体行动建议**
${analysisFramework.actionAdvice}

## ⏰ **时间线预测**
${analysisFramework.timeline}

## ⚠️ **重要提醒**
${analysisFramework.warnings}

**🎯 核心要求：**
- **必须直接回答用户问题**：不能回避，要给出明确的答案或概率评估
- **结合具体问题**：每一点分析都要与「${question}」直接相关
- **提供概率评估**：对于预测类问题，给出可能性百分比
- **具体可操作**：建议要具体、可执行，不能泛泛而谈
- **专业且易懂**：使用塔罗专业术语，但解释要通俗易懂
- **字数控制**：1000-1500字，确保内容充实且针对性强

请开始你的专业解牌分析：`;

        return prompt;
    }

    /**
     * 根据问题类型和分类获取分析框架
     */
    getAnalysisFramework(questionType, category) {
        const frameworks = {
            // 是非题
            'yesno': {
                depthAnalysis: '分析问题的核心矛盾点，牌面如何指向"是"或"否"的答案，以及影响判断的关键因素。',
                cardAnalysis: '重点解读每张牌如何支持或反对"是"的答案，给出明确的倾向性判断。',
                keyInfo: '提取最关键的"是/否"信号，分析支持这个答案的证据强度。',
                actionAdvice: '基于"是/否"的答案，给出具体的应对策略和行动方案。',
                timeline: '预测这个"是/否"答案在什么时间范围内会得到验证。',
                warnings: '指出可能影响判断准确性的因素，以及需要注意的变数。'
            },
            // 选择题
            'choice': {
                depthAnalysis: '分析每个选项的优劣，牌面如何指向最佳选择，以及选择后的可能结果。',
                cardAnalysis: '解读每张牌代表不同选项的能量，比较各选项的牌面支持度。',
                keyInfo: '提取选择的关键决策因素，分析哪个选项最符合牌面指引。',
                actionAdvice: '基于最佳选择，给出具体的执行步骤和注意事项。',
                timeline: '预测选择后不同阶段的发展情况。',
                warnings: '指出每个选择可能面临的风险和挑战。'
            },
            // 趋势题
            'trend': {
                depthAnalysis: '分析问题领域的发展趋势，牌面如何揭示未来的走向和变化。',
                cardAnalysis: '解读每张牌代表不同时间段的趋势变化，分析发展的关键节点。',
                keyInfo: '提取趋势发展的关键转折点和重要时机。',
                actionAdvice: '基于趋势预测，给出顺势而为或逆势调整的具体建议。',
                timeline: '详细预测短期、中期、长期的发展趋势和时间节点。',
                warnings: '指出可能改变趋势的关键因素和风险点。'
            },
            // 预测题
            'prediction': {
                depthAnalysis: '分析未来可能发生的情况，牌面如何揭示各种可能性。',
                cardAnalysis: '解读每张牌代表不同时间段的预测信息，分析概率分布。',
                keyInfo: '提取最可能发生的情况，给出概率评估（如70%可能性）。',
                actionAdvice: '基于预测结果，给出准备和应对的具体措施。',
                timeline: '详细预测不同时间段的可能事件和发展。',
                warnings: '指出可能影响预测准确性的变数和不确定性。'
            },
            // 建议题
            'advice': {
                depthAnalysis: '分析当前状况的核心问题，牌面如何指引最佳的解决方向。',
                cardAnalysis: '解读每张牌提供的不同建议角度，分析建议的优先级。',
                keyInfo: '提取最关键的指导信息，分析建议的可行性和效果。',
                actionAdvice: '基于牌面指引，给出具体的行动步骤和实施方案。',
                timeline: '预测按照建议行动后的效果时间表。',
                warnings: '指出实施建议时可能遇到的困难和注意事项。'
            },
            // 原因题
            'reason': {
                depthAnalysis: '分析问题的根本原因，牌面如何揭示深层的因果联系。',
                cardAnalysis: '解读每张牌代表不同层面的原因，分析原因的重要程度。',
                keyInfo: '提取最核心的根本原因，分析原因之间的关联性。',
                actionAdvice: '基于原因分析，给出针对性的解决方案和预防措施。',
                timeline: '预测解决根本原因需要的时间和步骤。',
                warnings: '指出可能被忽视的隐藏原因和潜在风险。'
            },
            // 时间题
            'time': {
                depthAnalysis: '分析时间相关的关键信息，牌面如何揭示最佳时机。',
                cardAnalysis: '解读每张牌代表不同时间段的能量，分析时间的重要性。',
                keyInfo: '提取最关键的时间节点，分析时机选择的紧迫性。',
                actionAdvice: '基于时间分析，给出具体的时机把握和行动安排。',
                timeline: '详细预测不同时间段的可能发展和关键节点。',
                warnings: '指出可能影响时机判断的因素和时间风险。'
            },
            // 比较题
            'comparison': {
                depthAnalysis: '分析比较对象的特点，牌面如何揭示各自的优劣。',
                cardAnalysis: '解读每张牌代表不同比较维度的信息，分析对比结果。',
                keyInfo: '提取最关键的比较因素，分析哪个选项更具优势。',
                actionAdvice: '基于比较结果，给出选择建议和后续行动方案。',
                timeline: '预测不同选择后的发展时间线。',
                warnings: '指出比较中可能被忽视的因素和潜在问题。'
            },
            // 综合题
            'comprehensive': {
                depthAnalysis: '全面分析问题的各个方面，牌面如何揭示复杂的关联性。',
                cardAnalysis: '解读每张牌代表不同层面的信息，分析整体的平衡性。',
                keyInfo: '提取最核心的综合信息，分析各要素的协调性。',
                actionAdvice: '基于综合分析，给出全面的解决方案和长期规划。',
                timeline: '预测综合发展的各个阶段和关键里程碑。',
                warnings: '指出可能影响整体发展的关键因素和系统性风险。'
            }
        };

        return frameworks[questionType] || frameworks['comprehensive'];
    }

    /**
     * 调用AI API
     */
    async callAI(prompt) {
        const config = this.apiConfig[this.currentProvider];
        
        if (!config.apiKey) {
            throw new Error(`请先配置${this.currentProvider}的API密钥`);
        }

        const requestBody = {
            model: config.model,
            messages: [
                {
                    role: "system",
                    content: `你是一位资深的塔罗牌占卜师，拥有20年的解牌经验。你的核心任务是：

1. **直接回答用户问题** - 不能回避，必须给出明确的答案或方向
2. **提供概率评估** - 对于预测类问题，给出具体的可能性百分比
3. **结合具体问题** - 每一点分析都要与用户的具体问题直接相关
4. **给出具体建议** - 提供可操作、可执行的行动方案
5. **保持专业准确** - 使用塔罗专业术语，但解释要通俗易懂

记住：用户来占卜是为了得到明确的指引，不是听泛泛而谈的通用解读。你必须针对用户的具体问题给出针对性的答案。`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2500
        };

        const response = await fetch(config.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (this.currentProvider === 'openai') {
            return data.choices[0].message.content;
        }
        
        throw new Error('未知的API响应格式');
    }

    /**
     * 格式化AI响应
     */
    formatResponse(response) {
        // 将AI响应格式化为HTML
        let formattedResponse = response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        return `<p>${formattedResponse}</p>`;
    }

    /**
     * 获取分类名称
     */
    getCategoryName(category) {
        const categoryNames = {
            'love': '感情',
            'career': '事业',
            'health': '健康',
            'finance': '财运',
            'family': '家庭',
            'study': '学业',
            'friendship': '友情',
            'travel': '出行',
            'decision': '决策',
            'spiritual': '心灵',
            'general': '综合'
        };
        return categoryNames[category] || '综合';
    }

    /**
     * 获取牌阵名称
     */
    getSpreadName(questionType) {
        const spreadNames = {
            'yesno': '是非牌阵',
            'trend': '过去-现在-未来',
            'direction': '十字牌阵',
            'general': '单牌指引'
        };
        return spreadNames[questionType] || '综合牌阵';
    }

    /**
     * 获取备用解牌（当AI API不可用时）
     */
    getFallbackReading(cards, category, questionType) {
        return `
            <div class="ai-reading-fallback">
                <h4>🔮 专业解牌分析</h4>
                <p><strong>注意：</strong>AI解牌服务暂时不可用，以下是基础解牌分析。</p>
                <p>您抽取的${cards.length}张牌为您的问题提供了重要指引。每张牌都有其独特的能量和含义，它们共同构成了对您当前情况的全面解读。</p>
                <p>建议您结合自己的直觉和实际情况，仔细思考每张牌所传达的信息。塔罗牌是映照内心的工具，真正的答案始终在您心中。</p>
                <p><em>如需更专业的AI解牌分析，请配置您的OpenAI API密钥。</em></p>
            </div>
        `;
    }

    /**
     * 检查API配置状态
     */
    checkApiStatus() {
        const config = this.apiConfig[this.currentProvider];
        return {
            provider: this.currentProvider,
            hasApiKey: !!config.apiKey,
            model: config.model
        };
    }
}

// 导出服务类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AITarotService;
} else {
    window.AITarotService = AITarotService;
}
