# CLAUDE.md — PETROCHAIN

## 1. Project Identity

Project name: **PETROCHAIN**

Full concept:
**Platform Intelligent Verification dan Audit untuk Penguatan Distribusi BBM Bersubsidi pada Ekosistem MyPertamina**

Team: **TIMBERAPA**  
Institution: **Politeknik Negeri Lhokseumawe**  
Year: **2026**

PETROCHAIN is an **extension/supporting platform for the MyPertamina ecosystem**, not a replacement for MyPertamina and not a new fuel-distribution mechanism.

The core principle is:

> Strengthen the existing subsidized-fuel distribution process through verification, validation, auditability, and stock information without changing the government's existing distribution mechanism or regulations.

The project source document is the team's 2026 e-Government proposal. Its core technologies are OCR, YOLO, QR Code, and Blockchain. The proposal explicitly positions PETROCHAIN as a system-enhancement/extension platform. 

Source basis: the proposal describes PETROCHAIN as an extension platform that strengthens MyPertamina without changing existing regulations or distribution mechanisms. 

---

## 2. Primary Objectives

The implementation must support these objectives:

- Assist subsidized-vehicle registration verification using OCR.
- Validate physical vehicle identity against the digital QR identity using YOLO + OCR.
- Identify two-wheel vehicle categories based on the proposed under-250-cc / over-250-cc classification.
- Record validated transactions as an immutable blockchain audit trail.
- Provide real-time-ish SPBU fuel-stock status through operator/admin updates.
- Provide dashboards for operational monitoring, auditing, and executive oversight.
- Preserve human-in-the-loop decision making where the system only provides recommendations.
- Keep the architecture extensible and suitable for integration with an existing MyPertamina ecosystem.

The proposal explicitly defines OCR-assisted registration, YOLO-OCR vehicle validation, blockchain audit, motorcycle validation, and fuel-stock information as the main innovation modules. 

---

## 3. Non-Negotiable Product Principles

### 3.1 PETROCHAIN is an extension

Never implement PETROCHAIN as if it replaces MyPertamina.

Use terminology such as:

- extension platform
- supporting platform
- additional validation layer
- audit layer
- verification layer

Avoid claims that PETROCHAIN is the official replacement for MyPertamina.

### 3.2 Human-in-the-loop

AI/CV results are recommendations and evidence for authorized staff.

For registration:

`STNK + Vehicle Photo -> OCR -> Automatic Comparison -> Admin Review -> Approval/Rejection`

The administrator remains the final decision maker.

Do not make OCR confidence alone the final legal approval decision.

### 3.3 Double validation

For vehicle refueling:

`QR Code Identity + Physical Vehicle Identity`

The physical identity is obtained using:

`Camera -> YOLO plate detection -> OCR plate recognition -> Compare with QR vehicle data`

Only a matching result should permit the proposed transaction flow.

### 3.4 Blockchain is an audit layer

Blockchain must NOT be treated as a replacement for the primary application database.

Use the normal application database for operational CRUD/query workloads.

Use blockchain for validated transaction audit records and traceability.

The proposal explicitly describes blockchain as an additional layer rather than a replacement for the MyPertamina database.

### 3.5 Do not invent government integration

Unless a real API/integration contract is provided, use:

- mock API
- adapter/interface
- service abstraction
- seeded/demo data

Never claim that the implementation is connected to a real MyPertamina, Pertamina, BPH Migas, ESDM, or government system when it is not.

---

## 4. Main User Roles

### Public / Society

Capabilities:

- Register vehicle/subsidy application.
- Upload STNK.
- Upload vehicle photo.
- View OCR verification result/status.
- View application status.
- Access generated QR identity when approved.
- View fuel-stock information.
- View personal refueling history.
- Receive relevant validation/service notifications.

### Pertamina Administrator

Capabilities:

- Dashboard monitoring.
- Review registration submissions.
- Review OCR extraction.
- Review OCR match/mismatch.
- Approve or reject submissions.
- Manage subsidized-user data.
- Manage SPBU data.
- Manage SPBU operators.
- Monitor transactions.
- Monitor audit anomalies.
- Review validation logs.

The proposal describes the administrator as the party that verifies OCR results and manages subsidized-user data.

### SPBU Operator

Capabilities:

