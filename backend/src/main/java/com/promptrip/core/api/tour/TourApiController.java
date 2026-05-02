package com.promptrip.core.api.tour;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.promptrip.core.api.tour.dto.PlaceResponse;
import com.promptrip.core.global.common.ApiResult;
import com.promptrip.core.infrastructure.TourApiClient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourApiController {

    private final TourApiClient tourApiClient;

    @Operation(summary = "주변 관광지 조회", description = "특정 좌표 기준 반경 내의 관광지 목록을 가져옵니다.")
    @GetMapping("/nearby")
    public ApiResult<List<PlaceResponse>> getNearbyPlaces(
            @Parameter(description = "위도 (예: 서울시청 37.5665)", example = "37.5665")
            @RequestParam(defaultValue = "37.5665") double lat,
            
            @Parameter(description = "경도 (예: 서울시청 126.9780)", example = "126.9780")
            @RequestParam(defaultValue = "126.9780") double lng,
            
            @Parameter(description = "검색 반경 (단위: m, 최대 20000)", example = "3000")
            @RequestParam(defaultValue = "3000") int radius) {
        
        List<PlaceResponse> places = tourApiClient.fetchNearbyPlaces(lat, lng, radius);
        return ApiResult.success(places);
    }
}
