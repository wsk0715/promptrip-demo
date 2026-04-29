package com.promptrip.core.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private String message;
    private int status;
    private String code;
    private Object details;

    public ApiError(String message, int status) {
        this.message = message;
        this.status = status;
    }
}
