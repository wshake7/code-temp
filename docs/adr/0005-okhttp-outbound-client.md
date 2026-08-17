# java-admin：出站 HTTP 用共享 OkHttpClient

后端出站 HTTP 只走 `java-admin-infra` 装配的进程内单例 `okhttp3.OkHttpClient`。超时与连接池由 `app.http.*`（`HttpClientProperties`）绑定。

**原因**：仓库原先没有统一出站客户端；Spring Boot 4.0.7 BOM 不管理 OkHttp，Spring Framework 当前 `RestClient` 官方工厂是 Apache / Jetty / JDK，没有 OkHttp 适配。直接暴露 OkHttpClient，避免再包一层用不上的 Spring 客户端。

**约束**：

- Maven 依赖 `com.squareup.okhttp3:okhttp-jvm`（`okhttp` 制品在 Maven 下为空）。版本 pin 在父 POM `okhttp.version`。
- 调用方注入共享 Bean，不要 `new OkHttpClient()`。
- S3 继续用 AWS SDK 的 `UrlConnectionHttpClient`，本决策不覆盖对象存储。

**不做**：RestTemplate / WebClient / Feign / Retrofit；把 OkHttp 接到 `RestClient`；通用 `HttpPort`；日志拦截器与自动重试。
