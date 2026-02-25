# Fix Database Schema - Add ai_reasoning Column

## Problem
The database table `loan_applications` is missing the `ai_reasoning` column that was added to the model. This causes errors when submitting loan applications.

## Solution Options

### Option 1: Add Column (Preserves Data) - RECOMMENDED

**Step 1:** Activate your virtual environment:
```bash
cd credora-backend
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
```

**Step 2:** Run the migration script:
```bash
python migrate_add_ai_reasoning.py
```

This will add the `ai_reasoning` column without losing any existing data.

### Option 2: Recreate Tables (Loses All Data)

If you don't have important data, you can drop and recreate all tables:

```bash
cd credora-backend
venv\Scripts\activate  # Windows
python clear_database.py --drop
```

Then recreate your admin user:
```bash
python create_admin.py
```

### Option 3: Manual SQL (Advanced)

If you prefer to run SQL directly:

```sql
-- Connect to PostgreSQL
psql -U your_username -d credora_db

-- Add the column
ALTER TABLE loan_applications ADD COLUMN ai_reasoning VARCHAR;
```

## Verify Fix

After running the migration, restart your backend server:
```bash
uvicorn app.main:app --reload
```

Then try submitting a loan application again. The error should be resolved.