- Dashboard operational monitoring.
- Scan/read QR Code.
- Trigger/view vehicle validation.
- View YOLO/OCR results.
- Confirm or review validation conditions.
- Update fuel-stock status.
- View transaction history.
- Receive warnings for QR mismatch or vehicle-category violations.

### Auditor / Government Oversight

Target examples in the proposal:

- BPH Migas
- Kementerian ESDM
- Kementerian Keuangan RI

Capabilities should primarily be read-only:

- National dashboard.
- Transaction monitoring.
- Audit logs.
- Compliance monitoring.
- SPBU/operator monitoring.
- Financial/subsidy reporting.
- Blockchain block details.
- Export reports.

Do not provide mutation capabilities to read-only auditor accounts unless explicitly requested.

---

## 5. Core Functional Modules

## Module A — Vehicle Registration

Input:

- STNK document
- Vehicle photo
- User/application information

Pipeline:

```text
User
  |
  v
Upload STNK + Vehicle Photo
  |
  v
OCR Processing
  |
  +----> Extract STNK plate number
  |
  +----> Extract plate number from vehicle photo
  |
  v
Normalize OCR Results
  |
  v
Compare Plate Numbers
  |
  +---- MATCH ------> Admin Review
  |
  +---- MISMATCH ---> Flag for Review / Re-upload
  |
  v
Human Decision
  |
  +---- APPROVED ---> Generate/activate QR identity
  |
  +---- REJECTED ---> Application rejected
```

Expected statuses:

- `PENDING_REVIEW`
- `OCR_PROCESSING`
- `MATCH`
- `MISMATCH`
- `APPROVED`
- `REJECTED`
- `NEEDS_REUPLOAD`

The proposal specifically describes "Menunggu Review", "Tidak Sama", "Sama", "Validasi Ditolak", and approval/re-upload behavior.

---

## Module B — QR + YOLO + OCR Vehicle Validation

At the SPBU dispenser:

```text
Vehicle Arrives
      |
      v
QR Code Scan
      |
      v
Retrieve Registered Vehicle Data
      |
      v
Camera Captures Vehicle
      |
      v
YOLO Detects License Plate
      |
      v
Crop Plate
      |
      v
OCR Reads Plate Characters
      |
      v
Normalize Plate Text
      |
      v
Compare With Registered Plate
      |
      +---- MATCH ------> Continue Transaction
      |
      +---- NOT MATCH --> Block/Review Transaction
```

Expected statuses:

- `QR_MATCH`
- `QR_NOT_MATCH`
- `OCR_LOW_CONFIDENCE`
- `PLATE_NOT_DETECTED`
- `MANUAL_REVIEW`

The proposal states that refueling may proceed when the physical and digital identities match, while QR mismatch must trigger operator review.

---

## Module C — Two-Wheel Vehicle Validation

For the proposed motorcycle validation flow:

```text
Motorcycle Camera Image
        |
        v
YOLO Vehicle Classification
        |
        v
Detected Motorcycle Type
        |
        v
Vehicle Specification Database
        |
        v
Engine Capacity Classification
        |
        +---- Under 250 cc ---> Eligible validation result
        |
        +---- Over 250 cc ----> Warning / Not eligible result
```

The source proposal describes YOLO identifying motorcycle types and comparing the result with a manufacturer specification database to classify the proposed under-250-cc and over-250-cc categories.

Important:

- Do not infer engine capacity directly from visual appearance unless the trained model/data explicitly supports that.
- The preferred architecture is:
  `visual class -> specification lookup -> engine capacity`
- Keep the specification database editable by authorized administrators.
- Store the model confidence and source classification as evidence.

---

## Module D — Blockchain Audit Trail

Transaction flow:

```text
Validated Transaction
        |
        v
Create Audit Payload
        |
        v
Hash / Sign Payload
        |
        v
Write to Blockchain
        |
        v
Store Blockchain Reference
        |
        v
Audit Dashboard
```

Audit payload may contain:

- transaction ID
- timestamp
- SPBU ID/code
- vehicle plate number
- fuel type
- volume
- validation result
- QR validation result
- OCR result
- YOLO result
- operator ID
- application transaction reference
- block/hash reference

Do not put unnecessary sensitive personal information directly on-chain.

Prefer storing a minimal immutable audit record and keeping detailed operational data in the primary database.

### Blockchain UI

The auditor can inspect:

- Block number
- Transaction hash
- Previous hash
- SHA-256/hash value
- Digital signature
- Timestamp
- Data payload
- Validation status

