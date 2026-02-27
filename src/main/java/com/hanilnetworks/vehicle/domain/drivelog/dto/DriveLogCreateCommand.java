package com.hanilnetworks.vehicle.domain.drivelog.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DriveLogCreateCommand {
    private final LocalDate driveDate;
    private final Long departmentId;
    private final String driverName;
    private final Integer startMileage;
    private final Integer endMileage;
    private final Integer commuteDistance;
    private final Integer businessDistance;
    private final String remarks;
}