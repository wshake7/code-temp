import type {PluginOption} from 'vite';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';

/**
 * 自动导入处理
 */
export const autoImportPlugin = (): PluginOption => {
    return AutoImport({
        dirs: [
            'src/hooks/**',
            'src/components/**',
            'src/stores/**',
            'types/**',
        ],
        // unimport 在 normalizeScanDirs 时,如果 glob 末尾没有扩展名(如 src/components/**),
        // 会把原始 glob 也加入扫描范围,导致 README.md、*.mdx 等文档文件被一并扫描,
        // 进而把文档里 ts 代码块里的 export 当成真实导出,触发 "Duplicated imports" 警告。
        // 这里用 fileFilter 排除文档文件,只保留源码后缀。
        dirsScanOptions: {
            fileFilter: (file: string) => !/\.(md|markdown|mdx)$/i.test(file),
        },
        imports: [
            'react',
            // 'react-router',
            'react-router-dom',
            'react-i18next',
            // {from: 'react', imports: ['FC'], type: true},
        ],
        dtsMode: 'overwrite',
        dts: 'src/auto-imports.d.ts',
        include: [/\.[tj]sx?$/],
        resolvers: [
            (name) => {
                // 处理 @/ 开头的路径别名
                if (name.startsWith('@/')) {
                    return {
                        from: name.replace('@/', path.resolve(__dirname, 'src/') + '/'),
                    };
                }
            },
        ],
    });
};
