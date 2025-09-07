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
        
        let prompt = `你是一位资深的塔罗牌占卜师，拥有20年的解牌经验。请为以下塔罗牌占卜提供专业、深入的分析：

**占卜信息：**
- 问题：${question}
- 分类：${categoryName}
- 牌阵：${spreadName}
- 抽取牌数：${cards.length}张

**抽取的牌：**
`;

        cards.forEach((card, index) => {
            prompt += `${index + 1}. ${card.position} - ${card.name}${card.orientation || ''}\n`;
        });

        prompt += `
**请提供以下专业分析：**

1. **整体能量解读**：分析这组牌的整体能量走向和主题
2. **逐牌深度解析**：为每张牌提供专业的正位/逆位含义解读
3. **牌阵关系分析**：分析牌与牌之间的相互关系和影响
4. **具体建议指导**：基于牌面给出具体可行的建议
5. **时间线预测**：如果适用，提供时间线预测
6. **注意事项**：指出需要特别注意的方面

**要求：**
- 使用专业塔罗术语，但保持通俗易懂
- 结合用户的具体问题和分类
- 提供实用、具体的建议
- 保持积极正面的态度，但也要诚实面对挑战
- 字数控制在800-1200字之间
- 使用中文回复

请开始你的专业解牌分析：`;

        return prompt;
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
                    content: "你是一位资深的塔罗牌占卜师，拥有丰富的解牌经验和深厚的塔罗知识。请用专业、温暖、富有洞察力的语言为用户提供塔罗牌解读。"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
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
