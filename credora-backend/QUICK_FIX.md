# Quick Fix for Database Error

## The Problem
The error `column "ai_reasoning" of relation "loan_applications" does not exist` occurs because the database table doesn't have the new column we added.

## Easiest Solution (Recommended)

**Step 1:** Open a terminal in the `credora-backend` folder

**Step 2:** Activate virtual environment:
```bash
venv\Scripts\activate
```

**Step 3:** Run this command to recreate all tables:
```bash
python clear_database.py --drop
```

**Step 4:** Recreate admin user:
```bash
python create_admin.py
```

**Step 5:** Restart your backend server:
```bash
uvicorn app.main:app --reload
```

## Alternative: Add Column Only (If you have important data)

If you have data you want to keep:

**Step 1:** Activate virtual environment:
```bash
venv\Scripts\activate
```

**Step 2:** Run migration:
```bash
python migrate_add_ai_reasoning.py
```

**Step 3:** Restart backend server

## Verify It's Fixed

1. Check backend terminal - should show no errors
2. Try submitting a loan application - should work now
3. Check dashboard - should load applications

If errors persist, make sure:
- ✅ Virtual environment is activated
- ✅ Backend server is restarted after migration
- ✅ Database connection is working (check .env file)
