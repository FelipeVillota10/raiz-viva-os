# AGENTS.md - Raíz Viva

## Repository Structure

```
apps/
├── backend/          # Django API (Python)
│   ├── venv/         # Virtual environment (NOT committed)
│   ├── .env          # Local environment variables (NOT committed)
│   └── apps/         # Django apps (Clientes, usuarios, Aprobaciones, etc.)
└── frontend/         # Next.js (React) - Multiple "Células"
    └── Celula[1-5]/  # Independent Next.js apps
```

## Backend Development

### Setup
```bash
cd apps/backend
pip install -r requirements.txt
# Install missing dependencies (NOT in requirements.txt):
pip install dj-database-url django-cors-headers django-filter
# Create .env from .env.example with your local PostgreSQL credentials
export $(cat .env | xargs) && python manage.py migrate
```

### Key Dependencies (often missing from requirements.txt)
- `dj-database-url` - Parse DATABASE_URL for Django
- `django-cors-headers` - CORS support
- `django-filter` - Filtering support

### Run Server
```bash
source apps/backend/venv/bin/activate
export $(cat apps/backend/.env | xargs) && python manage.py runserver
```

### Database
- **Local**: PostgreSQL on port 5433 (check with `pg_lsclusters`)
- **Production**: Neon PostgreSQL (configured via DATABASE_URL)
- **Local connection**: `postgresql://postgres:password@localhost:5433/raizviva`

### Create Migrations
```bash
# For apps with new/changed models:
python manage.py makemigrations <app_name>
# Apply:
python manage.py migrate
```

## Frontend Development

```bash
cd apps/frontend/CelulaX
npm install
npm run dev
```

## Architecture Notes

### Backend Pattern (Multi-layer)
- `Model.py` - Database tables
- `Repository.py` - Database queries
- `Service.py` - Business logic
- `Controller.py` / `views.py` - HTTP handlers

### Apps without migrations
These apps exist but have no Django migrations (models may be stubs or unused):
- Evento, Experiencia, Growth, ConsolidadoEvento, ConsolidadoExperiencia, DetalleEvento

## Common Issues

1. **ModuleNotFoundError: No module named 'dj_database_url'**
   - Install: `pip install dj-database-url`

2. **ModuleNotFoundError: No module named 'corsheaders'**
   - Install: `pip install django-cors-headers`

3. **Circular import with EmailService**
   - Import from: `from usuarios.EmailService import EmailService`
   - NOT: `from ..usuarios.services import EmailService`

4. **Database connects to Neon instead of local**
   - Ensure `.env` exists with correct `DATABASE_URL`
   - Export env vars before running: `export $(cat .env | xargs)`

## Environment Variables (.env)

Required for local development:
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://postgres:password@localhost:5433/raizviva
```

Optional (for full functionality):
```env
EMAIL_HOST_USER=gmail@gmail.com
EMAIL_HOST_PASSWORD=app-password
EMAIL_FROM=Raiz Viva <noreply@raizviva.com>
```

## Git Workflow

- `.env` and `venv/` are gitignored
- `requirements.txt` may be incomplete - check if new packages were installed during development
- Some modified files (like `ClienteModel.py`) may show as "modified" but not create migrations if the changes don't affect the schema