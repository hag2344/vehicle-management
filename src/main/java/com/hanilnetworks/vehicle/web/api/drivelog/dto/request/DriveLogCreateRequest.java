package com.hanilnetworks.vehicle.web.api.drivelog.dto.request;

import jakarta.validation.constraints.Min;
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

    @NotNull(message = "부서를 입력해주세요.")
    private Long departmentId;

    @NotBlank(message = "성명을 입력해주세요.")
    private String driverName;

    @Min(value = 0, message = "주행 전 거리는 0 이상이어야 합니다.")
    @NotNull(message = "주행 전 거리를 입력해주세요.")
    private Integer startMileage;

    @Min(value = 0, message = "주행 후 거리는 0 이상이어야 합니다.")
    @NotNull(message = "주행 후 거리를 입력해주세요.")
    private Integer endMileage;

    @Min(value = 0, message = "출·퇴근용 거리는 0 이상이어야 합니다.")
    @NotNull(message = "출·퇴근용 거리를 입력해주세요.")
    private Integer commuteDistance;

    @Min(value = 0, message = "일반 업무용 거리는 0 이상이어야 합니다.")
    @NotNull(message = "일반 업무용 거리를 입력해주세요.")
    private Integer businessDistance;

    @NotBlank(message = "비고를 입력해주세요.")
    private String remarks;
}