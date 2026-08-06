# 🏷️ Asset Management & Inventory Module

This document provides a technical guide to the Enterprise Asset Management & Inventory Module implemented in Phase 15.

---

## 📂 1. Database Model Design

The asset management system stores data in the following models:

*   **`AssetCategory`**: Groups inventory tags (e.g., Laptops, Monitors).
*   **`Vendor`**: Supplier directory records tracking purchase order partners.
*   **`Asset`**: Tracks tag, condition, serial credentials, room location, and relations.
*   **`AssetAssignment`**: Tracks employee assignment history, condition on assign, returned date/condition.
*   **`AssetTransfer`**: Tracks hardware transfers from employee A to employee B.
*   **`MaintenanceRecord`**: Schedules diagnostic tickets and records actual hardware costs.
*   **`AssetHistory`**: Chronological audit logs recording tag registrations, assignments, and returns.
*   **`PurchaseOrder`**: Links vendors with total procurement amounts.
*   **`DepreciationRecord`**: Stores monthly depreciated drops and updated book values.

---

## ⚡ 2. Core Business Logic

### 2.1 Resilient Assign & Transfer Foreign Keys
To prevent foreign key constraint violations when administrators without employee profiles assign hardware, `AssetService` automatically queries the database to match the active logged-in employee record, with fallback options to ensure successful assignment.

### 2.2 QR & Barcode Generation
Every asset created receives functional QR and Barcode graphic URLs powered by external APIs:
*   **QR Code**: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={tag}`
*   **Barcode**: `https://barcode.tec-it.com/barcode.ashx?data={tag}`

### 2.3 Mathematical Depreciation Calculator
Supports Straight Line and Declining Balance depreciation formulas:
*   **Straight Line**:
    `MonthlyDepreciation = ((Cost - SalvageValue) / UsefulLifeYears) / 12`
*   **Declining Balance (Double-Declining)**:
    `MonthlyDepreciation = (CurrentBookValue * (2.0 / UsefulLifeYears)) / 12`

Each run updates the book value in the `DepreciationRecord` table.

---

## 🔗 3. REST API Endpoints

All endpoints are protected by `authenticateUser`.

### 3.1 Assets & Catalogue
*   `GET /api/assets` — List assets
*   `POST /api/assets` — Create asset
*   `PATCH /api/assets/:id` — Update asset details
*   `DELETE /api/assets/:id` — Delete asset

### 3.2 Allocation & Lifecycle Workflows
*   `POST /api/assets/assign` — Allocate asset to employee
*   `PATCH /api/assets/return/:assignmentId` — Register returned hardware and check condition
*   `POST /api/assets/transfer` — Transfer assignment from Employee A to Employee B
*   `POST /api/assets/depreciation` — Calculate monthly depreciation records

### 3.3 Maintenance Records
*   `POST /api/maintenance` — Schedule diagnostic job
*   `PATCH /api/maintenance/:id` — Update status (e.g. Start job, Complete repair)
*   `GET /api/maintenance` — Fetch ticket list

### 3.4 Vendors Directory
*   `GET /api/vendors` — List suppliers
*   `POST /api/vendors` — Register vendor profile
