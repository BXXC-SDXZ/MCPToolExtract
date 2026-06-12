# Email-service (MCP)

一个基于 Spring Boot 的邮箱 MCP(Server) 服务，用于通过 QQ SMTP 发送邮件，并以 Spring AI MCP Server 方式暴露工具函数，便于在支持 MCP 的客户端中调用（如支持 MCP 的 IDE/Agent 等）。

## 功能
- 发送邮件：`sendEmail(toEmail, subject, messageContent)`
- 基于 Spring AI MCP Server（WebMVC/stdio）运行
- 提供 `application-stdio.yml` 与 `application-sse.yml` 两种运行配置

## 技术栈
- Java 21
- Spring Boot 3.5.x
- Spring AI MCP Server Starter
- Apache Commons Email / Jakarta Mail
- Maven

## 目录结构（节选）
- `src/main/java/com/hz/EmailServiceApplication.java`
- `src/main/java/com/hz/tools/EmailService.java`
- `src/main/resources/application.yml`
- `src/main/resources/application-stdio.yml`
- `src/main/resources/application-sse.yml`

## 先决条件
- Java 21+
- Maven 3.9+
- 可用的 QQ 邮箱账号与开启的 SMTP 授权码

## 快速开始
1) 构建
```bash
mvn -v
mvn clean package -DskipTests
```

2) 选择运行模式
- stdio 模式（默认通过 `spring.profiles.active=stdio` 启用）：适合作为 MCP stdio server 被上游工具拉起
- sse 模式：可用于 SSE 方式对接（需要上游工具支持）

3) 运行
```bash
# 默认使用 application.yml + application-stdio.yml 配置
java -jar target/Email-service-0.0.1-SNAPSHOT.jar
```

切换为 SSE 配置：
```bash
java -Dspring.profiles.active=sse -jar target/Email-service-0.0.1-SNAPSHOT.jar
```

## 配置与敏感信息处理（重要）
项目需要 `qq.username` 与 `qq.password` 来进行 SMTP 鉴权。请不要把真实账号与授权码提交到仓库！建议使用环境变量或本地未纳入版本控制的配置文件。

推荐做法：在 `application.yml` 中使用占位符，并通过环境变量传入。

建议把以下内容写入 `src/main/resources/application.yml`（或确保为占位写法）：
```yaml
qq:
  username: ${QQ_USERNAME:}
  password: ${QQ_PASSWORD:}
```

在运行前设置环境变量（Windows PowerShell 示例）：
```powershell
$env:QQ_USERNAME = "你的QQ邮箱地址"
$env:QQ_PASSWORD = "你的SMTP授权码"
java -jar target/Email-service-0.0.1-SNAPSHOT.jar
```

或在命令行中直接注入（注意命令历史风险）：
```bash
QQ_USERNAME=your@qq.com QQ_PASSWORD=your_smtp_code \
java -jar target/Email-service-0.0.1-SNAPSHOT.jar
```

可选：创建本地专用配置文件（示例 `application-local.yml`），并确保它被 `.gitignore` 忽略：
```yaml
# application-local.yml（仅本地）
qq:
  username: your@qq.com
  password: your_smtp_code
```
运行时指定：
```bash
java -Dspring.profiles.active=local -jar target/Email-service-0.0.1-SNAPSHOT.jar
```

> 如仓库中已有明文 `qq.username`/`qq.password`，请尽快替换为占位符并在 QQ 邮箱中重置授权码，以免泄漏。

## MCP 使用（简要）
服务启动后以 MCP Server 形式暴露工具，核心能力：
- `sendEmail(toEmail, subject, messageContent)`：向目标邮箱发送邮件

在支持 MCP 的客户端中，以 stdio 方式连接本服务即可调用上述工具。具体配置方式请参考你的 MCP 客户端文档。

## 测试
```bash
mvn test
```

## 许可证
根据你的需求选择合适的开源许可证并更新本节（如 MIT/Apache-2.0）。
