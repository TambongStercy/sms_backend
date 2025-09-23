# Student and Fee Import System

This system provides comprehensive tools for importing student data and fee payments from Excel files into the School Management System database.

## Overview

The import system consists of three main components:

1. **Class List Import** - Imports students and creates enrollments
2. **Fee Payment Import** - Updates fee records with payment data
3. **Unified Coordinator** - Handles the complete workflow

## Files Structure

```
├── src/utils/importUtils.ts          # Core utilities and helpers
├── import-class-list.ts              # Student enrollment import
├── import-fee-payments.ts            # Payment data import
├── import-students-and-fees.ts       # Unified coordinator
├── test-import-analysis.ts           # Testing and validation
└── excel-analyzer.js                 # Excel file analysis tool
```

## Quick Start

### Complete Import Workflow (Recommended)

```bash
# Import both students and payments in one go
npx ts-node import-students-and-fees.ts \
  "c:/Users/LENOVO/Downloads/Student Class list.xlsx" \
  "c:/Users/LENOVO/Downloads/FEE RECORDE 2025-2026 v3.xlsx"

# For production servers (auto-creates missing subclasses)
npm run import:students:production \
  "path/to/Student Class list.xlsx" \
  "path/to/FEE RECORDE 2025-2026 v3.xlsx"
```

### Step-by-Step Import

```bash
# 1. Import students and create enrollments
npx ts-node import-class-list.ts "c:/Users/LENOVO/Downloads/Student Class list.xlsx"

# 2. Import payment data
npx ts-node import-fee-payments.ts "c:/Users/LENOVO/Downloads/FEE RECORDE 2025-2026 v3.xlsx"
```

## Detailed Usage

### 1. Class List Import

