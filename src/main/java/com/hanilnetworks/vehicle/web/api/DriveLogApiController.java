package com.hanilnetworks.vehicle.web.api;

import com.hanilnetworks.vehicle.common.dto.ApiResponse;
import com.hanilnetworks.vehicle.common.dto.PageResponse;
import com.hanilnetworks.vehicle.domain.drivelog.DriveLogService;
import com.hanilnetworks.vehicle.domain.drivelog.dto.request.DriveLogCreateRequest;
import com.hanilnetworks.vehicle.domain.drivelog.dto.response.DriveLogResponse;
import com.hanilnetworks.vehicle.domain.drivelog.dto.response.LatestMileageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
        return ApiResponse.success(driveLogService.getLatestMileage());
    }

    @GetMapping
    public ApiResponse<PageResponse<DriveLogResponse>> getDriveLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String driverName,
            Pageable pageable) {
        return ApiResponse
                .success(driveLogService.searchDriveLogs(startDate, endDate, departmentId, driverName, pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Long> createDriveLog(@Valid @RequestBody DriveLogCreateRequest request) {
        return ApiResponse.success(driveLogService.createDriveLog(request));
    }
}
