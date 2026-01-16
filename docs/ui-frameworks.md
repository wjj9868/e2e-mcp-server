# UI 框架指南

## 识别 UI 框架

### 从 package.json

```json
// Element Plus
"element-plus": "^2.x"

// Ant Design Vue
"ant-design-vue": "^4.x"

// Ant Design (React)
"antd": "^5.x"

// MUI
"@mui/material": "^5.x"

// Chakra UI
"@chakra-ui/react": "^2.x"
```

### 从源码

```vue
<!-- Element Plus -->
<el-button>按钮</el-button>
<el-input v-model="value" />

<!-- Ant Design Vue -->
<a-button>按钮</a-button>
<a-input v-model:value="value" />
```

```jsx
// Ant Design (React)
import { Button, Input } from 'antd'

// MUI
import { Button, TextField } from '@mui/material'
```

## Element Plus

### 特点

- 前缀：`el-`
- 动态 ID：`el-id-xxx-xxx`
- 下拉选项 teleport 到 body

### 常见组件

#### 输入框

```html
<!-- 源码 -->
<el-input placeholder="用户名" />

<!-- 运行时 DOM -->
<div class="el-input">
  <div class="el-input__wrapper">
    <input class="el-input__inner" placeholder="用户名">
  </div>
</div>
```

```typescript
// ✅ 推荐
page.getByPlaceholder('用户名')
page.locator('.el-input').filter({ hasText: '用户名' }).locator('input')
```

#### 下拉框

```typescript
// 点击触发器
await page.locator('.el-select').click()

// 选择选项（在 body 末尾）
await page.locator('.el-select-dropdown').getByText('选项').click()
```

#### 弹窗

```typescript
// 等待弹窗
await page.locator('.el-dialog').waitFor()

// 操作
await page.locator('.el-dialog').getByRole('button', { name: '确定' }).click()
```

#### 消息提示

```typescript
await expect(page.locator('.el-message')).toContainText('操作成功')
```

## Ant Design Vue / Ant Design

### 特点

- 前缀：`ant-`
- 动态 ID：`rc-xxx`
- 下拉选项 teleport 到 body

### 常见组件

#### 输入框

```html
<!-- 运行时 DOM -->
<span class="ant-input-affix-wrapper">
  <input class="ant-input" placeholder="用户名">
</span>
```

```typescript
// ✅ 推荐
page.getByPlaceholder('用户名')
```

#### 下拉框

```typescript
// 点击触发器
await page.locator('.ant-select-selector').click()

// 选择选项
await page.locator('.ant-select-dropdown').getByText('选项').click()
```

#### 弹窗

```typescript
await page.locator('.ant-modal').waitFor()
await page.locator('.ant-modal').getByRole('button', { name: '确定' }).click()
```

#### 消息提示

```typescript
await expect(page.locator('.ant-message')).toContainText('成功')
```

## MUI (Material-UI)

### 特点

- 前缀：`Mui`
- 动态 ID：`:r0:`, `:r1:`
- 使用 Portal 渲染弹出层

### 常见组件

#### 输入框

```typescript
page.getByLabel('用户名')
page.locator('.MuiTextField-root').filter({ hasText: '用户名' }).locator('input')
```

#### 下拉框

```typescript
await page.locator('.MuiSelect-select').click()
await page.locator('.MuiMenu-paper').getByText('选项').click()
```

#### 弹窗

```typescript
await page.locator('.MuiDialog-root').waitFor()
await page.locator('.MuiDialog-root').getByRole('button', { name: 'OK' }).click()
```

## 通用处理模式

### 下拉框

```typescript
// 1. 点击触发器
await page.locator('触发器选择器').click()

// 2. 等待下拉面板
await page.locator('下拉面板选择器').waitFor()

// 3. 选择选项
await page.locator('下拉面板选择器').getByText('选项文本').click()

// 4. 等待面板关闭（可选）
await page.locator('下拉面板选择器').waitFor({ state: 'hidden' })
```

### 弹窗

```typescript
// 1. 触发弹窗
await page.locator('触发按钮').click()

// 2. 等待弹窗出现
await page.locator('弹窗选择器').waitFor()

// 3. 操作弹窗
await page.locator('弹窗选择器').fill('input', '内容')
await page.locator('弹窗选择器').getByRole('button', { name: '确定' }).click()

// 4. 等待弹窗关闭
await page.locator('弹窗选择器').waitFor({ state: 'hidden' })
```

### 消息提示

```typescript
// 等待消息出现并验证
await expect(page.locator('消息选择器')).toBeVisible()
await expect(page.locator('消息选择器')).toContainText('预期文本')
```

## 下一步

- [调试指南](./debugging.md) — 测试失败排查
