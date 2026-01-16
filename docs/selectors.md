# 选择器策略

## 稳定性排序

选择器按稳定性从高到低排序：

### ✅ 最稳定：语义化属性

```typescript
// data-testid（推荐添加到源码）
page.locator('[data-testid="login-btn"]')

// placeholder
page.locator('input[placeholder*="用户名"]')

// 文本内容
page.locator('button:has-text("登录")')

// ARIA 角色
page.getByRole('button', { name: '登录' })
page.getByPlaceholder('用户名')
page.getByLabel('密码')
```

### ✅ 稳定：文本定位

```typescript
page.locator('text=登录')
page.getByText('登录成功')
page.getByText('登录', { exact: true })  // 精确匹配
```

### ⚠️ 一般：组合选择器

```typescript
// 父子关系
page.locator('.dialog:has-text("确认") button:has-text("确定")')

// 过滤
page.locator('form').filter({ hasText: '登录' }).locator('button')

// 表格行
page.locator('tr').filter({ hasText: '订单号' }).locator('button')
```

### ❌ 避免：动态 ID

```typescript
// Element Plus 动态 ID
page.locator('#el-id-1234')  // ❌

// Ant Design 动态 ID
page.locator('#rc-tabs-0-tab-1')  // ❌

// Radix UI 动态 ID
page.locator('#radix-:r0:')  // ❌
```

### ❌ 避免：框架内部类单独使用

```typescript
// 太多匹配
page.locator('.el-input__inner')  // ❌

// 样式类可能变化
page.locator('.ant-btn-primary')  // ❌
```

## 推荐模式

### 输入框

```typescript
// ✅ 推荐
page.getByPlaceholder('请输入用户名')
page.getByLabel('用户名')
page.locator('input[name="username"]')

// ⚠️ 可用（结合父元素）
page.locator('.login-form input').first()
```

### 按钮

```typescript
// ✅ 推荐
page.getByRole('button', { name: '提交' })
page.locator('button:has-text("提交")')
page.locator('[data-testid="submit-btn"]')
```

### 下拉框

```typescript
// 先点击触发器
await page.locator('触发器选择器').click()

// 等待下拉面板出现（通常 teleport 到 body）
await page.locator('.dropdown-panel').waitFor()

// 选择选项
await page.locator('.dropdown-panel').getByText('选项文本').click()
```

### 弹窗

```typescript
// 等待弹窗出现
await page.locator('.modal').waitFor()

// 操作弹窗内容
await page.locator('.modal').getByRole('button', { name: '确定' }).click()
```

### 表格

```typescript
// 定位特定行
const row = page.locator('tr').filter({ hasText: '订单12345' })

// 操作行内按钮
await row.getByRole('button', { name: '编辑' }).click()
```

## 调试选择器

```typescript
// 暂停执行，打开调试器
await page.pause()

// 高亮元素
await locator.highlight()

// 打印匹配数量
console.log(await locator.count())

// 打印元素内容
console.log(await locator.textContent())
```

## 下一步

- [UI 框架指南](./ui-frameworks.md) — 各框架的具体 DOM 结构
