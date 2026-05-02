package com.promptrip.core.infrastructure;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import com.promptrip.core.api.tour.dto.PlaceResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TourApiClient {

    @Value("${tour-api.key}")
    private String serviceKey;

    @Value("${tour-api.base-url}")
    private String baseUrl;

    private final RestClient restClient;

    public TourApiClient() {
        // Essential to prevent double-encoding of Service Key for data.go.kr
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);

        this.restClient = RestClient.builder()
                .uriBuilderFactory(factory)
                .build();
    }

    public List<PlaceResponse> fetchNearbyPlaces(double lat, double lng, int radius) {
        int safeRadius = Math.min(radius, 20000);

        // Build the URI string manually to ensure Service Key is not double-encoded
        String uriString = UriComponentsBuilder.fromHttpUrl(baseUrl + "/locationBasedList2")
                .queryParam("serviceKey", serviceKey)
                .queryParam("numOfRows", 20)
                .queryParam("pageNo", 1)
                .queryParam("MobileOS", "WEB")
                .queryParam("MobileApp", "promptrip")
                .queryParam("_type", "json")
                .queryParam("arrange", "A")
                .queryParam("mapX", lng)
                .queryParam("mapY", lat)
                .queryParam("radius", safeRadius)
                .build(true) // Build as already encoded
                .toUriString();

        log.info("Requesting Tour API URI: {}", uriString);

        try {
            Map<String, Object> response = restClient.get()
                    .uri(URI.create(uriString)) // Use URI.create to bypass further encoding
                    .retrieve()
                    .body(Map.class);

            return parseResponse(response);
        } catch (Exception e) {
            log.error("Failed to fetch data from Tour API: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @SuppressWarnings("unchecked")
    private List<PlaceResponse> parseResponse(Map<String, Object> response) {
        List<PlaceResponse> places = new ArrayList<>();
        if (response == null) return places;

        try {
            Map<String, Object> res = (Map<String, Object>) response.get("response");
            Map<String, Object> body = (Map<String, Object>) res.get("body");
            
            if (body == null || body.get("items") == null || "".equals(body.get("items"))) {
                log.warn("Tour API response body or items is empty");
                return places;
            }

            Map<String, Object> itemsMap = (Map<String, Object>) body.get("items");
            Object itemObj = itemsMap.get("item");

            List<Map<String, Object>> items;
            if (itemObj instanceof List) {
                items = (List<Map<String, Object>>) itemObj;
            } else if (itemObj instanceof Map) {
                items = List.of((Map<String, Object>) itemObj);
            } else {
                return places;
            }

            for (Map<String, Object> item : items) {
                places.add(PlaceResponse.builder()
                        .contentId(String.valueOf(item.get("contentid")))
                        .title((String) item.get("title"))
                        .addr1((String) item.get("addr1"))
                        .addr2((String) item.get("addr2"))
                        .firstImage((String) item.get("firstimage"))
                        .firstImage2((String) item.get("firstimage2"))
                        .mapX(Double.parseDouble(String.valueOf(item.get("mapx"))))
                        .mapY(Double.parseDouble(String.valueOf(item.get("mapy"))))
                        .tel((String) item.get("tel"))
                        .contentTypeId(String.valueOf(item.get("contenttypeid")))
                        .build());
            }
        } catch (Exception e) {
            log.warn("Error parsing Tour API response: {}", e.getMessage(), e);
        }
        return places;
    }
}
