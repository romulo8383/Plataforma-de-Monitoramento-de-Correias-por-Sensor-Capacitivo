# Visualization App

## Purpose
Provides data analysis, reporting, and dashboard endpoints for the belt monitoring system.

## Responsibilities
- Time-series data analysis and trend identification
- Statistical report generation
- Performance metrics calculation
- Historical trend analysis and forecasting
- Export functionality (CSV, PDF reports)
- Dashboard data endpoints for frontend
- Custom report generation and scheduling

## Models to Implement
- `Report` - Stores generated reports metadata and content
- `Dashboard` - Dashboard configurations for users
- `Analytics` - Computed analytics and metrics
- `ExportLog` - Tracks data exports for auditing

## Key Endpoints (to be implemented)
- `GET /api/visualization/analytics/` - Get system analytics
- `GET /api/visualization/reports/` - List available reports
- `POST /api/visualization/reports/` - Generate new report
- `GET /api/visualization/reports/{id}/` - Retrieve specific report
- `GET /api/visualization/dashboard/` - Get dashboard data
- `POST /api/visualization/export/` - Export data to file
- `GET /api/visualization/trends/` - Get trend analysis

## Report Types
- **Daily Summary** - Daily performance metrics
- **Weekly Analysis** - Weekly trend analysis
- **Alert Report** - List of all alerts triggered
- **Custom Report** - User-defined report parameters

## Analytics Calculated
- Sensor status and availability
- Average, min, max readings per time period
- Anomaly count and rates
- Alert frequency and patterns
- Device performance metrics
- Data quality metrics

## Related Apps
- Consumes processed data from `acquisition` app
- Uses configuration from `configuration` app

## Frontend Integration
All endpoints return JSON data suitable for:
- Text-based dashboards
- Chart and graph libraries (Chart.js, D3.js, etc.)
- Mobile app integration
- Export to BI tools
