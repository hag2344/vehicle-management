package com.hanilnetworks.vehicle.domain.drivelog;

import com.hanilnetworks.vehicle.domain.shared.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "drive_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DriveLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "drive_date")
    private LocalDate driveDate;

    // No Foreign Key Constraint, just column
    @Column(name = "department_id")
    private Long departmentId;

    @Column(nullable = false, length = 50, name = "driver_name")
    private String driverName;

    @Column(nullable = false, name = "start_mileage")
    private Integer startMileage;

    @Column(nullable = false, name = "end_mileage")
    private Integer endMileage;

    @Column(nullable = false, name = "total_distance")
    private Integer totalDistance;

    @Column(nullable = false, name = "commute_distance")
    private Integer commuteDistance;

    @Column(nullable = false, name = "business_distance")
    private Integer businessDistance;

    @Column(length = 255)
    private String remarks;

    @Builder
    public DriveLog(LocalDate driveDate, Long departmentId, String driverName,
            Integer startMileage, Integer endMileage, Integer totalDistance,
            Integer commuteDistance, Integer businessDistance, String remarks) {
        this.driveDate = driveDate;
        this.departmentId = departmentId;
        this.driverName = driverName;
        this.startMileage = startMileage;
        this.endMileage = endMileage;
        this.totalDistance = totalDistance;
        this.commuteDistance = commuteDistance != null ? commuteDistance : 0;
        this.businessDistance = businessDistance != null ? businessDistance : 0;
        this.remarks = remarks;
    }
}
