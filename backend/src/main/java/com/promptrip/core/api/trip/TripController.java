package com.promptrip.core.api.trip;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.promptrip.core.domain.trip.dto.TripRequest;
import com.promptrip.core.domain.trip.dto.TripResponse;
import com.promptrip.core.domain.trip.service.TripService;
import com.promptrip.core.global.common.ApiResult;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ApiResult<TripResponse> createTrip(@RequestBody TripRequest request) {
        TripResponse response = tripService.createTrip(request);
        return ApiResult.success(response);
    }

    @GetMapping(value = "/{id}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getTripEvents(@PathVariable String id) {
        return tripService.getTripEvents(id);
    }
}
