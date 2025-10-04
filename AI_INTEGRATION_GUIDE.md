# AI Chat 接入实现方案

## 📋 概述

本文档提供完整的 AI Chat 功能接入方案，包括前后端实现、数据库设计、AI 服务集成等。

---

## 🏗️ 技术架构

```
前端 (Vue3)
    ↓ HTTP/WebSocket
后端 (Node.js/Java/Python)
    ↓
AI 服务 (OpenAI/Azure/本地模型)
    ↓
数据库 (MySQL/PostgreSQL/MongoDB)
```

---

## 📊 数据库设计

### 表结构设计

#### 1. conversations 表（对话表）
```sql
CREATE TABLE conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(255) DEFAULT '新对话' COMMENT '对话标题',
    preview TEXT COMMENT '对话预览（最后一条消息）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT '软删除时间',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话表';
```

#### 2. messages 表（消息表）
```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL COMMENT '对话ID',
    role ENUM('user', 'ai', 'system') NOT NULL COMMENT '角色',
    content TEXT NOT NULL COMMENT '消息内容',
    tokens INT DEFAULT 0 COMMENT 'token消耗数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI消息表';
```

#### 3. ai_usage_logs 表（使用统计表，可选）
```sql
CREATE TABLE ai_usage_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    conversation_id BIGINT,
    tokens_used INT NOT NULL COMMENT 'token使用量',
    cost DECIMAL(10, 4) DEFAULT 0 COMMENT '费用',
    model VARCHAR(50) COMMENT '使用的模型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI使用统计';
```

---

## 🔌 后端 API 接口详细设计

### 基础响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 1. 获取对话列表
**接口**: `GET /api/ai-chat/history`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "关于诗歌的讨论",
      "preview": "帮我写一首诗",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:05:00Z"
    }
  ]
}
```

### 2. 创建新对话
**接口**: `POST /api/ai-chat/create`

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**: `{}`

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 2,
    "title": "新对话",
    "preview": "",
    "createdAt": "2024-01-01T10:10:00Z",
    "updatedAt": "2024-01-01T10:10:00Z"
  }
}
```

### 3. 获取对话消息列表
**接口**: `GET /api/ai-chat/messages/:conversationId`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "role": "user",
      "content": "你好",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    {
      "role": "ai",
      "content": "你好！有什么我可以帮助你的吗？",
      "timestamp": "2024-01-01T10:00:05Z"
    }
  ]
}
```

### 4. 发送消息给 AI
**接口**: `POST /api/ai-chat/message/:conversationId`

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "content": "帮我写一首诗"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "content": "好的，这是我为你创作的诗...",
    "role": "ai",
    "timestamp": "2024-01-01T10:01:00Z",
    "tokensUsed": 150
  }
}
```

### 5. 重命名对话
**接口**: `PUT /api/ai-chat/rename/:conversationId`

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "title": "诗歌创作对话"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "重命名成功"
}
```

### 6. 删除对话
**接口**: `DELETE /api/ai-chat/delete/:conversationId`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 💻 后端实现示例（Node.js + Express）

### 项目结构
```
backend/
├── src/
│   ├── controllers/
│   │   └── aiChatController.js    # AI Chat 控制器
│   ├── services/
│   │   ├── aiService.js           # AI 服务封装
│   │   └── conversationService.js # 对话服务
│   ├── models/
│   │   ├── Conversation.js        # 对话模型
│   │   └── Message.js             # 消息模型
│   ├── middleware/
│   │   └── auth.js                # 鉴权中间件
│   ├── routes/
│   │   └── aiChat.js              # AI Chat 路由
│   └── config/
│       └── aiConfig.js            # AI 配置
└── package.json
```

### 1. AI 服务封装 (aiService.js)

#### 使用 OpenAI
```javascript
// src/services/aiService.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL // 可选，使用代理时配置
});

class AIService {
  /**
   * 调用 OpenAI 生成回复
   * @param {Array} messages - 消息历史数组
   * @returns {Promise<Object>} - AI 回复结果
   */
  async generateResponse(messages) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000,
      });

      return {
        content: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('AI 服务调用失败:', error);
      throw new Error('AI 服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 流式响应（支持打字机效果）
   */
  async generateStreamResponse(messages, onChunk) {
    try {
      const stream = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }

      return { content: fullContent };
    } catch (error) {
      console.error('AI 流式服务调用失败:', error);
      throw new Error('AI 服务暂时不可用，请稍后重试');
    }
  }
}

module.exports = new AIService();
```

### 2. 对话服务 (conversationService.js)
```javascript
// src/services/conversationService.js
const db = require('../config/database');

