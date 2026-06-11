/*
 * Copyright 2024 - 2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.springframework.ai.mcp.sample.server;

import java.util.List;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import io.modelcontextprotocol.server.McpServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import io.modelcontextprotocol.spec.McpSchema.GetPromptResult;
import io.modelcontextprotocol.spec.McpSchema.PromptMessage;
import io.modelcontextprotocol.spec.McpSchema.Role;
import io.modelcontextprotocol.spec.McpSchema.TextContent;

@SpringBootApplication
@ComponentScan(basePackages = {
	"org.springframework.ai.mcp.sample.server",
	"org.springframework.ai.mcp.sample.config",
	"org.springframework.ai.mcp.sample.controller",
	"org.springframework.ai.mcp.sample.service",
	"org.springframework.ai.mcp.sample.repository"
})
@EntityScan("org.springframework.ai.mcp.sample.entity")
@EnableJpaRepositories("org.springframework.ai.mcp.sample.repository")
public class McpServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(McpServerApplication.class, args);
	}

	@Bean
	public ToolCallbackProvider weatherTools(WeatherService weatherService) {
		return MethodToolCallbackProvider.builder().toolObjects(weatherService).build();
	}

	@Bean
	public List<McpServerFeatures.SyncPromptSpecification> myPrompts() {
		var prompt = new McpSchema.Prompt("greeting", "A friendly greeting prompt",
			List.of(new McpSchema.PromptArgument("name", "The name to greet", true)));

		var promptSpecification = new McpServerFeatures.SyncPromptSpecification(prompt, (exchange, getPromptRequest) -> {
			String nameArgument = (String) getPromptRequest.arguments().get("name");
			if (nameArgument == null) { 
				nameArgument = "friend"; 
			}
			var userMessage = new PromptMessage(Role.USER, new TextContent("Hello " + nameArgument + "! How can I assist you today?"));
			return new GetPromptResult("A personalized greeting message", List.of(userMessage));
		});

    	return List.of(promptSpecification);
	}
}
