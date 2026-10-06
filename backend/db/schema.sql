-- ============================================================
-- Ψηφιακή Σήμανση ΤΠΤΕ · Πανεπιστήμιο Αιγαίου
-- MySQL / MariaDB 10.4+ (XAMPP). Τρέχει με: npm run db:setup
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(120) NOT NULL,
    `email`         VARCHAR(190) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role`          ENUM('admin','user') NOT NULL DEFAULT 'user',
    `active`        TINYINT(1)   NOT NULL DEFAULT 1,
    `last_login_at` DATETIME     DEFAULT NULL,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `buildings` (
    `id`             VARCHAR(16)  NOT NULL,
    `code`           VARCHAR(32)  DEFAULT NULL,           -- δημόσιο slug: /b/1
    `published`      TINYINT(1)   NOT NULL DEFAULT 1,
    `phone`          VARCHAR(64)  DEFAULT NULL,
    `email`          VARCHAR(190) DEFAULT NULL,
    `website`        VARCHAR(500) DEFAULT NULL,
    `lat`            DECIMAL(9,6) DEFAULT NULL,
    `lng`            DECIMAL(9,6) DEFAULT NULL,
    `name_el`        VARCHAR(255) NOT NULL DEFAULT '',
    `name_en`        VARCHAR(255) NOT NULL DEFAULT '',
    `island_el`      VARCHAR(120) NOT NULL DEFAULT '',
    `island_en`      VARCHAR(120) NOT NULL DEFAULT '',
    `school_el`      VARCHAR(255) NOT NULL DEFAULT '',
    `school_en`      VARCHAR(255) NOT NULL DEFAULT '',
    `address_el`     VARCHAR(255) NOT NULL DEFAULT '',
    `address_en`     VARCHAR(255) NOT NULL DEFAULT '',
    `notes_el`       TEXT         DEFAULT NULL,
    `notes_en`       TEXT         DEFAULT NULL,
    `departments_el` TEXT         DEFAULT NULL,           -- JSON array
    `departments_en` TEXT         DEFAULT NULL,           -- JSON array
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by`     INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_buildings_code` (`code`),
    CONSTRAINT `fk_buildings_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `offices` (
    `id`            VARCHAR(16)  NOT NULL,
    `code`          VARCHAR(32)  DEFAULT NULL,            -- δημόσιο slug: /o/1.1.1 (μοναδικό)
    `building_id`   VARCHAR(16)  DEFAULT NULL,
    `kind`          ENUM('office','lab','room') NOT NULL DEFAULT 'office',
    `published`     TINYINT(1)   NOT NULL DEFAULT 1,
    `phone`         VARCHAR(64)  DEFAULT NULL,
    `email`         VARCHAR(190) DEFAULT NULL,
    `label_el`      VARCHAR(255) NOT NULL DEFAULT '',
    `label_en`      VARCHAR(255) NOT NULL DEFAULT '',
    `occupant_el`   VARCHAR(255) NOT NULL DEFAULT '',
    `occupant_en`   VARCHAR(255) NOT NULL DEFAULT '',
    `title_el`      VARCHAR(255) NOT NULL DEFAULT '',
    `title_en`      VARCHAR(255) NOT NULL DEFAULT '',
    `department_el` VARCHAR(255) NOT NULL DEFAULT '',
    `department_en` VARCHAR(255) NOT NULL DEFAULT '',
    `notes_el`      TEXT         DEFAULT NULL,
    `notes_en`      TEXT         DEFAULT NULL,
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by`    INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_offices_code` (`code`),
    KEY `idx_offices_building` (`building_id`),
    KEY `idx_offices_published` (`published`),
    CONSTRAINT `fk_offices_building` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_offices_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_log` (
    `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`    INT UNSIGNED DEFAULT NULL,
    `action`     VARCHAR(32)  NOT NULL,                   -- create | update | delete | login
    `entity`     VARCHAR(32)  NOT NULL,                   -- office | building | user
    `entity_id`  VARCHAR(32)  DEFAULT NULL,
    `summary`    VARCHAR(255) NOT NULL DEFAULT '',
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_activity_created` (`created_at`),
    CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `login_attempts` (
    `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ip`           VARCHAR(64)  NOT NULL,
    `email`        VARCHAR(190) NOT NULL DEFAULT '',
    `attempted_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_attempts_ip_time` (`ip`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
