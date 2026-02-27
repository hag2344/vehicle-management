package com.hanilnetworks.vehicle.domain.drivelog;

import com.hanilnetworks.vehicle.domain.department.DepartmentRepository;
import com.hanilnetworks.vehicle.domain.drivelog.dto.request.DriveLogCreateRequest;
import com.hanilnetworks.vehicle.domain.drivelog.dto.response.DriveLogResponse;
import com.hanilnetworks.vehicle.domain.drivelog.dto.response.LatestMileageResponse;
import com.hanilnetworks.vehicle.common.dto.PageResponse;
import com.hanilnetworks.vehicle.common.exception.BusinessException;
import com.hanilnetworks.vehicle.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DriveLogService {

    private final DriveLogRepository driveLogRepository;
    private final DepartmentRepository departmentRepository;

    public LatestMileageResponse getLatestMileage() {
        return driveLogRepository.findFirstByOrderByDriveDateDescCreatedAtDesc()
                .map(log -> new LatestMileageResponse(log.getEndMileage(), log.getDriveDate()))
                .orElseGet(() -> new LatestMileageResponse(0, null));
    }

    public PageResponse<DriveLogResponse> searchDriveLogs(LocalDate startDate, LocalDate endDate, Long departmentId,
            String driverName, Pageable pageable) {
        Page<DriveLogResponse> page = driveLogRepository
                .searchList(startDate, endDate, departmentId, driverName, pageable)
                .map(DriveLogResponse::new);
        return new PageResponse<>(page);
    }

    @Transactional
    public Long createDriveLog(DriveLogCreateRequest request) {
        Optional<DriveLog> latestLogOpt = driveLogRepository.findFirstByOrderByDriveDateDescCreatedAtDesc();

        validateDepartment(request.getDepartmentId());
        validateMileage(request, latestLogOpt);
        validateDriveDate(request, latestLogOpt);
        validateDistanceCalc(request);

        int totalDistance = request.getEndMileage() - request.getStartMileage();
        DriveLog saved = driveLogRepository.save(request.toEntity(totalDistance));
        return saved.getId();
    }

    private void validateDepartment(Long departmentId) {
        if (departmentId != null && !departmentRepository.existsById(departmentId)) {
            throw new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND);
        }
    }

    private void validateMileage(DriveLogCreateRequest request, Optional<DriveLog> latestLogOpt) {
        if (request.getEndMileage() < request.getStartMileage()) {
            throw new BusinessException(ErrorCode.INVALID_END_MILEAGE);
        }

        latestLogOpt.ifPresent(latestLog -> {
            if (request.getStartMileage() < latestLog.getEndMileage()) {
                throw new BusinessException(ErrorCode.MILEAGE_CONFLICT);
            }
        });
    }

    private void validateDriveDate(DriveLogCreateRequest request, Optional<DriveLog> latestLogOpt) {
        latestLogOpt.ifPresent(latestLog -> {
            if (request.getDriveDate().isBefore(latestLog.getDriveDate())) {
                throw new BusinessException(ErrorCode.INVALID_DRIVE_DATE);
            }
        });
    }

    private void validateDistanceCalc(DriveLogCreateRequest request) {
        int totalDistance = request.getEndMileage() - request.getStartMileage();
        int commute = request.getCommuteDistance() != null ? request.getCommuteDistance() : 0;
        int business = request.getBusinessDistance() != null ? request.getBusinessDistance() : 0;

        if (commute + business > totalDistance) {
            throw new BusinessException(ErrorCode.INVALID_TOTAL_DISTANCE);
        }
    }
}
