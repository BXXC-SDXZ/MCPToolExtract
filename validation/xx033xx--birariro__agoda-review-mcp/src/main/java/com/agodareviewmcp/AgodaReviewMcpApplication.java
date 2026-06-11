package com.agodareviewmcp;

import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AgodaReviewMcpApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgodaReviewMcpApplication.class, args);
    }

    @Bean
    public ToolCallbackProvider reviewTools(ReviewService reviewService) {
        return MethodToolCallbackProvider.builder().toolObjects(reviewService).build();
    }

}
