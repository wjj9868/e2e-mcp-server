# 调试指南

## 常见错误

### 1. 元素找不到

```
Timeout waiting for locator
```

#### 原因

- 选择器不正确
- 元素还未加载
- 元素在 iframe 内
- UI 框架组件有包装层

#### 解决

```typescript
// 等待页面加载
await page.waitForLoadState('networkidle')

// 等待元素可见
await expect(locator).toBeVisible({ timeout: 10000 })

// 检查 iframe
const frame = page.frameLocator('#iframe-id')
await frame.locator('选择器').click()
```

### 2. 元素被遮挡

```
Element is not visible
Element is intercepted by another element
```

#### 原因

- Loading 遮罩
- 弹窗遮罩
- 固定定位元素

#### 解决

```typescript
// 等待遮罩消失
await page.locator('.loading').waitFor({ state: 'hidden' })
await page.locator('.modal-mask').waitFor({ state: 'hidden' })

// 强制点击（谨慎使用）
await locator.click({ force: true })
```

### 3. 状态不一致

#### 原因

每个测试独立运行，不共享登录状态。

#### 解决

```typescript
// 保存登录状态
await page.context().storageState({ path: 'auth.json' })

// 复用登录状态
test.use({ storageState: 'auth.json' })
```

### 4. 时序问题

```
Element is not stable
```

#### 原因

- 动画进行中
- 元素位置变化

#### 解决

```typescript
// 等待动画完成
await page.waitForTimeout(300)

// 等待元素稳定
await expect(locator).toBeVisible()
await locator.click()
```

## 调试命令

```bash
# 可视化运行
npx playwright test --headed

# 调试模式（逐步执行）
npx playwright test --debug

# UI 模式（推荐）
npx playwright test --ui

# 只运行特定测试
npx playwright test -g "登录"

# 指定浏览器
npx playwright test --project=chromium
```

## 代码调试

```typescript
// 暂停执行，打开调试器
await page.pause()

// 高亮元素
await locator.highlight()

// 截图
await page.screenshot({ path: 'debug.png' })

// 打印元素信息
console.log('Count:', await locator.count())
console.log('Text:', await locator.textContent())
console.log('Visible:', await locator.isVisible())
```

## 查看报告

```bash
# 打开 HTML 报告
npx playwright show-report

# 查看 trace（失败时自动生成）
npx playwright show-trace test-results/xxx/trace.zip
```

## 常见场景

### 登录测试失败

```typescript
test('登录', async ({ page }) => {
  await page.goto('/login')
  
  // 等待页面加载
  await page.waitForLoadState('networkidle')
  
  // 填写表单
  await page.getByPlaceholder('用户名').fill('admin')
  await page.getByPlaceholder('密码').fill('123456')
  
  // 点击登录
  await page.getByRole('button', { name: '登录' }).click()
  
  // 等待跳转
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
})
```

### 下拉框选择失败

```typescript
// 确保下拉面板出现后再选择
await page.locator('.select-trigger').click()
await page.locator('.select-dropdown').waitFor()
await page.locator('.select-dropdown').getByText('选项').click()
```

### 弹窗操作失败

```typescript
// 确保弹窗完全出现
await page.locator('.modal').waitFor()
await page.waitForTimeout(300)  // 等待动画
await page.locator('.modal button').click()
```

## 下一步

- [常见问题](./faq.md)