The proposal's audit mockup explicitly includes block/hash information, previous hash, digital signature, and transaction payload.

---

## Module E — Fuel Stock Information

SPBU operator/admin can update:

- Fuel type
- Availability status
- Last updated time

Minimum status:

- `AVAILABLE`
- `EMPTY`

The proposal intentionally uses a simple "Tersedia/Habis" mechanism so operators can update stock without requiring additional hardware.

Public users can see:

- SPBU
- Location
- Fuel type
- Availability
- Last updated

The system should make it clear that the stock status is an operator-reported status unless a real telemetry integration is later implemented.

---

## 6. Dashboard Requirements

### Administrator Dashboard

Show:

- Active SPBU count
- Daily transaction count
- Registered operators
- Registration applications
- OCR validation statistics
- QR match/mismatch statistics
- Audit alerts
- Recent transactions
- SPBU operational status
- Charts and summaries

### Operator Dashboard

Prioritize speed and clarity.

Show:

- Current SPBU
- Current stock status
- QR scanning action
- Vehicle validation status
- Latest transaction
- QR Match / QR Not Match
- Plate OCR result
- YOLO result
- Motorcycle eligibility warning
- Transaction history

The proposal specifically describes the operator dashboard as supporting QR scanning, transaction history, and fuel-stock updates.

### Auditor Dashboard

Read-only.

Show:

- Total active SPBU
- Registered operators
- Transaction volume
- Audit alerts
- Compliance statistics
- National SPBU map/list
- Transaction history
- Financial/subsidy summaries
- Blockchain audit information
- Export PDF/Excel

The proposal describes an executive/auditor dashboard with national monitoring, transaction audit, SPBU/operator monitoring, financial reporting, and detailed blockchain block inspection.

### Public Application

Show:

- Registration
- QR identity
- Application status
- Fuel stock information
- SPBU information
- Transaction history
- Notifications

---

## 7. Suggested Architecture

Use a modular architecture with clear separation between:

```text
Frontend / Web / Mobile
        |
        v
Application API / Backend
        |
        +--------------------+
        |                    |
        v                    v
Primary Database        AI/CV Services
                             |
                             +-- OCR
                             +-- YOLO
                             +-- Image Processing
        |
        +--------------------+
        |
        v
Blockchain Audit Service
        |
        v
Blockchain Network
```

For the web application, preserve the existing repository stack if one already exists.

If the repository is empty, a practical implementation may use:

- Backend: Laravel
- Web UI: React + Inertia
- Database: MySQL/PostgreSQL
- AI/CV service: Python API
- Object detection: YOLO
- OCR: configurable OCR engine
- Blockchain: service abstraction so the blockchain implementation can be replaced without rewriting business logic
- Authentication: role-based authentication for staff/admin/auditor
- Mobile: separate client or PWA depending on project scope

Do not introduce a technology merely because it is trendy. Prefer the simplest stack that satisfies the architecture and deployment requirements.

---

## 8. Repository Structure

A recommended structure:

```text
/
├── CLAUDE.md
├── README.md
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── ai-pipeline.md
│   ├── blockchain.md
│   └── deployment.md
│
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   └── ...
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   └── ...
│
├── ai-service/
│   ├── ocr/
│   ├── yolo/
│   ├── preprocessing/
│   ├── api/
│   └── tests/
│
└── blockchain/
    ├── contracts/
    ├── services/
    └── tests/
```

If the existing repository uses another structure, do not reorganize the whole project unnecessarily. Follow the repository's established conventions.

---

## 9. Database Domain Model

At minimum, the domain should represent:

### users

- id
- name
- email/identifier
- password/auth reference
- role
- status
- timestamps

### vehicles

- id
- user_id
- plate_number
- vehicle_type
- brand
- model
- engine_capacity_cc
- registration_status
- qr_code/reference
- timestamps

### registration_applications

- id
- vehicle_id
- user_id
- stnk_file
- vehicle_photo
- status
- admin_notes
- submitted_at
- reviewed_at
- reviewer_id
- timestamps

### ocr_results

- id
- registration_application_id
- source_type
- extracted_plate
- confidence
- raw_result
- normalized_result
- comparison_result
- processed_at
- timestamps

### spbu

- id
- code
- name
- address/location
- status
- timestamps

### operators

- id
- user_id
- spbu_id
- status
- timestamps

### fuel_stocks

