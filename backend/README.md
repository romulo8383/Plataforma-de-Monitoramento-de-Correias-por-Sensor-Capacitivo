# Belt Monitor - Backend

Industrial monitoring system backend for capacitive sensor belt monitoring.

## Project Structure

```
backend/
├── belt_monitor/          # Main Django project
│   ├── settings.py       # Project settings
│   ├── urls.py          # Main URL routing
│   ├── asgi.py          # ASGI configuration
│   ├── wsgi.py          # WSGI configuration
│   └── manage.py        # Django management commands
├── configuration/        # Configuration management app
├── acquisition/         # Data acquisition and collection app
├── visualization/       # Data visualization and reporting app
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
└── venv/               # Python virtual environment
```

## Django Apps Overview

### 1. **configuration** (Configuration Management)
**Responsibility:** System setup, device configuration, and parameter management

Features to implement:
- Sensor configuration (calibration, sensitivity)
- System settings and preferences
- Device registry and management
- Alert thresholds and limits
- User permissions and roles
- API endpoints for CRUD operations on system configurations

Key models:
- `Device`
- `Sensor`
- `AlertThreshold`
- `SystemSettings`

---

### 2. **acquisition** (Data Acquisition & Collection)
**Responsibility:** Real-time sensor data collection, storage, and initial processing

Features to implement:
- Data ingestion from sensors (APIs, IoT protocols)
- Real-time data processing and validation
- Data storage and archiving
- Signal processing and filtering
- Anomaly detection
- Data streaming capabilities

Key models:
- `SensorReading`
- `RawData`
- `ProcessedData`
- `DataLog`

---

### 3. **visualization** (Data Visualization & Reporting)
**Responsibility:** Data analysis, reporting, and dashboard endpoints

Features to implement:
- Time-series data analysis
- Statistical reports
- Performance metrics calculation
- Historical trend analysis
- Export functionality (CSV, PDF)
- Dashboard data endpoints
- Custom report generation

Key models:
- `Report`
- `Dashboard`
- `Analytics`
- `ExportLog`

---

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
copy .env.example .env
# Edit .env with your configuration
```

### 4. Apply Migrations
```bash
cd belt_monitor
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

Server will be available at `http://localhost:8000`

---

## Development Workflow

### Create Database Models
Models should be defined in each app's `models.py` file.

### Create API Endpoints
Use Django REST Framework in each app's `views.py` or `viewsets.py`.

### Update URLs
Add new routes to each app's `urls.py` file, then include them in main `belt_monitor/urls.py`.

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## API Structure
- `configuration/api/` - Configuration endpoints
- `acquisition/api/` - Data ingestion endpoints
- `visualization/api/` - Analytics and reporting endpoints

---

## Technology Stack
- **Framework:** Django 6.0.3
- **REST API:** Django REST Framework
- **Database:** PostgreSQL (configurable)
- **Server:** Gunicorn
- **CORS:** django-cors-headers

---

## Next Steps
1. Register apps in `belt_monitor/settings.py`
2. Create models for each app
3. Set up REST API views and serializers
4. Configure URL routing
5. Implement authentication and permissions
6. Set up initial data fixtures

