package com.hanilnetworks.vehicle.domain.drivelog.dto.response;

import com.hanilnetworks.vehicle.domain.drivelog.DriveLog;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class DriveLogResponse {
    private final Long id;
    private final LocalDate driveDate;
    private final Long departmentId;
    private final String driverName;
    private final Integer startMileage;
    private final Integer endMileage;
    private final Integer totalDistance;
    private final Integer commuteDistance;
    private final Integer businessDistance;
    private final String remarks;

    public DriveLogResponse(DriveLog entity) {
        this.id = entity.getId();
        this.driveDate = entity.getDriveDate();
        this.departmentId = entity.getDepartmentId();
        this.driverName = entity.getDriverName();
        this.startMileage = entity.getStartMileage();
        this.endMileage = entity.getEndMileage();
        this.totalDistance = entity.getTotalDistance();
        this.commuteDistance = entity.getCommuteDistance();
        this.businessDistance = entity.getBusinessDistance();
        this.remarks = entity.getRemarks();
    }
}
