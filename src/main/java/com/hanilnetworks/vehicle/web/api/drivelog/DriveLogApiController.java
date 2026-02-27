package com.hanilnetworks.vehicle.web.api.drivelog;

import com.hanilnetworks.vehicle.common.dto.ApiResponse;
import com.hanilnetworks.vehicle.common.dto.PageResponse;
import com.hanilnetworks.vehicle.domain.drivelog.DriveLog;
import com.hanilnetworks.vehicle.domain.drivelog.DriveLogService;
import com.hanilnetworks.vehicle.domain.drivelog.dto.DriveLogCreateCommand;
import com.hanilnetworks.vehicle.domain.drivelog.dto.LatestMileageInfo;
import com.hanilnetworks.vehicle.web.api.drivelog.dto.request.DriveLogCreateRequest;
import com.hanilnetworks.vehicle.web.api.drivelog.dto.response.DriveLogResponse;
import com.hanilnetworks.vehicle.web.api.drivelog.dto.response.LatestMileageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/drive-logs")
@RequiredArgsConstructor
public class DriveLogApiController {

    private final DriveLogService driveLogService;

    @GetMapping("/latest-mileage")
    public ApiResponse<LatestMileageResponse> getLatestMileage() {
        LatestMileageInfo info = driveLogService.getLatestMileage();
        return ApiResponse.success(new LatestMileageResponse(info.getLastMileage(), info.getLastDriveDate()));
    }

    @GetMapping
    public ApiResponse<PageResponse<DriveLogResponse>> getDriveLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String driverName,
            Pageable pageable) {

        Page<DriveLog> page = driveLogService.searchDriveLogs(startDate, endDate, departmentId, driverName, pageable);
        Page<DriveLogResponse> mapped = page.map(DriveLogResponse::new);

        return ApiResponse.success(new PageResponse<>(mapped));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Long> createDriveLog(@Valid @RequestBody DriveLogCreateRequest request) {
        DriveLogCreateCommand cmd = DriveLogCreateCommand.builder()
                .driveDate(request.getDriveDate())
                .departmentId(request.getDepartmentId())
                .driverName(request.getDriverName())
                .startMileage(request.getStartMileage())
                .endMileage(request.getEndMileage())
                .commuteDistance(request.getCommuteDistance())
                .businessDistance(request.getBusinessDistance())
                .remarks(request.getRemarks())
                .build();

        return ApiResponse.success(driveLogService.createDriveLog(cmd));
    }
}