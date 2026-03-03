package com.hanilnetworks.vehicle.domain.drivelog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface DriveLogRepository extends JpaRepository<DriveLog, Long> {

    Optional<DriveLog> findFirstByOrderByDriveDateDescCreatedAtDescStartMileageDesc();

    @Query("SELECT d FROM DriveLog d WHERE " +
           "(:startDate IS NULL OR d.driveDate >= :startDate) AND " +
           "(:endDate IS NULL OR d.driveDate <= :endDate) AND " +
           "(:departmentId IS NULL OR d.departmentId = :departmentId) AND " +
           "(:driverName IS NULL OR :driverName = '' OR d.driverName LIKE %:driverName%) " +
           "ORDER BY d.driveDate DESC, d.createdAt DESC, d.startMileage DESC")
    Page<DriveLog> searchList(@Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate,
                              @Param("departmentId") Long departmentId,
                              @Param("driverName") String driverName,
                              Pageable pageable);
}