class ConversationService {
  // 获取用户的所有对话
  async getUserConversations(userId) {
    const [rows] = await db.query(
      `SELECT id, title, preview, created_at as createdAt, updated_at as updatedAt
       FROM conversations
       WHERE user_id = ? AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [userId]
    );
    return rows;
  }

  // 创建新对话
  async createConversation(userId) {
    const [result] = await db.query(
      `INSERT INTO conversations (user_id, title) VALUES (?, '新对话')`,
      [userId]
    );
    return {
      id: result.insertId,
      title: '新对话',
      preview: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 获取对话的所有消息
  async getConversationMessages(conversationId, userId) {
    // 验证对话归属
    const [conversation] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [conversationId, userId]
    );
    
    if (!conversation || conversation.length === 0) {
      throw new Error('对话不存在或无权访问');
    }

    const [messages] = await db.query(
      `SELECT role, content, created_at as timestamp
       FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC`,
      [conversationId]
    );
    return messages;
  }

  // 保存消息
  async saveMessage(conversationId, role, content, tokens = 0) {
    await db.query(
      `INSERT INTO messages (conversation_id, role, content, tokens)
       VALUES (?, ?, ?, ?)`,
      [conversationId, role, content, tokens]
    );

    // 更新对话预览和时间
    if (role === 'user') {
      await db.query(
        `UPDATE conversations
         SET preview = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [content.substring(0, 100), conversationId]
      );
    }
  }

  // 重命名对话
  async renameConversation(conversationId, userId, title) {
    const [result] = await db.query(
      `UPDATE conversations
       SET title = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [title, conversationId, userId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('对话不存在或无权修改');
    }
  }

  // 删除对话（软删除）
  async deleteConversation(conversationId, userId) {
    const [result] = await db.query(
      `UPDATE conversations
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [conversationId, userId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('对话不存在或无权删除');
    }
  }
}

module.exports = new ConversationService();
```

### 3. 控制器 (aiChatController.js)
```javascript
// src/controllers/aiChatController.js
const conversationService = require('../services/conversationService');
const aiService = require('../services/aiService');

class AIChatController {
  // 获取对话列表
  async getHistory(req, res) {
    try {
      const userId = req.user.id; // 从 JWT token 中获取
      const conversations = await conversationService.getUserConversations(userId);
      
      res.json({
        code: 200,
        data: conversations
      });
    } catch (error) {
      console.error('获取对话列表失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 创建新对话
  async createConversation(req, res) {
    try {
      const userId = req.user.id;
      const conversation = await conversationService.createConversation(userId);
      
      res.json({
        code: 200,
        data: conversation
      });
    } catch (error) {
      console.error('创建对话失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 获取对话消息
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const messages = await conversationService.getConversationMessages(id, userId);
      
      res.json({
        code: 200,
        data: messages
      });
    } catch (error) {
      console.error('获取消息失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 发送消息给 AI
  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { id: conversationId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({
          code: 400,
          message: '消息内容不能为空'
        });
      }

      // 1. 保存用户消息
      await conversationService.saveMessage(conversationId, 'user', content);

      // 2. 获取对话历史（最近10条）
      const messages = await conversationService.getConversationMessages(conversationId, userId);
      const recentMessages = messages.slice(-10); // 只取最近10条，控制 token 消耗

      // 3. 调用 AI 服务
      const aiResponse = await aiService.generateResponse(recentMessages);

      // 4. 保存 AI 回复
      await conversationService.saveMessage(
        conversationId,
        'ai',
        aiResponse.content,
        aiResponse.tokensUsed
      );

      // 5. 返回响应
      res.json({
        code: 200,
        data: {
          content: aiResponse.content,
          role: 'ai',
          timestamp: new Date().toISOString(),
          tokensUsed: aiResponse.tokensUsed
        }
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 重命名对话
  async renameConversation(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { title } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          code: 400,
          message: '标题不能为空'
        });
      }

      await conversationService.renameConversation(id, userId, title.trim());
      
      res.json({
        code: 200,
        message: '重命名成功'
      });
    } catch (error) {
      console.error('重命名失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 删除对话
  async deleteConversation(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await conversationService.deleteConversation(id, userId);
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除失败:', error);
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }
}

module.exports = new AIChatController();
```

### 4. 路由配置 (aiChat.js)
```javascript
// src/routes/aiChat.js
const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChatController');
const authMiddleware = require('../middleware/auth');

// 所有路由都需要鉴权
router.use(authMiddleware);

router.get('/history', aiChatController.getHistory);
router.post('/create', aiChatController.createConversation);
router.get('/messages/:id', aiChatController.getMessages);
router.post('/message/:id', aiChatController.sendMessage);
router.put('/rename/:id', aiChatController.renameConversation);
router.delete('/delete/:id', aiChatController.deleteConversation);

module.exports = router;
```

### 5. 鉴权中间件 (auth.js)
```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证失败'
    });
  }
};
```

### 6. 环境配置 (.env)
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=home_web

# JWT 配置
JWT_SECRET=your_jwt_secret_key

# OpenAI 配置
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选
AI_MODEL=gpt-3.5-turbo

# 服务器配置
PORT=3000
```

---

## 🎯 AI 服务选择方案

### 方案 1: OpenAI API（推荐）
**优点**: 
- 质量最高
- 文档完善
- 社区支持好

**缺点**:
- 需要付费
- 国内访问需要代理

**配置**:
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1'
});
```

### 方案 2: Azure OpenAI
**优点**:
- 国内可直接访问
- 企业级支持
- 数据合规

**配置**:
```javascript
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `https://${process.env.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': '2023-05-15' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY }
});
```

### 方案 3: Claude API (Anthropic)
```javascript
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const response = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 1024,
  messages: messages
});
```

### 方案 4: 本地模型（Ollama）
**优点**:
- 完全免费
- 数据私密
- 无网络依赖

**配置**:
```javascript
const ollama = require('ollama');

const response = await ollama.chat({
  model: 'llama2',
  messages: messages
});
```

---

## 🚀 部署步骤

### 1. 安装依赖
```bash
npm install express mysql2 openai jsonwebtoken dotenv cors
```

### 2. 创建数据库表
```bash
mysql -u root -p < database/schema.sql
```

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入配置
```

### 4. 启动服务
```bash
npm start
```

---

## 🧪 测试 API

### 使用 Postman/cURL 测试

#### 1. 创建对话
```bash
curl -X POST http://localhost:3000/api/ai-chat/create \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. 发送消息
```bash
curl -X POST http://localhost:3000/api/ai-chat/message/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "你好"}'
```

---

## ⚡ 性能优化建议

### 1. 添加 Redis 缓存
```javascript
// 缓存用户对话列表
const conversations = await redis.get(`conversations:${userId}`);
if (!conversations) {
  const data = await conversationService.getUserConversations(userId);
  await redis.setex(`conversations:${userId}`, 300, JSON.stringify(data));
  return data;
}
return JSON.parse(conversations);
```

### 2. 请求限流
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 20, // 最多20次请求
  message: '请求过于频繁，请稍后再试'
});

