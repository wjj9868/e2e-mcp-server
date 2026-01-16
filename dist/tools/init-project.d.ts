/**
 * 初始化 E2E 测试项目
 * 创建标准的项目结构和配置文件
 */
interface InitProjectArgs {
    projectDir: string;
    baseUrl?: string;
}
export declare function initProject(args: InitProjectArgs): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
export {};
//# sourceMappingURL=init-project.d.ts.map