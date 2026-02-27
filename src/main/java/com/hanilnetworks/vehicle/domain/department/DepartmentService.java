package com.hanilnetworks.vehicle.domain.department;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<Department> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrueOrderByNameAsc();
    }
}