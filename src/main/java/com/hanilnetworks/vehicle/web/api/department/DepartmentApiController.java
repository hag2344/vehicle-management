package com.hanilnetworks.vehicle.web.api.department;

import com.hanilnetworks.vehicle.common.dto.ApiResponse;
import com.hanilnetworks.vehicle.domain.department.DepartmentService;
import com.hanilnetworks.vehicle.web.api.department.dto.DepartmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentApiController {

    private final DepartmentService departmentService;

    @GetMapping
    public ApiResponse<List<DepartmentResponse>> getActiveDepartments() {
        List<DepartmentResponse> result = departmentService.getActiveDepartments()
                .stream()
                .map(DepartmentResponse::new)
                .toList();

        return ApiResponse.success(result);
    }
}