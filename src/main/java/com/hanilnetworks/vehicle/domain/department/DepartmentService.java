package com.hanilnetworks.vehicle.domain.department;

import com.hanilnetworks.vehicle.domain.department.dto.DepartmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(DepartmentResponse::new)
                .collect(Collectors.toList());
    }
}
