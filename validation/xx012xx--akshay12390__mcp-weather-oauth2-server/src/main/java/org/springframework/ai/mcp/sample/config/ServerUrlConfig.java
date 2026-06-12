package org.springframework.ai.mcp.sample.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServerUrlConfig {

    @Value("${HEROKU_APP_NAME:}")
    private String herokuAppName;

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public String serverUrl() {
        if (herokuAppName != null && !herokuAppName.isEmpty()) {
            return "https://" + herokuAppName + ".herokuapp.com";
        }
        return "http://localhost:" + serverPort;
    }
} 