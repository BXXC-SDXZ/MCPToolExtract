package com.service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@SpringBootApplication
public class ServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceApplication.class, args);
	}

	@Bean
	ToolCallbackProvider toolCallbackProvider(DogAdoptionScheduler dogAdoptionScheduler){
		return MethodToolCallbackProvider
				.builder()
				.toolObjects(dogAdoptionScheduler)
				.build();
	}
}

@Component
class DogAdoptionScheduler{

	private final ObjectMapper objectMapper;

	DogAdoptionScheduler(ObjectMapper objectMapper){
		this.objectMapper = objectMapper;
	}
	@Tool(description = "schedule an appointment to adopt a " +
			"dog at Pooch Palace agenecy")
	String scheduleDogAdoption(
			@ToolParam(description = "the id of the dog id") int dogId,
			@ToolParam(description = "name of the dog") String dogName) throws JsonProcessingException {
		System.out.println("confirming appointment for [" +
				dogId+"] and [" +
				dogName +"]");
		// Logic to schedule dog adoption
		var instant = Instant.now().plus(3, ChronoUnit.DAYS);
		return objectMapper.writeValueAsString(instant);
	}
}