CREATE TABLE department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '부서명 (e.g., 영업부, 개발부)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '사용 여부',
    created_at DATETIME NOT NULL COMMENT '등록일시',
    updated_at DATETIME NOT NULL COMMENT '수정일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE drive_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    drive_date DATE NOT NULL COMMENT '사용일자',
    department_id BIGINT COMMENT '부서 ID (FK 제약 없음)',
    driver_name VARCHAR(50) NOT NULL COMMENT '성명',
    start_mileage INT NOT NULL COMMENT '주행 전 계기판 거리',
    end_mileage INT NOT NULL COMMENT '주행 후 계기판 거리',
    total_distance INT NOT NULL COMMENT '주행거리 (서버 자동계산)',
    commute_distance INT NOT NULL DEFAULT 0 COMMENT '출퇴근용 거리',
    business_distance INT NOT NULL DEFAULT 0 COMMENT '일반업무용 거리',
    remarks VARCHAR(255) COMMENT '비고 (방문지 및 특이사항)',
    created_at DATETIME NOT NULL COMMENT '등록일시',
    updated_at DATETIME NOT NULL COMMENT '수정일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
