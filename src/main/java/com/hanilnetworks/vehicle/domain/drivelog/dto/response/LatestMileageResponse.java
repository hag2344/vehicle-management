package com.hanilnetworks.vehicle.domain.drivelog.dto.response;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class LatestMileageResponse {
    private final Integer lastMileage;
    private final LocalDate lastDriveDate;

    public LatestMileageResponse(Integer lastMileage, LocalDate lastDriveDate) {
        this.lastMileage = lastMileage;
        this.lastDriveDate = lastDriveDate;
    }
}
