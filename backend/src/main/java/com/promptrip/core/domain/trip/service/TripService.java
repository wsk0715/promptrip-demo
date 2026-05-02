package com.promptrip.core.domain.trip.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.io.IOException;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.promptrip.core.domain.trip.dto.TripRequest;
import com.promptrip.core.domain.trip.dto.TripResponse;
import com.promptrip.core.infrastructure.UpstageClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripService {

    private final UpstageClient upstageClient;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public TripResponse createTrip(TripRequest request) {
        String tripId = UUID.randomUUID().toString();
        
        // Start Async Analysis in Virtual Thread
        Thread.ofVirtual().start(() -> analyzeTripAsync(tripId, request.getPrompt()));

        return TripResponse.builder()
                .id(tripId)
                .title(request.getPrompt() + " 여행 계획")
                .build();
    }

    private void analyzeTripAsync(String tripId, String prompt) {
        upstageClient.callSolar(prompt, status -> sendLog(tripId, status));
        sendLog(tripId, "Analysis completed.");
        completeEmitter(tripId);
    }

    private void sendLog(String tripId, String message) {
        SseEmitter emitter = emitters.get(tripId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("message")
                    .data(message));
            } catch (IOException e) {
                emitters.remove(tripId);
            }
        }
    }

    private void completeEmitter(String tripId) {
        SseEmitter emitter = emitters.remove(tripId);
        if (emitter != null) {
            emitter.complete();
        }
    }

    public SseEmitter getTripEvents(String tripId) {
        SseEmitter emitter = new SseEmitter(60000L); // 1 minute timeout
        emitters.put(tripId, emitter);
        
        emitter.onCompletion(() -> emitters.remove(tripId));
        emitter.onTimeout(() -> emitters.remove(tripId));
        
        try {
            emitter.send(SseEmitter.event().name("connected").data("Connected to trip events"));
        } catch (IOException e) {
            emitters.remove(tripId);
        }
        
        return emitter;
    }
}
