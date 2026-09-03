# Borrowing & Equipment Lifecycle

This document explains the lifecycle of equipment items and borrowing transactions in BroadTrack.

---

## Booking State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Student Submits Cart

    Pending --> Approved: Admin Approves Request
    Pending --> Rejected: Admin Rejects Request
    Pending --> Cancelled: Student Cancels Request

    Approved --> Released: Admin Scans Barcode & Releases Equipment
    Approved --> Cancelled: Booking Cancelled Before Release

    Released --> Returned: Equipment Inspected & Returned
    Released --> Overdue: Return Deadline Passed Without Return

    Overdue --> Returned: Late Equipment Returned

    Rejected --> [*]
    Cancelled --> [*]
    Returned --> [*]
```

---

## 1. Booking Status Definitions

| Status          | Description                                                          | Equipment Availability                               |
| --------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| **`Pending`**   | Student submitted a request; awaiting administrator approval.        | Equipment is temporarily reserved.                   |
| **`Approved`**  | Administrator approved the request; ticket ID and barcode generated. | Equipment is reserved for the scheduled time window. |
| **`Rejected`**  | Administrator rejected the request (with optional notes).            | Equipment is released back to available stock.       |
| **`Released`**  | Student picked up the equipment; admin confirmed physical release.   | Equipment is marked `In Use`.                        |
| **`Returned`**  | Equipment returned and inspected; transaction completed.             | Equipment returns to `Available`.                    |
| **`Cancelled`** | Booking cancelled by student or admin before release.                | Equipment released back to available stock.          |

---

## 2. Equipment Status Definitions

In [`EquipmentStatus.php`](file:///home/sam/git/broadtrack/backend/app/Enums/EquipmentStatus.php):

- **`Available` (`available`)**: In stock and ready to be borrowed.
- **`Booked` (`booked`)**: Reserved by an approved booking for an upcoming reservation window.
- **`Borrowed` (`borrowed`)**: Currently released to a student and in active use.
- **`Maintenance` (`maintenance`)**: Defective or undergoing repair. Excluded from booking availability checks.

---

## 3. Data Integrity & Validation Guards

- **Cart Requirement (`min:1`):** In [`StoreBookingRequest.php`](file:///home/sam/git/broadtrack/backend/app/Http/Requests/Api/V1/StoreBookingRequest.php), booking requests require at least one equipment item (`equipment_ids: required|array|min:1`).
- **Deletion Protection:** In [`EquipmentController.php`](file:///home/sam/git/broadtrack/backend/app/Http/Controllers/Api/V1/EquipmentController.php), equipment cannot be deleted if it is currently booked/borrowed or has historical booking records (`422 Unprocessable Entity`), preserving transaction history and audit slips.