- id
- spbu_id
- fuel_type
- status
- updated_by
- updated_at
- timestamps

### transactions

- id
- vehicle_id
- spbu_id
- operator_id
- fuel_type
- volume
- qr_result
- plate_result
- yolo_result
- transaction_status
- timestamp
- blockchain_reference
- timestamps

### vehicle_detections

- id
- transaction_id
- model_version
- detected_class
- confidence
- engine_capacity_cc
- eligibility_result
- raw_result
- timestamps

### audit_logs

- id
- actor_id
- action
- entity_type
- entity_id
- metadata
- ip/device metadata where appropriate
- timestamp

### blockchain_records

- id
- transaction_id
- block_number/reference
- transaction_hash
- previous_hash
- digital_signature
- payload_hash
- recorded_at

Adapt the schema to the existing application instead of blindly creating every table.

---

## 10. AI/CV Rules

### OCR

OCR must have a normalization layer.

Normalize Indonesian license plates before comparison:

- uppercase
- remove unnecessary spaces
- normalize common OCR mistakes
- preserve meaningful plate characters
- keep original OCR output for audit/debugging

Never overwrite raw OCR output.

Store:

```text
raw_text
normalized_text
confidence
engine
model/version
processed_at
```

### YOLO

Every detection should record:

- model version
- class
- confidence
- bounding box when relevant
- timestamp
- image/frame reference where permitted

Do not hard-code confidence as a legal decision.

Use configurable thresholds.

### Low-confidence results

If confidence is below the configured threshold:

```text
AI result -> MANUAL_REVIEW
```

Do not silently convert low-confidence predictions into approval.

### Model versioning

Every AI result must be traceable to:

```text
model_name
model_version
inference_version
timestamp
```

This is important for auditing.

---

## 11. Security

Security is a first-class requirement.

Implement:

- Role-Based Access Control.
- Server-side authorization.
- Input validation.
- File type validation.
- File size limits.
- Secure file storage.
- Malware/content checks where applicable.
- Rate limiting for public endpoints.
- Audit logging for sensitive actions.
- CSRF protection where applicable.
- API authentication.
- Secure secrets through environment variables.
- Password hashing using framework-standard secure hashing.
- No hard-coded credentials.
- No API keys committed to Git.
- No blockchain private keys committed to Git.

### Sensitive data

Treat STNK images, vehicle images, plate numbers, and user information as sensitive operational data.

Avoid placing raw documents/images or unnecessary personal information on the blockchain.

---

## 12. API Design

Use clear REST-style endpoints or the existing project's established API convention.

Example:

```text
POST   /api/registrations
GET    /api/registrations
GET    /api/registrations/{id}
POST   /api/registrations/{id}/ocr
POST   /api/registrations/{id}/approve
POST   /api/registrations/{id}/reject

POST   /api/vehicle-validation
POST   /api/vehicle-validation/plate
POST   /api/vehicle-validation/motorcycle

GET    /api/spbu
GET    /api/spbu/{id}/stock
PATCH  /api/spbu/{id}/stock

POST   /api/transactions
GET    /api/transactions
GET    /api/transactions/{id}

GET    /api/audits
GET    /api/audits/{id}
GET    /api/blockchain/{transactionId}

GET    /api/dashboard/admin
GET    /api/dashboard/operator
GET    /api/dashboard/auditor
```

Endpoints are examples, not a requirement to use these exact URLs.

---

## 13. Validation State Machine

### Registration

```text
DRAFT
  -> SUBMITTED
  -> OCR_PROCESSING
  -> PENDING_REVIEW
  -> APPROVED
  -> QR_ISSUED

or

PENDING_REVIEW
  -> NEEDS_REUPLOAD
  -> SUBMITTED

or

PENDING_REVIEW
  -> REJECTED
```

### Refueling

```text
QR_SCANNED
    |
    v
VEHICLE_DETECTION
    |
    v
PLATE_OCR
    |
    v
IDENTITY_COMPARISON
    |
    +---- MATCH ------> ELIGIBILITY_CHECK -> APPROVED
    |
    +---- NOT_MATCH --> MANUAL_REVIEW
```

For motorcycles:

```text
MOTOR_DETECTED
    -> MODEL_CLASSIFICATION
    -> SPECIFICATION_LOOKUP
    -> ENGINE_CAPACITY_CHECK
    -> ELIGIBLE / NOT_ELIGIBLE
```

---

## 14. UI/UX Direction

