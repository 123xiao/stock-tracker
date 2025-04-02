# 贡献指南

非常感谢您对盯盘朋友项目的兴趣！我们欢迎各种形式的贡献，不管是功能改进、bug 修复、文档完善还是其他创意想法。

## 如何贡献

1. **Fork 项目仓库**

   - 访问 [https://github.com/123xiao/stock-tracker](https://github.com/123xiao/stock-tracker)
   - 点击 "Fork" 按钮创建您自己的仓库副本

2. **克隆您的 Fork**

   ```
   git clone https://github.com/您的用户名/stock-tracker.git
   cd stock-tracker
   ```

3. **创建特性分支**

   ```
   git checkout -b feature/your-feature-name
   ```

4. **进行修改并提交**

   ```
   git add .
   git commit -m "添加了新功能：XXX"
   ```

5. **推送到您的 Fork**

   ```
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 访问您的 Fork 页面
   - 点击 "New Pull Request" 按钮
   - 选择您的特性分支
   - 填写 PR 描述，详细说明您的更改

## 开发环境设置

1. 安装依赖：

   ```
   npm install
   ```

2. 启动开发服务器：

   ```
   npm start
   ```

3. 运行 Electron 开发模式：
   ```
   npm run electron-dev
   ```

## 代码规范

- 遵循 TypeScript 的类型规范
- 保持代码风格一致
- 添加必要的注释
- 确保代码通过所有现有测试

## Bug 报告

如果您发现了 bug，请在 GitHub 上创建一个 issue，并尽可能详细地描述问题，包括：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器、操作系统等）

## 特性请求

如果您有新功能的想法，也请创建一个 issue，描述您的需求和想法。

## 许可证

通过贡献您的代码，您同意您的贡献将根据项目的 MIT 许可证进行许可。