router.post('/message/:id', limiter, aiChatController.sendMessage);
```

### 3. Token 使用统计
```javascript
// 记录 token 使用情况
await db.query(
  `INSERT INTO ai_usage_logs (user_id, conversation_id, tokens_used, model)
   VALUES (?, ?, ?, ?)`,
  [userId, conversationId, tokensUsed, model]
);
```

---

## 📝 前端调试提示

### 1. 在 `env.js` 中确认 API_BASE_URL
```javascript
export const ENV_CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api'
};
```

### 2. 检查 token 是否正确传递
```javascript
// src/stores/userStore.js
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    // ...
  })
});
```

---

## 🎉 完成后验证清单

- [ ] 数据库表创建成功
- [ ] 后端服务启动正常
- [ ] AI API 密钥配置正确
- [ ] 前端可以创建对话
- [ ] 前端可以发送消息并收到 AI 回复
- [ ] 对话列表正常显示
- [ ] 重命名功能正常
- [ ] 删除功能正常
- [ ] 鉴权机制正常工作

---

## 📚 相关文档

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Azure OpenAI 文档](https://learn.microsoft.com/zh-cn/azure/ai-services/openai/)
- [Claude API 文档](https://docs.anthropic.com/claude/reference)
- [Ollama 文档](https://ollama.ai/docs)

---

## ⚠️ 注意事项

1. **API 密钥安全**: 永远不要将 API 密钥提交到 Git 仓库
2. **成本控制**: 设置 token 使用上限，避免超额费用
3. **错误处理**: 完善的错误处理和用户提示
4. **数据隐私**: 注意用户对话数据的隐私保护
5. **限流防刷**: 添加请求限流，防止恶意调用

---

## 🆘 常见问题

### Q1: OpenAI API 调用失败
**A**: 检查 API 密钥是否正确，网络是否能访问 OpenAI（国内需要代理）

### Q2: 数据库连接失败
**A**: 检查数据库配置、端口、用户名密码是否正确

### Q3: 前端 CORS 错误
**A**: 后端需要配置 CORS
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Q4: Token 验证失败
**A**: 检查 JWT_SECRET 配置、token 格式、过期时间

---

**祝你接入顺利！如有问题随时联系。** 🎊

