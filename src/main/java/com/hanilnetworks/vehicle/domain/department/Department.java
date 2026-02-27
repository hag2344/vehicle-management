package com.hanilnetworks.vehicle.domain.department;

import com.hanilnetworks.vehicle.domain.shared.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "department")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, name = "is_active")
    private Boolean isActive = true;

    public Department(String name) {
        this.name = name;
        this.isActive = true;
    }
}