Imports students from the class list Excel file and creates:
- Student records with auto-generated matricules (SS25CL####)
- Enrollment records linking students to classes/subclasses
- School fee records based on class fee structure

```bash
# Basic import
npx ts-node import-class-list.ts "path/to/Student Class list.xlsx"

# Cleanup existing data and re-import
npx ts-node import-class-list.ts --cleanup "path/to/Student Class list.xlsx"

# Import for specific academic year
npx ts-node import-class-list.ts --year=1 "path/to/Student Class list.xlsx"
```

**Features:**
- Maps Excel sheet names to database subclasses (F1N → FORM 1 N)
- Fuzzy name matching to avoid duplicates
- Creates enrollments and fee records automatically
- Handles multiple sheet formats and structures

### 2. Fee Payment Import

Updates existing fee records with payment information from the fee records Excel file.

```bash
# Basic payment import
npx ts-node import-fee-payments.ts "path/to/FEE RECORDE 2025-2026 v3.xlsx"

# Import for specific academic year
npx ts-node import-fee-payments.ts --year=1 "path/to/FEE RECORDE 2025-2026 v3.xlsx"
```

**Features:**
- Matches students by name using fuzzy matching (80%+ similarity)
- Creates payment transaction records for each installment
- Updates total paid amounts in fee records
- Handles multiple payment installments (AMOUNT 1-4)

### 3. Unified Import

Coordinates the complete import process in the correct order.

```bash
# Complete workflow
npx ts-node import-students-and-fees.ts \
  "path/to/class-list.xlsx" \
  "path/to/fee-payments.xlsx"

# With cleanup
npx ts-node import-students-and-fees.ts --cleanup \
  "path/to/class-list.xlsx" \
  "path/to/fee-payments.xlsx"

# Skip certain phases
npx ts-node import-students-and-fees.ts --skip-class-list \
  "ignored" \
  "path/to/fee-payments.xlsx"
```

## Excel File Requirements

### Class List File Format

Expected columns:
- `S/N` or `SN` - Serial number
- `NAMES` or `NAME` - Student full name
- `TOTAL EXPECTED` - Expected fee amount (optional, uses class default)
- `TOTAL PAID` - Amount already paid
- `TELL` - Phone number

Expected sheet names: `F1N`, `F1M`, `F1S`, `F2N`, etc.

### Fee Payments File Format

Expected columns:
- `SN` - Serial number
- `NAME` - Student full name
- `AMOUNT 1` through `AMOUNT 4` - Individual payment installments
- `TOTAL EXPECTED` - Total expected amount
- `TOTAL PAID` - Total amount paid
- `DEBTH 1ST INST` - Outstanding debt

Expected sheet names: `1N`, `1M`, `1S`, `2N`, etc.

## Sheet Name Mappings

The system automatically maps Excel sheet names to database subclass names:

| Excel Sheet | Database Subclass |
|-------------|-------------------|
| F1N, 1N     | FORM 1 N         |
| F1M, 1M     | FORM 1 M         |
| F1S, 1S     | FORM 1 S         |
| F2MS, 2MS   | FORM 2 MS        |
| LSA 1, LSA1 | LOWER SIXTH A1   |
| USS 2, USS2 | UPPER SIXTH S2   |

## Features

### Intelligent Name Matching

- Fuzzy string matching using Levenshtein distance
- Handles variations in spacing, capitalization, and spelling
- Configurable similarity thresholds (default 80-90%)
- Avoids duplicate student creation

### Data Validation

- Validates Excel file structure and headers
- Checks for required database relationships
- Handles missing or malformed data gracefully
- Provides detailed error reporting

### Flexible Matricule Generation

- Auto-generates unique matricules with prefixes
- Class list students: `SS25CL####`
- Previous system: `SS25ST####`
- Prevents conflicts with existing students

### Comprehensive Logging

- Real-time progress indicators
- Detailed import summaries
- Error tracking and reporting
- Sheet-by-sheet processing status

## Testing

```bash
# Test Excel file analysis and parsing
npx ts-node test-import-analysis.ts

# Analyze Excel file structure
node excel-analyzer.js "path/to/excel-file.xlsx"
```

## Production Server Deployment

### Smart Subclass Management

The import system now **automatically detects and creates missing subclasses** on production servers:

```bash
# ✅ PRODUCTION-READY: Auto-creates missing subclasses
npm run import:students:production \
  "Student Class list.xlsx" \
  "FEE RECORDE 2025-2026 v3.xlsx"

# Alternative direct command
npx ts-node import-students-and-fees.ts --auto-create-subclasses \
  "Student Class list.xlsx" \
  "FEE RECORDE 2025-2026 v3.xlsx"
```

**What happens automatically:**
1. **Analyzes Excel sheets** to identify required subclasses (F1N → FORM 1 N)
2. **Checks database** for missing subclasses
3. **Intelligently matches** subclass names to existing classes
4. **Creates missing subclasses** with proper relationships
5. **Proceeds with import** seamlessly

### Manual Subclass Creation

If you need to create subclasses separately:

```bash
# Check for missing subclasses and create them
npm run import:summary:fix

# Or check without creating
npm run import:summary
```

## Common Scenarios

### First-Time Setup

```bash
# 1. Import all students and create their fee structures (auto-creates subclasses)
npx ts-node import-class-list.ts "class-list.xlsx"

# 2. Import payment history (auto-creates subclasses if needed)
npx ts-node import-fee-payments.ts "fee-payments.xlsx"
```

### Updated Student List

```bash
# Clean up and re-import everything
npx ts-node import-students-and-fees.ts --cleanup \
  "new-class-list.xlsx" \
  "updated-fee-payments.xlsx"
```

### Payment Updates Only

```bash
# Only update payments (students already exist)
npx ts-node import-fee-payments.ts "new-payments.xlsx"
```

### Partial Import

```bash
# Only import new students (no payment data yet)
npx ts-node import-class-list.ts "class-list.xlsx"
```

## Error Handling

The system provides comprehensive error handling:

- **File not found**: Clear error message with file path
- **Invalid Excel format**: Sheet structure validation
- **Missing headers**: Header detection and validation
- **Database constraints**: Foreign key and unique constraint violations
- **Name matching failures**: Reports unmatched students
- **Payment processing errors**: Individual transaction failures

## Performance Considerations

- Processes sheets in parallel where possible
- Uses database transactions for data integrity
- Implements batch operations for large datasets
- Provides progress indicators for long-running imports

## Security Notes

- Validates all input data before database operations
- Uses parameterized queries to prevent SQL injection
- Implements proper error handling to avoid data corruption
- Maintains audit trails for all import operations

## Troubleshooting

### Common Issues

1. **"No headers found"**: Check Excel file structure, ensure proper column names
2. **"Student not found"**: Verify name spelling, check similarity thresholds
3. **"SubClass not found"**: Ensure sheet names match expected patterns
4. **"No current academic year"**: Run database seed script first

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG=import* npx ts-node import-students-and-fees.ts
```

## Integration

The import system integrates with:
- **Fee Service**: Automatic fee calculation based on class structure
- **Student Service**: Handles enrollment and status updates
- **Payment Service**: Creates transaction records
- **Academic Year System**: Scopes all operations to specific years

## Future Enhancements

- Support for additional Excel formats
- Configurable mapping rules
- Advanced duplicate detection
- Batch import scheduling
- Real-time progress web interface
- Export functionality for verification