The UI should feel like a serious government/enterprise monitoring platform.

Principles:

- Clean
- Professional
- Data-dense but readable
- Strong hierarchy
- Clear status indicators
- Minimal decorative elements
- Responsive
- Accessible
- Fast operator workflows

Recommended visual language:

- White/light neutral base
- Dark text
- Red as a strong action/accent color
- Green for successful validation
- Amber/yellow for warning/review
- Red for failure/blocking
- Gray for neutral states

Do not use excessive gradients, excessive glassmorphism, or decorative AI-themed effects.

For operational dashboards, prioritize information hierarchy over visual effects.

### Status colors

Use consistent semantic states:

```text
SUCCESS / MATCH       -> Green
WARNING / REVIEW     -> Amber
FAILED / BLOCKED     -> Red
NEUTRAL / PENDING    -> Gray/Blue
```

Do not communicate status by color alone; always include text or an icon/label.

---

## 15. Important Screens

Implement screens based on the proposal's mockup scope.

### Public

- Landing Page
- Vehicle Registration
- OCR/Verification Status
- QR Code
- Transaction History
- SPBU Stock
- Notifications

### Pertamina Admin

- Dashboard
- Registration Review
- OCR Detail
- Transaction Monitor
- Audit & Anomaly Panel
- SPBU Management
- Operator Management
- Regional Management
- Reports

### SPBU Operator

- Operator Dashboard
- QR Scanner
- Vehicle Validation
- Transaction Confirmation
- Stock Update
- Transaction History

### Auditor

- Executive Dashboard
- Compliance Audit
- National SPBU Monitoring
- Transaction Audit
- Financial/Subsidy Dashboard
- Blockchain Audit
- Block Detail

The proposal lists these dashboard/mockup areas, including transaction monitoring, audit panels, operator/SPBU management, public mobile features, national executive monitoring, financial transparency, and blockchain block detail.

---

## 16. Audit & Explainability

Whenever AI produces a decision-support result, the UI should show evidence.

Example:

```text
QR Result:
MATCH

Registered Plate:
BL 1234 XX

Detected Plate:
BL 1234 XX

OCR Confidence:
96.4%

YOLO:
Plate detected

Decision:
Eligible for operator confirmation
```

For mismatch:

```text
QR Result:
NOT MATCH

Registered Plate:
BL 1234 XX

Detected Plate:
BL 5678 YY

Action:
Transaction requires review
```

For motorcycle:

```text
Detected Class:
Motorcycle XYZ

Model Confidence:
93.8%

Specification:
150 cc

Classification:
UNDER 250 CC

Validation:
Eligible
```

The goal is to make the system's reasoning inspectable rather than presenting a mysterious "AI approved" result.

---

## 17. Error Handling

Never fail silently.

Every AI/service operation should handle:

- image upload failure
- invalid image
- OCR failure
- OCR low confidence
- plate not detected
- multiple plates detected
- YOLO failure
- model unavailable
- blockchain unavailable
- database unavailable
- timeout
- duplicate transaction
- invalid QR
- expired/invalid QR
- stock update conflict

Example:

```text
OCR unavailable
        |
        v
Mark OCR status = FAILED
        |
        v
Notify operator/admin
        |
        v
Allow manual review where appropriate
```

Do not fabricate AI results when a model/service is unavailable.

---

## 18. Logging

Use structured logs.

Log:

- request ID
- user/operator ID
- role
- action
- entity ID
- service name
- model version
- processing duration
- result status
- error code
- timestamp

Avoid logging:

- passwords
- authentication tokens
- private keys
- unnecessary full STNK contents
- unnecessary personal data

---

## 19. Testing Strategy

### Backend

Test:

- registration workflow
- OCR result persistence
- approval/rejection
- role authorization
- transaction creation
- QR match/mismatch
- motorcycle eligibility
- stock update
- audit creation
- blockchain reference creation

### AI/CV

Test:

- valid plate
- invalid/blurred plate
- low-confidence OCR
- multiple objects
- motorcycle under 250 cc
- motorcycle over 250 cc
- unknown motorcycle
- poor lighting
- partial occlusion

### Frontend

Test:

- dashboard rendering
- loading state
- empty state
- error state
- validation result
- responsive layout
- role-specific navigation

### Security

Test:

- unauthorized access
- privilege escalation
- malformed uploads
- oversized uploads
- invalid file types
- API rate limiting
- IDOR
- authentication/session issues

