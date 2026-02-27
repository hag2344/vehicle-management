package com.hanilnetworks.vehicle.domain.drivelog;

import com.hanilnetworks.vehicle.common.exception.BusinessException;
import com.hanilnetworks.vehicle.common.exception.ErrorCode;
import com.hanilnetworks.vehicle.domain.department.DepartmentRepository;
import com.hanilnetworks.vehicle.domain.drivelog.dto.DriveLogCreateCommand;
import com.hanilnetworks.vehicle.domain.drivelog.dto.LatestMileageInfo;
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

    public LatestMileageInfo getLatestMileage() {
        return driveLogRepository.findFirstByOrderByDriveDateDescCreatedAtDesc()
                .map(log -> new LatestMileageInfo(log.getEndMileage(), log.getDriveDate()))
                .orElseGet(() -> new LatestMileageInfo(0, null));
    }

    public Page<DriveLog> searchDriveLogs(LocalDate startDate, LocalDate endDate, Long departmentId,
                                          String driverName, Pageable pageable) {
        return driveLogRepository.searchList(startDate, endDate, departmentId, driverName, pageable);
    }

    @Transactional
    public Long createDriveLog(DriveLogCreateCommand cmd) {
        Optional<DriveLog> latestLogOpt = driveLogRepository.findFirstByOrderByDriveDateDescCreatedAtDesc();

        validateDepartment(cmd.getDepartmentId());
        validateMileage(cmd, latestLogOpt);
        validateDriveDate(cmd, latestLogOpt);
        validateDistanceCalc(cmd);

        int totalDistance = cmd.getEndMileage() - cmd.getStartMileage();

        DriveLog entity = DriveLog.builder()
                .driveDate(cmd.getDriveDate())
                .departmentId(cmd.getDepartmentId())
                .driverName(cmd.getDriverName())
                .startMileage(cmd.getStartMileage())
                .endMileage(cmd.getEndMileage())
                .totalDistance(totalDistance)
                .commuteDistance(cmd.getCommuteDistance())
                .businessDistance(cmd.getBusinessDistance())
                .remarks(cmd.getRemarks())
                .build();

        return driveLogRepository.save(entity).getId();
    }

    private void validateDepartment(Long departmentId) {
        if (departmentId != null && !departmentRepository.existsById(departmentId)) {
            throw new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND);
        }
    }

    private void validateMileage(DriveLogCreateCommand cmd, Optional<DriveLog> latestLogOpt) {
        if (cmd.getEndMileage() < cmd.getStartMileage()) {
            throw new BusinessException(ErrorCode.INVALID_END_MILEAGE);
        }

        latestLogOpt.ifPresent(latestLog -> {
            if (cmd.getStartMileage() < latestLog.getEndMileage()) {
                throw new BusinessException(ErrorCode.MILEAGE_CONFLICT);
            }
        });
    }

    private void validateDriveDate(DriveLogCreateCommand cmd, Optional<DriveLog> latestLogOpt) {
        latestLogOpt.ifPresent(latestLog -> {
            if (cmd.getDriveDate().isBefore(latestLog.getDriveDate())) {
                throw new BusinessException(ErrorCode.INVALID_DRIVE_DATE);
            }
        });
    }

    private void validateDistanceCalc(DriveLogCreateCommand cmd) {
        int totalDistance = cmd.getEndMileage() - cmd.getStartMileage();
        int commute = cmd.getCommuteDistance() != null ? cmd.getCommuteDistance() : 0;
        int business = cmd.getBusinessDistance() != null ? cmd.getBusinessDistance() : 0;

        if (commute + business > totalDistance) {
            throw new BusinessException(ErrorCode.INVALID_TOTAL_DISTANCE);
        }
    }
}