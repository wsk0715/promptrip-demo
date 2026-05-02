package com.promptrip.core.api.tour.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceResponse {
    private String contentId;
    private String title;
    private String addr1;
    private String addr2;
    private String firstImage;
    private String firstImage2;
    private double mapX;
    private double mapY;
    private String tel;
    private String contentTypeId;
}
