package com.hanilnetworks.vehicle.domain.department.dto;

import com.hanilnetworks.vehicle.domain.department.Department;
import lombok.Getter;

@Getter
public class DepartmentResponse {
    private final Long id;
    private final String name;

    public DepartmentResponse(Department department) {
        this.id = department.getId();
        this.name = department.getName();
    }
}
