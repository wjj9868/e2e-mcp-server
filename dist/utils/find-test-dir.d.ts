/**
 * 查找测试目录的公共函数
 */
/**
 * 查找 Playwright 测试目录
 * @param specifiedDir 用户指定的目录
 * @param searchPaths 额外的搜索路径
 */
export declare function findTestDir(specifiedDir?: string, searchPaths?: string[]): string | null;
/**
 * 查找报告目录
 */
export declare function findReportDir(testDir: string): string | null;
/**
 * 查找测试结果目录
 */
export declare function findResultsDir(testDir: string): string | null;
//# sourceMappingURL=find-test-dir.d.ts.map