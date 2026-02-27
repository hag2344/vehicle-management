package com.hanilnetworks.vehicle.domain.drivelog.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class LatestMileageInfo {
    private final Integer lastMileage;
    private final LocalDate lastDriveDate;

    public LatestMileageInfo(Integer lastMileage, LocalDate lastDriveDate) {
        this.lastMileage = lastMileage;
        this.lastDriveDate = lastDriveDate;
    }
}