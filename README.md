# 软食坊菜单管理系统

一个基于Vue 3、TypeScript和PocketBase的菜单管理系统，用于管理和展示午餐、晚餐和炖汤菜单。

## 项目简介

软食坊菜单管理系统是一个现代化的Web应用，专为餐饮管理设计。系统支持菜单的创建、编辑、查看和管理，提供直观的用户界面，帮助餐厅高效地组织和展示菜单信息。

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI框架**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP客户端**：Axios
- **后端服务**：PocketBase
- **样式处理**：SASS

## 项目特性

- 基于Vue 3 Composition API和TypeScript开发
- 使用Element Plus组件库构建美观的用户界面
- 采用响应式设计，支持多种设备尺寸
- 提供完善的菜单管理功能：
  - 菜单创建与编辑
  - 菜品分类与管理
  - 菜单展示与预览
  - 用户权限控制
- 使用PocketBase作为轻量级后端，简化部署和维护

## 项目结构

```
src/
├── api/        # API请求封装
├── assets/     # 静态资源
├── components/ # 通用组件
├── router/     # 路由配置
├── stores/     # Pinia状态管理
├── styles/     # 全局样式
├── types/      # TypeScript类型定义
└── views/      # 页面视图组件
```

## 开发环境设置

### 前提条件

- Node.js (推荐v18+)
- pnpm (推荐使用pnpm作为包管理器)
- PocketBase服务器

### 安装步骤

1. 克隆项目

   ```sh
   git clone <项目仓库URL>
   cd ruanMenuWeb
   ```

2. 安装依赖

   ```sh
   pnpm install
   ```

3. 环境变量配置
   创建`.env`文件，设置PocketBase的URL：

   ```
   VITE_PB_URL=http://127.0.0.1:8090
   ```

4. 运行开发服务器
   ```sh
   pnpm dev
   ```
   开发服务器默认运行在 http://localhost:5173

### 构建生产版本

```sh
pnpm build
```

构建产物将输出到`dist`目录，可以部署到任何静态Web服务器上。

## PocketBase配置

本项目需要PocketBase后端支持，请按照以下步骤配置：

1. 下载并安装[PocketBase](https://pocketbase.io/docs/)
2. 运行PocketBase服务
3. 创建以下集合：
   - **users** - 系统用户
   - **dishes** - 菜品列表
   - **menus** - 菜单信息
   - **menu_items** - 菜单项目

### 集合结构参考

#### dishes（菜品）集合

- `name`: 菜品名称 (文本)
- `description`: 菜品描述 (文本)
- `type`: 菜品类型 (选择：主菜/配菜/汤品等)
- `image`: 菜品图片 (文件)

#### menus（菜单）集合

- `date`: 菜单日期 (日期)
- `type`: 菜单类型 (选择：午餐/晚餐/炖汤)
- `published`: 是否发布 (布尔值)

#### menu_items（菜单项）集合

- `menu`: 关联的菜单ID (关联)
- `dish`: 关联的菜品ID (关联)
- `order`: 显示顺序 (数字)

## 开发指南

### 代码风格

项目使用Prettier进行代码格式化，可以通过以下命令格式化代码：

```sh
pnpm format
```

### 推荐的IDE设置

- [VSCode](https://code.visualstudio.com/)
- [Volar扩展](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3支持
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TS支持

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[详细说明项目许可证信息]

## 联系方式

[提供项目维护者联系方式或问题反馈渠道]
