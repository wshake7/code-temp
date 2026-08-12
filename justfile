# Windows 无 sh 时用 PowerShell 执行 recipe
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

# 默认：列出可用命令
default:
    @just --list

# 并行安装 monorepo 依赖（根 workspace + 独立子应用）
[parallel]
install: _install-root _install-vben _install-radmin

alias i := install

[private]
_install-root:
    vp i

[private]
[working-directory: "apps/vue-vben-admin"]
_install-vben:
    vp i

[private]
[working-directory: "apps/react-admin"]
_install-radmin:
    vp i

# 全仓清理：node_modules / dist / .turbo / .vite / coverage / target 等
clean:
    node scripts/clean.mjs
