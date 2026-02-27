package com.hanilnetworks.vehicle.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INVALID_DRIVE_DATE(HttpStatus.BAD_REQUEST, "사용일자는 마지막 저장된 날짜와 같거나 이후여야 합니다."),
    INVALID_END_MILEAGE(HttpStatus.BAD_REQUEST, "주행 후 거리는 주행 전 거리보다 크거나 같아야 합니다."),
    INVALID_TOTAL_DISTANCE(HttpStatus.BAD_REQUEST, "총 주행거리는 출퇴근용 및 업무용 거리의 합보다 크거나 같아야 합니다."),
    MILEAGE_CONFLICT(HttpStatus.CONFLICT, "최신 주행 후 계기판 거리와 불일치합니다. 새로고침 후 다시 작성하세요."),
    DEPARTMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 부서입니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
