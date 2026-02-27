package com.hanilnetworks.vehicle.common.dto;

import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class ErrorResponse {
    private final String code;
    private final String message;
    private final List<String> details;
    private final Map<String, String> fields;

    public ErrorResponse(String code, String message) {
        this(code, message, null, null);
    }

    public ErrorResponse(String code, String message, List<String> details) {
        this(code, message, details, null);
    }

    public ErrorResponse(String code, String message, List<String> details, Map<String, String> fields) {
        this.code = code;
        this.message = message;
        this.details = details;
        this.fields = fields;
    }
}
