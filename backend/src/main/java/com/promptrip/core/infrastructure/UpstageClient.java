package com.promptrip.core.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Slf4j
@Component
public class UpstageClient {

    @Value("${UPSTAGE_API_KEY}")
    private String apiKey;

    private final RestClient restClient;

    public UpstageClient() {
        // Configure timeouts via HttpClient
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
                
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(30));

        this.restClient = RestClient.builder()
                .baseUrl("https://api.upstage.ai/v1/solar")
                .requestFactory(requestFactory)
                .build();
    }

    public String callSolar(String prompt, Consumer<String> statusCallback) {
        statusCallback.accept("Sending request to Solar-1-mini...");
        
        try {
            Map<String, Object> body = Map.of(
                "model", "solar-1-mini-chat",
                "messages", List.of(
                    Map.of("role", "system", "content", "You are a travel planner. Return ONLY a JSON object in this format: " +
                        "{\"title\": \"string\", \"plans\": [{\"day\": number, \"items\": [{\"time\": \"string\", \"location\": \"string\", \"description\": \"string\"}]}]}"),
                    Map.of("role", "user", "content", prompt)
                )
            );

            log.info("Calling Upstage Solar API for prompt: {}", prompt);

            String response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            log.debug("Raw AI Response: {}", response);
            
            // Extract content using Jackson
            com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            statusCallback.accept("Response received from AI.");
            return content;
        } catch (RestClientResponseException e) {
            log.error("AI API Error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI API Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to call Upstage API: {}", e.getMessage());
            throw new RuntimeException("AI integration failed: " + e.getMessage());
        }
    }
}
