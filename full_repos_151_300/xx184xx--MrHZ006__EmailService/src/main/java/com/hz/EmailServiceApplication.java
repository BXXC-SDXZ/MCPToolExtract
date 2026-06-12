package com.hz;

import com.hz.tools.EmailService;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EmailServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmailServiceApplication.class, args);
    }
    @Bean
    public ToolCallbackProvider toolCallbackProvider( EmailService emailService) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(emailService)
                .build();
    }
}
