/**
 * MCP 提示词 v3.2
 *
 * 通用设计：不绑定特定 UI 框架
 * 只提供 AI 需要但无法自己推断的通用知识
 */
export const PROMPTS = {
    /**
     * 核心上下文：通用 E2E 测试知识
     */
    'e2e-context': () => ({
        description: 'E2E 测试通用上下文',
        messages: [{
                role: 'assistant',
                content: {
                    type: 'text',
                    text: `# E2E 测试通用知识

## 0. 完整工作流程

\`\`\`
1. 初始化项目    → 使用 e2e_init 工具
2. 安装依赖      → cd e2e && npm install
3. 安装浏览器    → npx playwright install chromium
4. 编写测试      → 在 pages/ 创建 Page Object，在 tests/ 创建测试用例
5. 运行测试      → 使用 e2e_run 工具
6. 查看报告      → 使用 e2e_report 工具打开 HTML 报告
\`\`\`

**常用命令（用 shell 执行）：**
- \`npm install\` - 安装依赖
- \`npx playwright install chromium\` - 安装 Chrome 浏览器
- \`npx playwright install\` - 安装所有浏览器
- \`npx playwright show-report\` - 打开 HTML 测试报告
- \`npx playwright test --ui\` - 打开 Playwright UI 模式

**MCP 工具：**
- \`e2e_init\` - 初始化测试项目
- \`e2e_run\` - 运行测试（自动生成 HTML 报告）
- \`e2e_report\` - 打开 HTML 测试报告

## 1. UI 框架组件的运行时 DOM

大多数 UI 框架的组件在运行时会生成包装层 DOM，源码和实际 DOM 不一致：

**通用规律：**
- 输入框组件通常有外层包装 div
- 下拉框的选项列表通常 teleport 到 body 末尾
- 弹窗/对话框通常有遮罩层，内容也可能 teleport
- 消息提示通常动态插入到 body

**选择器策略（按稳定性排序）：**
\`\`\`typescript
// ✅ 最稳定：语义化属性
page.locator('[data-testid="login-btn"]')
page.locator('input[placeholder*="用户名"]')
page.locator('button:has-text("登录")')
page.getByRole('button', { name: '登录' })
page.getByPlaceholder('用户名')

// ✅ 稳定：文本内容定位
page.locator('text=登录')
page.getByText('登录成功')

// ⚠️ 一般：组合选择器
page.locator('.dialog:has-text("确认") button:has-text("确定")')
page.locator('form').filter({ hasText: '登录' }).locator('button')

// ❌ 避免：动态生成的 ID
page.locator('#el-id-1234')  // Element Plus
page.locator('#rc-tabs-0-tab-1')  // Ant Design
page.locator('#radix-:r0:')  // Radix UI

// ❌ 避免：框架内部类单独使用
page.locator('.el-input__inner')  // 太多匹配
page.locator('.ant-btn-primary')  // 样式类，可能变
\`\`\`

## 2. 常见 UI 框架的 DOM 特点

**Vue + Element Plus:**
- 前缀: \`el-\`
- 动态 ID: \`el-id-xxx-xxx\`
- 下拉选项: \`.el-select-dropdown\` (teleport)

**Vue + Ant Design Vue:**
- 前缀: \`ant-\`
- 动态 ID: \`rc-xxx\`
- 下拉选项: \`.ant-select-dropdown\` (teleport)

**React + Ant Design:**
- 前缀: \`ant-\`
- 动态 ID: \`rc-xxx\`

**React + MUI:**
- 前缀: \`Mui\`
- 动态 ID: \`:r0:\`, \`:r1:\`

**通用处理方式：**
\`\`\`typescript
// 下拉框：先点击触发器，再选择选项
await page.locator('选择器触发器').click()
await page.locator('选项容器').filter({ hasText: '选项文本' }).click()

// 弹窗：等待出现后操作
await page.locator('弹窗选择器').waitFor()
await page.locator('弹窗选择器 button').filter({ hasText: '确定' }).click()

// 消息提示：等待出现
await expect(page.locator('消息选择器')).toBeVisible()
\`\`\`

## 3. Playwright 关键 API

\`\`\`typescript
// 等待策略
await page.waitForLoadState('networkidle')  // 网络空闲
await page.waitForLoadState('domcontentloaded')  // DOM 加载
await expect(locator).toBeVisible({ timeout: 10000 })

// 定位器过滤
page.locator('button').filter({ hasText: '提交' })
page.locator('tr').filter({ hasText: '数据' }).locator('button')

// 表单操作
await input.fill('内容')  // 清空后填入
await input.type('内容')  // 逐字输入
await select.selectOption('value')  // 原生 select

// 断言
await expect(page).toHaveURL('/dashboard')
await expect(locator).toHaveText('内容')
await expect(locator).toBeVisible()
await expect(locator).toHaveCount(5)
\`\`\`

## 4. 项目结构约定

\`\`\`
e2e/
├── pages/           # Page Object
├── tests/           # 测试用例
├── fixtures/        # 测试数据
└── playwright.config.ts
\`\`\`

## 5. 识别 UI 框架

**从 package.json 识别：**
- \`element-plus\` → Element Plus
- \`ant-design-vue\` → Ant Design Vue
- \`antd\` → Ant Design (React)
- \`@mui/material\` → MUI
- \`@chakra-ui/react\` → Chakra UI

**从源码识别：**
- \`<el-xxx>\` → Element Plus
- \`<a-xxx>\` → Ant Design Vue
- \`<Button>\` + antd import → Ant Design
- \`<Button>\` + @mui import → MUI
`
                }
            }]
    }),
    /**
     * 调试指南
     */
    'e2e-debug': () => ({
        description: '测试失败排查指南',
        messages: [{
                role: 'assistant',
                content: {
                    type: 'text',
                    text: `# E2E 测试调试指南

## 常见错误及解决

### 1. 元素找不到
\`\`\`
Timeout waiting for locator
\`\`\`

**排查：**
1. \`--headed\` 模式查看实际页面
2. 检查选择器（UI 框架组件有包装层）
3. 检查是否需要等待加载
4. 检查元素是否在 iframe 内

**修复：**
\`\`\`typescript
await page.waitForLoadState('networkidle')
await expect(locator).toBeVisible()
\`\`\`

### 2. 元素被遮挡
\`\`\`
Element is not visible / intercepted
\`\`\`

**常见原因：** 弹窗、loading、固定定位元素

**修复：**
\`\`\`typescript
// 等待遮罩消失
await page.locator('.loading').waitFor({ state: 'hidden' })
// 或强制点击
await locator.click({ force: true })
\`\`\`

### 3. 状态不一致

**原因：** 每个测试独立，不共享登录状态

**修复：** 使用 storageState
\`\`\`typescript
// 保存
await page.context().storageState({ path: 'auth.json' })
// 复用
test.use({ storageState: 'auth.json' })
\`\`\`

## 调试命令

\`\`\`bash
npx playwright test --headed      # 可视化
npx playwright test --debug       # 调试模式
npx playwright test --ui          # UI 模式
npx playwright test -g "关键词"   # 过滤测试
\`\`\`

## 快速定位

\`\`\`typescript
await page.pause()        // 暂停，打开调试器
await locator.highlight() // 高亮元素
console.log(await locator.textContent())  // 打印内容
await page.screenshot({ path: 'debug.png' })  // 截图
\`\`\`
`
                }
            }]
    }),
};
//# sourceMappingURL=index.js.map