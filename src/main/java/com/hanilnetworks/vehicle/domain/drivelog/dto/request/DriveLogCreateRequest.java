package com.hanilnetworks.vehicle.domain.drivelog.dto.request;

import com.hanilnetworks.vehicle.domain.drivelog.DriveLog;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class DriveLogCreateRequest {

    @NotNull(message = "사용일자를 입력해주세요.")
    private LocalDate driveDate;

    private Long departmentId;

    @NotBlank(message = "성명을 입력해주세요.")
    private String driverName;

    @NotNull(message = "주행 전 거리를 입력해주세요.")
    private Integer startMileage;

    @NotNull(message = "주행 후 거리를 입력해주세요.")
    private Integer endMileage;

    private Integer commuteDistance;
    private Integer businessDistance;

    private String remarks;

    public DriveLog toEntity(Integer totalDistance) {
        return DriveLog.builder()
                .driveDate(driveDate)
                .departmentId(departmentId)
                .driverName(driverName)
                .startMileage(startMileage)
                .endMileage(endMileage)
                .totalDistance(totalDistance)
                .commuteDistance(commuteDistance)
                .businessDistance(businessDistance)
                .remarks(remarks)
                .build();
    }
}
