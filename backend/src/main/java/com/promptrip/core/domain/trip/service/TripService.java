package com.promptrip.core.domain.trip.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.promptrip.core.domain.trip.dto.TripRequest;
import com.promptrip.core.domain.trip.dto.TripResponse;
import com.promptrip.core.infrastructure.UpstageClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripService {

    private final UpstageClient upstageClient;
    private final Map<String, Sinks.Many<String>> eventSinks = new ConcurrentHashMap<>();

    public TripResponse createTrip(TripRequest request) {
        String tripId = UUID.randomUUID().toString();
        Sinks.Many<String> sink = Sinks.many().replay().all();
        eventSinks.put(tripId, sink);

        // Start Async Analysis in Virtual Thread
        Thread.ofVirtual().start(() -> analyzeTripAsync(tripId, request.getPrompt()));

        return TripResponse.builder()
                .id(tripId)
                .title("Preparing: " + request.getPrompt())
                .build();
    }

    @Async
    public void analyzeTripAsync(String tripId, String prompt) {
        Sinks.Many<String> sink = eventSinks.get(tripId);
        if (sink == null) return;

        try {
            sink.tryEmitNext("Analyzing prompt: " + prompt);
            Thread.sleep(1000); // Simulate progress with Virtual Thread

            sink.tryEmitNext("Connecting to Upstage Solar LLM...");
            String aiResult = upstageClient.callSolar(prompt, status -> sink.tryEmitNext("Upstage: " + status));

            sink.tryEmitNext("Trip plan generated successfully!");
            
            // Send the raw JSON as a result event (Frontend will parse it)
            log.info("Emitting RESULT for tripId: {}", tripId);
            sink.tryEmitNext("RESULT: " + aiResult);
            sink.tryEmitComplete();
        } catch (Exception e) {
            log.error("Error during trip analysis", e);
            sink.tryEmitNext("Error: " + e.getMessage());
            sink.tryEmitComplete();
        } finally {
            // In a real app, we might keep it for a while
            // eventSinks.remove(tripId); 
        }
    }

    public Flux<String> getTripEvents(String tripId) {
        Sinks.Many<String> sink = eventSinks.get(tripId);
        if (sink != null) {
            return sink.asFlux();
        }
        return Flux.just("Error: Trip not found or expired");
    }
}
