/**
 * 查找测试目录的公共函数
 */
import * as fs from 'fs';
import * as path from 'path';
/**
 * 查找 Playwright 测试目录
 * @param specifiedDir 用户指定的目录
 * @param searchPaths 额外的搜索路径
 */
export function findTestDir(specifiedDir, searchPaths = []) {
    // 1. 如果指定了目录且存在配置文件，直接使用
    if (specifiedDir) {
        const resolved = path.resolve(specifiedDir);
        if (hasPlaywrightConfig(resolved)) {
            return resolved;
        }
        // 检查是否是项目目录，测试在 e2e 子目录
        const e2eSubDir = path.join(resolved, 'e2e');
        if (hasPlaywrightConfig(e2eSubDir)) {
            return e2eSubDir;
        }
    }
    // 2. 在额外搜索路径中查找
    for (const searchPath of searchPaths) {
        const resolved = path.resolve(searchPath);
        if (hasPlaywrightConfig(resolved)) {
            return resolved;
        }
        const e2eSubDir = path.join(resolved, 'e2e');
        if (hasPlaywrightConfig(e2eSubDir)) {
            return e2eSubDir;
        }
    }
    // 3. 在当前工作目录查找
    const cwd = process.cwd();
    const possibleDirs = ['e2e', 'tests', 'test', '.'];
    for (const dir of possibleDirs) {
        const fullPath = path.join(cwd, dir);
        if (hasPlaywrightConfig(fullPath)) {
            return fullPath;
        }
    }
    return null;
}
/**
 * 检查目录是否包含 Playwright 配置文件
 */
function hasPlaywrightConfig(dir) {
    if (!fs.existsSync(dir)) {
        return false;
    }
    const configFiles = [
        'playwright.config.ts',
        'playwright.config.js',
        'playwright.config.mjs'
    ];
    return configFiles.some(file => fs.existsSync(path.join(dir, file)));
}
/**
 * 查找报告目录
 */
export function findReportDir(testDir) {
    const reportDir = path.join(testDir, 'playwright-report');
    if (fs.existsSync(reportDir)) {
        return reportDir;
    }
    return null;
}
/**
 * 查找测试结果目录
 */
export function findResultsDir(testDir) {
    const resultsDir = path.join(testDir, 'test-results');
    if (fs.existsSync(resultsDir)) {
        return resultsDir;
    }
    return null;
}
//# sourceMappingURL=find-test-dir.js.map