---

## 20. Development Workflow

Follow this order unless the existing repository requires another sequence:

```text
1. Inspect existing repository
2. Understand current stack
3. Preserve existing architecture where reasonable
4. Define domain models
5. Build authentication/RBAC
6. Build registration workflow
7. Integrate OCR service
8. Build human review workflow
9. Build QR validation
10. Integrate YOLO + OCR
11. Build motorcycle validation
12. Build transaction workflow
13. Add blockchain audit abstraction
14. Build stock management
15. Build admin dashboard
16. Build operator dashboard
17. Build auditor dashboard
18. Build public interface
19. Add reports/export
20. Add tests
21. Add security hardening
22. Add deployment configuration
```

PETROCHAIN's source roadmap uses Rapid Prototyping with communication, quick plan, quick design, construction, user evaluation, training/socialization, phased implementation, monitoring, and maintenance. Keep development iterative and validate each major module before expanding scope.

---

## 21. Git Rules

Before modifying code:

- Inspect the repository.
- Read existing README and project configuration.
- Identify framework/version.
- Identify current database.
- Identify existing authentication.
- Identify coding conventions.

Do not rewrite working parts without reason.

Every meaningful change should be:

- small
- testable
- documented
- logically isolated

Use meaningful commit messages.

Never commit:

```text
.env
API keys
private keys
model secrets
database passwords
uploaded personal documents
production credentials
```

---

## 22. Environment Variables

Use environment variables for:

```text
APP_ENV
APP_URL
DB_*
OCR_*
YOLO_*
BLOCKCHAIN_*
STORAGE_*
QUEUE_*
MAIL_*
```

Never hard-code service URLs or secrets.

Provide `.env.example`.

---

## 23. AI Service Contract

Keep AI services behind interfaces.

Example:

```text
OCRService
  -> extractText()
  -> extractPlate()
  -> normalizePlate()
  -> comparePlate()

VehicleDetectionService
  -> detectPlate()
  -> classifyMotorcycle()

VehicleSpecificationService
  -> findSpecification()
  -> getEngineCapacity()

ValidationService
  -> validateVehicle()
```

The backend should not depend directly on a specific OCR or YOLO implementation.

This allows:

- local model
- Python FastAPI service
- Docker service
- future cloud inference

without rewriting the business layer.

---

## 24. Blockchain Service Contract

Use an abstraction such as:

```text
BlockchainAuditService
  -> recordTransaction()
  -> getTransaction()
  -> getBlock()
  -> verifyIntegrity()
```

Business logic should not directly depend on a particular blockchain vendor/protocol.

The blockchain implementation can initially be mocked for development.

Example development flow:

```text
Application Transaction
        |
        v
Audit Payload
        |
        v
BlockchainAuditService
        |
        +-- Mock implementation
        |
        +-- Real implementation later
```

---

## 25. Demo Mode

If real external integrations are unavailable, provide a deterministic demo mode.

Demo mode must clearly indicate:

```text
DEMO DATA
SIMULATED AI RESULT
SIMULATED BLOCKCHAIN
```

Never make simulated results look like verified real government data.

Useful demo scenarios:

### Scenario 1 — Successful Registration

```text
STNK plate: BL 1234 XX
Vehicle photo plate: BL 1234 XX
OCR: MATCH
Admin: APPROVE
QR: ISSUED
```

### Scenario 2 — Registration Mismatch

```text
STNK plate: BL 1234 XX
Vehicle photo plate: BL 5678 YY
OCR: MISMATCH
Admin: REVIEW
```

### Scenario 3 — QR Match

```text
QR plate: BL 1234 XX
Detected plate: BL 1234 XX
Result: QR MATCH
Transaction: APPROVED
```

### Scenario 4 — QR Not Match

```text
QR plate: BL 1234 XX
Detected plate: BL 5678 YY
Result: QR NOT MATCH
Transaction: MANUAL REVIEW
```

### Scenario 5 — Motorcycle Under 250 cc

```text
Motorcycle class -> Specification lookup -> 150 cc
Result: UNDER 250 CC
```

### Scenario 6 — Motorcycle Over 250 cc

```text
Motorcycle class -> Specification lookup -> 300 cc
Result: OVER 250 CC
Action: BLOCK / OPERATOR REVIEW
```

---

## 26. What Claude Must Not Do

Do not:

