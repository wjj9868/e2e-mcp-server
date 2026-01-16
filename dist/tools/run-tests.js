/**
 * 测试运行工具
 * 执行 Playwright 测试并返回结果
 */
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { findTestDir, findReportDir } from '../utils/find-test-dir.js';
export async function runTests(args) {
    const { testDir, testFile, grep, project, headed = false } = args;
    // 查找测试目录
    const workDir = findTestDir(testDir);
    if (!workDir) {
        return {
            content: [
                {
                    type: 'text',
                    text: `❌ 未找到测试目录。

请确保：
1. 存在 e2e、tests 或 test 目录
2. 目录中有 playwright.config.ts 文件
3. 或通过 testDir 参数指定完整路径

当前工作目录: ${process.cwd()}`,
                },
            ],
        };
    }
    // 检查是否安装了依赖
    const nodeModulesPath = path.join(workDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        return {
            content: [
                {
                    type: 'text',
                    text: `❌ 测试目录未安装依赖。

请先运行：
\`\`\`bash
cd ${workDir}
npm install
npx playwright install chromium
\`\`\``,
                },
            ],
        };
    }
    // 构建命令参数 - 同时使用 JSON 和 HTML reporter
    const cmdArgs = ['playwright', 'test'];
    if (testFile) {
        cmdArgs.push(testFile);
    }
    if (grep) {
        cmdArgs.push('--grep', grep);
    }
    if (project) {
        cmdArgs.push('--project', project);
    }
    if (headed) {
        cmdArgs.push('--headed');
    }
    // 使用多个 reporter：JSON 用于解析，HTML 用于报告，list 用于控制台
    cmdArgs.push('--reporter=json,html,list');
    try {
        const result = await executeCommand('npx', cmdArgs, workDir);
        // 检查报告目录
        result.reportDir = findReportDir(workDir) || undefined;
        const formattedResult = formatTestResult(result, workDir);
        return {
            content: [{ type: 'text', text: formattedResult }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: `❌ 测试执行失败: ${errorMessage}\n\n测试目录: ${workDir}` }],
        };
    }
}
function executeCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const proc = spawn(command, args, {
            cwd,
            shell: true,
            env: { ...process.env, FORCE_COLOR: '0' },
        });
        proc.stdout?.on('data', (data) => {
            stdout += data.toString();
        });
        proc.stderr?.on('data', (data) => {
            stderr += data.toString();
        });
        proc.on('close', (code) => {
            try {
                // 尝试解析 JSON 输出
                const jsonResult = parseJsonOutput(stdout);
                if (jsonResult) {
                    resolve(jsonResult);
                }
                else {
                    // 如果无法解析 JSON，返回原始输出
                    resolve({
                        success: code === 0,
                        totalTests: 0,
                        passed: 0,
                        failed: 0,
                        skipped: 0,
                        duration: 0,
                        output: stdout || stderr,
                        failedTests: [],
                    });
                }
            }
            catch (e) {
                resolve({
                    success: code === 0,
                    totalTests: 0,
                    passed: 0,
                    failed: 0,
                    skipped: 0,
                    duration: 0,
                    output: stdout || stderr,
                    failedTests: [],
                });
            }
        });
        proc.on('error', (error) => {
            reject(error);
        });
    });
}
function parseJsonOutput(output) {
    try {
        // 查找 JSON 开始位置（可能有多个 JSON 块，取第一个完整的）
        const jsonStart = output.indexOf('{');
        if (jsonStart === -1)
            return null;
        // 找到匹配的结束括号
        let depth = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < output.length; i++) {
            if (output[i] === '{')
                depth++;
            else if (output[i] === '}') {
                depth--;
                if (depth === 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }
        if (jsonEnd === -1)
            return null;
        const jsonStr = output.slice(jsonStart, jsonEnd);
        const data = JSON.parse(jsonStr);
        let totalTests = 0;
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        const failedTests = [];
        // 递归解析测试结果
        function parseSuite(suite) {
            if (suite.specs) {
                for (const spec of suite.specs) {
                    for (const test of spec.tests || []) {
                        totalTests++;
                        const result = test.results?.[0];
                        const status = result?.status || 'skipped';
                        if (status === 'passed')
                            passed++;
                        else if (status === 'failed' || status === 'timedOut') {
                            failed++;
                            failedTests.push({
                                name: spec.title,
                                error: result?.error?.message || '未知错误',
                            });
                        }
                        else
                            skipped++;
                    }
                }
            }
            if (suite.suites) {
                for (const childSuite of suite.suites) {
                    parseSuite(childSuite);
                }
            }
        }
        for (const suite of data.suites || []) {
            parseSuite(suite);
        }
        return {
            success: failed === 0,
            totalTests,
            passed,
            failed,
            skipped,
            duration: data.stats?.duration || 0,
            output: '',
            failedTests,
        };
    }
    catch {
        return null;
    }
}
function formatTestResult(result, workDir) {
    const lines = [];
    const statusIcon = result.success ? '✅' : '❌';
    const passRate = result.totalTests > 0
        ? ((result.passed / result.totalTests) * 100).toFixed(1)
        : 0;
    lines.push(`# ${statusIcon} 测试执行结果`);
    lines.push('');
    lines.push(`| 指标 | 数值 |`);
    lines.push(`|------|------|`);
    lines.push(`| 总测试数 | ${result.totalTests} |`);
    lines.push(`| ✅ 通过 | ${result.passed} |`);
    lines.push(`| ❌ 失败 | ${result.failed} |`);
    lines.push(`| ⏭️ 跳过 | ${result.skipped} |`);
    lines.push(`| 通过率 | ${passRate}% |`);
    if (result.duration > 0) {
        const durationStr = result.duration < 1000
            ? `${result.duration}ms`
            : `${(result.duration / 1000).toFixed(1)}s`;
        lines.push(`| 耗时 | ${durationStr} |`);
    }
    lines.push('');
    // 失败测试详情
    if (result.failedTests.length > 0) {
        lines.push(`## ❌ 失败测试详情`);
        lines.push('');
        result.failedTests.forEach((test, i) => {
            lines.push(`### ${i + 1}. ${test.name}`);
            lines.push('```');
            lines.push(test.error);
            lines.push('```');
            lines.push('');
        });
    }
    // 原始输出（如果有）
    if (result.output && result.totalTests === 0) {
        lines.push(`## 输出`);
        lines.push('```');
        lines.push(result.output.slice(0, 2000));
        if (result.output.length > 2000) {
            lines.push('... (输出已截断)');
        }
        lines.push('```');
    }
    // 报告信息
    lines.push('');
    lines.push(`## 📊 测试报告`);
    if (result.reportDir) {
        lines.push(`HTML 报告已生成: \`${result.reportDir}\``);
        lines.push('');
        lines.push(`查看报告：`);
        lines.push('```bash');
        lines.push(`cd ${workDir}`);
        lines.push(`npx playwright show-report`);
        lines.push('```');
        lines.push('');
        lines.push(`或使用 \`e2e_report\` 工具自动打开报告。`);
    }
    else {
        lines.push(`报告目录: \`${path.join(workDir, 'playwright-report')}\``);
        lines.push('');
        lines.push(`如果报告未生成，请检查测试是否正常执行。`);
    }
    return lines.join('\n');
}
//# sourceMappingURL=run-tests.js.map