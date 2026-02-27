package com.hanilnetworks.vehicle.web.view.drivelog;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/drive-logs")
public class DriveLogViewController {

    @GetMapping
    public String list() {
        return "drive-logs/list";
    }

    @GetMapping("/new")
    public String addForm() {
        return "drive-logs/form";
    }
}