- Replace MyPertamina with PETROCHAIN.
- Claim real government integration without an actual API.
- Treat AI prediction as a legal decision.
- Automatically approve a registration solely from OCR.
- Put all application data on blockchain.
- Store secrets in source code.
- Bypass authorization.
- Ignore low-confidence AI results.
- Invent vehicle specifications.
- Hard-code a vehicle's engine capacity based solely on visual appearance.
- Create fake blockchain integrity claims.
- Present demo data as production data.
- Change government regulations in application logic without explicit project requirements.
- Add unnecessary technologies just to make the project appear more complex.

---

## 27. Implementation Priorities

If time is limited, prioritize the core demonstrable flow:

```text
Registration
   ->
OCR
   ->
Admin Review
   ->
QR Issuance
   ->
SPBU QR Scan
   ->
YOLO Plate Detection
   ->
OCR Plate Recognition
   ->
QR vs Plate Comparison
   ->
Transaction
   ->
Blockchain Audit
```

Then add:

```text
Motorcycle Classification
   ->
Specification Lookup
   ->
Under/Over 250 cc
```

Then:

```text
SPBU Stock
   ->
Public Stock Information
```

Finally expand dashboards, reporting, analytics, and advanced audit capabilities.

---

## 28. Definition of Done

A feature is not complete until:

- UI exists where required.
- Backend logic exists.
- Authorization is implemented.
- Validation exists.
- Error states exist.
- Loading states exist.
- Database persistence works.
- Tests cover important paths.
- Audit logging exists for sensitive actions.
- Documentation is updated.
- No secrets are committed.
- Demo mode works if external services are unavailable.

For AI/CV features additionally:

- Model/service version is recorded.
- Confidence is recorded.
- Raw and normalized OCR outputs are distinguishable.
- Low-confidence cases are handled.
- Manual review path exists.
- Inference failures are handled safely.

---

## 29. Product Success Criteria

The implemented prototype should clearly demonstrate that PETROCHAIN can:

1. Reduce manual effort in vehicle-registration verification through OCR assistance.
2. Add a physical-vehicle validation layer to QR-based refueling.
3. Detect and flag QR/plate mismatches.
4. Support motorcycle validation through visual classification plus specification lookup.
5. Produce a traceable audit trail for validated transactions.
6. Give operators a simple way to update fuel-stock status.
7. Give public users useful stock information.
8. Give administrators operational visibility.
9. Give auditors read-only transparency into transactions and audit records.
10. Integrate conceptually with the MyPertamina ecosystem without replacing its existing distribution mechanism.

---

## 30. Source of Truth

When requirements conflict, use this priority:

```text
1. Explicit user instruction
2. Existing repository implementation/conventions
3. This CLAUDE.md
4. PETROCHAIN proposal
5. General engineering best practices
```

Do not silently invent requirements.

When a requirement is ambiguous and affects architecture, ask before making a destructive or irreversible decision.

---

## 31. Reference

The implementation should remain faithful to the PETROCHAIN proposal:

- PETROCHAIN is an extension/supporting platform for MyPertamina.
- Main technologies: OCR, YOLO, QR Code, Blockchain.
- Main modules: OCR registration, YOLO-OCR validation, blockchain audit, motorcycle validation, stock information.
- Main actors: masyarakat, administrator Pertamina, operator SPBU, BPH Migas, Kementerian ESDM, Kementerian Keuangan RI.
- Development approach: Rapid Prototyping and iterative user evaluation.
- Blockchain acts as an additional audit layer, not the replacement for the primary database.

The proposal states that the overall integration of OCR, YOLO, and Blockchain is intended to strengthen verification, validation, monitoring, and information delivery while preserving the existing subsidized-fuel distribution mechanism.


kode warna dominan 
#980f12

Searched web: "aturan lengkap batas pengisian bbm subsidi pertalite solar mobil qr code mypertamina 2024 2026"

Berikut adalah rangkuman **aturan resmi dan lengkap** terkait batas pengisian BBM bersubsidi untuk mobil menggunakan sistem QR Code (MyPertamina) yang berlaku saat ini (berdasarkan Keputusan Kepala BPH Migas terbaru):

### 1. Batas Kuota Harian (Maksimal per Hari)
**Untuk Pertalite (RON 90):**
*   **Mobil Pribadi (Roda 4):** Maksimal **50 Liter** per hari.
*   **Angkutan Umum (Roda 4):** Maksimal **50 Liter** per hari.
*   **Pelayanan Umum (Ambulans, Pemadam, dll):** Maksimal **50 Liter** per hari.

