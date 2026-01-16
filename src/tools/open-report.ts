/**
 * 打开 Playwright 测试报告
 */

import { spawn } from 'child_process'
import * as path from 'path'
import { findTestDir, findReportDir } from '../utils/find-test-dir.js'

interface OpenReportArgs {
  testDir?: string
}

export async function openReport(args: OpenReportArgs): Promise<{
  content: Array<{ type: string; text: string }>
}> {
  const { testDir } = args

  // 查找测试目录
  const workDir = findTestDir(testDir)
  if (!workDir) {
    return {
      content: [{
        type: 'text',
        text: `❌ 未找到测试目录。

请确保：
1. 存在 e2e、tests 或 test 目录
2. 目录中有 playwright.config.ts 文件
3. 或通过 testDir 参数指定完整路径

当前工作目录: ${process.cwd()}`
      }]
    }
  }

  // 检查报告目录是否存在
  const reportDir = findReportDir(workDir)
  if (!reportDir) {
    const expectedReportDir = path.join(workDir, 'playwright-report')
    return {
      content: [{
        type: 'text',
        text: `❌ 未找到测试报告。

报告目录不存在: \`${expectedReportDir}\`

请先运行测试生成报告：
\`\`\`bash
cd ${workDir}
npx playwright test
\`\`\`

或使用 \`e2e_run\` 工具运行测试。`
      }]
    }
  }

  try {
    // 使用 npx playwright show-report 打开报告
    const proc = spawn('npx', ['playwright', 'show-report'], {
      cwd: workDir,
      shell: true,
      detached: true,
      stdio: 'ignore'
    })

    // 分离进程，让报告服务器在后台运行
    proc.unref()

    return {
      content: [{
        type: 'text',
        text: `✅ 正在打开测试报告...

📁 报告目录: \`${reportDir}\`
🌐 浏览器应该会自动打开

如果浏览器没有自动打开，请手动访问: http://localhost:9323

或手动运行：
\`\`\`bash
cd ${workDir}
npx playwright show-report
\`\`\``
      }]
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      content: [{
        type: 'text',
        text: `❌ 打开报告失败: ${msg}

你可以手动运行：
\`\`\`bash
cd ${workDir}
npx playwright show-report
\`\`\``
      }]
    }
  }
}
