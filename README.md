# 软食坊菜单管理系统

一个基于Vue 3、TypeScript和PocketBase的菜单管理系统，用于管理和展示午餐、晚餐和炖汤菜单。

## 项目特性

- 基于Vue 3 + TypeScript + Vite搭建
- 使用Element Plus作为UI框架
- 使用PocketBase作为后端服务
- 响应式设计，支持多种设备尺寸
- 提供菜单查看与编辑功能

## 开发环境设置

1. 克隆项目
2. 安装依赖
3. 配置PocketBase服务
4. 运行开发服务器

### 安装依赖

```sh
pnpm install
```

### 环境变量配置

创建`.env`文件，设置PocketBase的URL：

```
VITE_PB_URL=http://127.0.0.1:8090
```

### 运行开发服务器

```sh
pnpm dev
```

### 构建生产版本

```sh
pnpm build
```

## PocketBase配置

本项目需要PocketBase后端支持，您需要设置以下集合：

1. users - 系统用户
2. dishes - 菜品列表
3. menus - 菜单信息
4. menu_items - 菜单项目

具体字段请参考项目中的类型定义。

## 推荐的IDE设置

- [VSCode](https://code.visualstudio.com/)
- [Volar扩展](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```