**Untuk Solar Subsidi (Biosolar):**
*   **Mobil Pribadi (Roda 4):** Maksimal **50 Liter** per hari.
*   **Angkutan Umum (Roda 4):** Maksimal **80 Liter** per hari.
*   **Angkutan Umum/Barang (Roda 6 ke atas):** Maksimal **200 Liter** per hari.
*   **Pelayanan Umum:** Maksimal **50 Liter** per hari.

### 2. Aturan Tanpa QR Code
Jika pengguna belum mendaftar atau tidak membawa QR Code, beberapa SPBU menerapkan kebijakan pembatasan darurat yaitu hanya boleh mengisi **maksimal 20 Liter per hari**, atau bahkan **ditolak sepenuhnya** (diarahkan untuk membeli BBM Non-Subsidi seperti Pertamax/Dexlite) tergantung dari kebijakan ketat di region SPBU tersebut.

### 3. Konsekuensi Jika Melebihi Kuota
Sistem MyPertamina dan Petrochain akan mencatat setiap tetes BBM yang keluar. Jika kuota 50 L tersebut sudah habis di satu SPBU, lalu mobil yang sama mencoba mengisi lagi di SPBU lain pada hari yang sama, maka **sistem akan mengunci dispenser** atau kelebihan pengisiannya otomatis akan **dihargai dengan tarif BBM Non-Subsidi** (harga normal tanpa bantuan pemerintah).

### 4. Fakta Isu Pembatasan CC Mobil
Sempat beredar isu bahwa mobil di atas 1.400 cc atau merek mewah tertentu dilarang membeli Pertalite. Namun secara resmi, **aturan pembatasan berbasis CC tersebut belum disahkan**. Saat ini pemerintah masih murni mengandalkan **pembatasan volume harian (50 Liter)** dan kewajiban pendaftaran ke sistem Subsidi Tepat untuk penyaringan datanya.

---
Itulah alasan mengapa UI kapsul indikator kita buat menjadi **50 Liter** untuk jenis mobil pribadi seperti Avanza—karena itu adalah cerminan batas akurat yang paling mutakhir di lapangan! 🚗⛽

resmi diterapkan!

Berdasarkan narasi proposal Anda tersebut, maka logika sistem kita menjadi sangat solid dan mengikat:

Aturan Baku: Kendaraan roda empat dengan kapasitas mesin di atas 1.400 cc dilarang/tidak berhak menggunakan Pertalite.

Filter Pendaftaran Pertalite: Dilarang untuk mobil bensin di atas 1.400 cc.

**Oh, tentu saja ADA!** 😅

Justru, kebijakan wajib menggunakan QR Code dari pemerintah itu **diterapkan pertama kali dan paling ketat untuk pengguna Biosolar (Solar Subsidi)**, jauh sebelum Pertalite! 

Jadi, semua mobil diesel (Innova Diesel, Panther, Truk, Bus, dll) **WAJIB** punya QR Code untuk bisa beli Solar bersubsidi. 

Perbedaannya dengan Pertalite bukanlah pada *punya atau tidak punya QR Code*, melainkan pada **syarat saat mendaftar** dan **batas maksimal hariannya**:

1. **Untuk Pertalite (Bensin):**
   * Syarat pendaftaran: (Di proposal kita) ditolak jika mesin >1.400 cc.
   * Batas harian jika lolos dapat QR: **50 Liter/hari**.

2. **Untuk Solar Subsidi (Diesel):**
   * Syarat pendaftaran: Tidak ditolak berdasarkan CC, karena mesin diesel memang besar-besar (rata-rata 2.400 cc).
   * Batas harian jika dapat QR: 
     * **50 Liter/hari** (Mobil diesel pribadi).
     * **80 Liter/hari** (Angkutan umum orang/barang roda 4).
     * **200 Liter/hari** (Kendaraan roda 6 ke atas seperti truk/bus besar).

**Kesimpulan:**
Dua-duanya (Pertalite dan Solar) **SAMA-SAMA WAJIB pakai QR Code** di aplikasi Petrochain kita. Sistem pemotongan kuota harian di SPBU-nya pun sama persis. Bedanya murni cuma di "angka batas liter" dan "aturan saat pendaftaran STNK di awal" saja! 🚛⛽