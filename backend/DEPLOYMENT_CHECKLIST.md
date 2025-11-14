# Production Deployment Checklist

This checklist ensures all production essentials are covered before deploying the AI Orchestration Platform.

## Pre-Deployment

### 1. Environment Configuration
- [ ] Copy `env.example` to `.env` and fill in all values
- [ ] Set `DEBUG=False` in production
- [ ] Generate a strong `SECRET_KEY` (use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- [ ] Set `ALLOWED_HOSTS` to your production domain(s)
- [ ] Configure database credentials (Neon PostgreSQL)
- [ ] Configure Redis credentials
- [ ] Set up CORS allowed origins for frontend domain
- [ ] Configure email settings for admin notifications
- [ ] Set up Sentry DSN (optional but recommended)

### 2. Security Settings
- [ ] Verify `SECURE_SSL_REDIRECT=True` (HTTPS enforcement)
- [ ] Verify `SESSION_COOKIE_SECURE=True`
- [ ] Verify `CSRF_COOKIE_SECURE=True`
- [ ] Verify security headers are enabled
- [ ] Review and set appropriate DRF throttling rates
- [ ] Set file upload size limits
- [ ] Review JWT token lifetimes
- [ ] Enable token blacklist for JWT

### 3. Database
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Set up database backups (Neon automatic backups or manual)
- [ ] Test database connection
- [ ] Verify database connection pooling settings

### 4. Static & Media Files
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Configure `STATIC_ROOT` and `MEDIA_ROOT`
- [ ] Set up CDN for static files (optional but recommended)
- [ ] Configure media file storage (local or cloud: S3, Azure, etc.)
- [ ] Set appropriate file permissions

### 5. Redis
- [ ] Install and start Redis server
- [ ] Set Redis password (if required)
- [ ] Test Redis connection
- [ ] Configure Redis persistence (RDB/AOF)
- [ ] Set up Redis monitoring

### 6. Celery
- [ ] Start Celery worker: `celery -A ai_platform worker --loglevel=info`
- [ ] Start Celery beat (if using periodic tasks): `celery -A ai_platform beat --loglevel=info`
- [ ] Test task execution
- [ ] Monitor Celery worker logs
- [ ] Configure Celery task retries and timeouts

### 7. WebSocket (Channels)
- [ ] Verify ASGI application is configured
- [ ] Test WebSocket connections
- [ ] Verify Channels routing
- [ ] Test real-time job updates

### 8. Logging
- [ ] Create `logs/` directory
- [ ] Configure log rotation
- [ ] Set appropriate log levels
- [ ] Test log file writing
- [ ] Set up log aggregation (optional: ELK, CloudWatch, etc.)

### 9. Monitoring & Error Tracking
- [ ] Set up Sentry account and project
- [ ] Configure Sentry DSN in environment variables
- [ ] Test error reporting
- [ ] Set up application monitoring (optional: Prometheus, Grafana)
- [ ] Configure health check endpoints

### 10. SSL/TLS Certificates
- [ ] Obtain SSL certificates (Let's Encrypt or commercial)
- [ ] Place certificates in `nginx/ssl/` directory
- [ ] Update Nginx configuration with certificate paths
- [ ] Test HTTPS connection
- [ ] Verify certificate auto-renewal (if using Let's Encrypt)

### 11. Nginx Configuration
- [ ] Update `nginx/conf.d/ai_platform.conf` with your domain
- [ ] Verify upstream servers (web, asgi) are correct
- [ ] Test static file serving
- [ ] Test media file serving
- [ ] Verify WebSocket proxy configuration
- [ ] Test reverse proxy for API endpoints
- [ ] Review security headers

### 12. Docker Configuration
- [ ] Build Docker images: `docker-compose build`
- [ ] Test Docker containers locally
- [ ] Verify all services start correctly
- [ ] Test service health checks
- [ ] Review resource limits (CPU, memory)

### 13. Testing
- [ ] Run unit tests: `pytest`
- [ ] Run integration tests
- [ ] Test API endpoints
- [ ] Test WebSocket connections
- [ ] Test job creation and processing
- [ ] Test authentication and authorization
- [ ] Test file uploads (if applicable)
- [ ] Load testing (optional but recommended)

### 14. CI/CD Pipeline
- [ ] Verify GitHub Actions workflow is configured
- [ ] Test linting, tests, and builds
- [ ] Configure deployment secrets
- [ ] Set up deployment automation
- [ ] Test rollback procedures

## Deployment

### 15. Server Setup
- [ ] Provision server (VPS, AWS, Azure, GCP, etc.)
- [ ] Install Docker and Docker Compose
- [ ] Install Nginx (if not using Docker)
- [ ] Configure firewall rules
- [ ] Set up SSH key authentication
- [ ] Configure server monitoring

### 16. Application Deployment
- [ ] Clone repository to server
- [ ] Copy `.env` file with production values
- [ ] Build Docker images: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Run migrations: `docker-compose exec web python manage.py migrate`
- [ ] Collect static files: `docker-compose exec web python manage.py collectstatic --noinput`
- [ ] Create superuser: `docker-compose exec web python manage.py createsuperuser`

### 17. Service Verification
- [ ] Verify web service is running: `docker-compose ps`
- [ ] Verify ASGI service is running
- [ ] Verify Celery worker is running
- [ ] Verify Celery beat is running (if applicable)
- [ ] Verify Redis is running
- [ ] Verify database connection
- [ ] Check service logs: `docker-compose logs -f`

### 18. Network & DNS
- [ ] Configure DNS A/AAAA records
- [ ] Test domain resolution
- [ ] Verify SSL certificate is valid
- [ ] Test HTTPS connection
- [ ] Test API endpoints via HTTPS
- [ ] Test WebSocket connections via WSS

### 19. Post-Deployment Testing
- [ ] Test user registration/login
- [ ] Test JWT token generation and refresh
- [ ] Test API endpoints with authentication
- [ ] Test job creation
- [ ] Test real-time job updates via WebSocket
- [ ] Test admin interface
- [ ] Test file uploads (if applicable)
- [ ] Test error handling

### 20. Performance & Optimization
- [ ] Enable database query caching
- [ ] Configure Redis caching
- [ ] Review and optimize database queries
- [ ] Set up database indexes
- [ ] Configure connection pooling
- [ ] Review and optimize Nginx configuration
- [ ] Set up CDN for static files (optional)

## Maintenance

### 21. Backup Strategy
- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Set up media file backups (if applicable)
- [ ] Document backup procedures
- [ ] Schedule regular backup tests

### 22. Monitoring & Alerts
- [ ] Set up uptime monitoring
- [ ] Configure error alerts (Sentry)
- [ ] Set up performance monitoring
- [ ] Configure disk space alerts
- [ ] Set up database connection alerts
- [ ] Configure Celery task failure alerts

### 23. Documentation
- [ ] Document deployment procedures
- [ ] Document rollback procedures
- [ ] Document environment variables
- [ ] Document API endpoints
- [ ] Document troubleshooting steps

### 24. Security Review
- [ ] Review and update dependencies
- [ ] Run security scans
- [ ] Review access logs
- [ ] Verify firewall rules
- [ ] Review user permissions
- [ ] Set up security monitoring

## Production Checklist Summary

### Critical Items (Must Have)
1. ✅ `DEBUG=False`
2. ✅ Strong `SECRET_KEY`
3. ✅ `ALLOWED_HOSTS` configured
4. ✅ Database credentials in environment variables
5. ✅ HTTPS/SSL enabled
6. ✅ Secure cookies enabled
7. ✅ Static files collected
8. ✅ Migrations run
9. ✅ Superuser created
10. ✅ Redis running
11. ✅ Celery worker running
12. ✅ WebSocket/ASGI working
13. ✅ Logging configured
14. ✅ Error tracking (Sentry) configured

### Important Items (Should Have)
1. ✅ Database backups
2. ✅ Monitoring setup
3. ✅ CI/CD pipeline
4. ✅ Load testing
5. ✅ CDN for static files
6. ✅ Performance optimization

### Optional Items (Nice to Have)
1. ✅ Prometheus/Grafana monitoring
2. ✅ ELK stack for logs
3. ✅ Automated scaling
4. ✅ Blue-green deployment
5. ✅ Canary releases

## Quick Deployment Commands

```bash
# 1. Clone repository
git clone <repository-url>
cd backend

# 2. Set up environment
cp env.example .env
# Edit .env with production values

# 3. Build and start services
docker-compose build
docker-compose up -d

# 4. Run migrations
docker-compose exec web python manage.py migrate

# 5. Collect static files
docker-compose exec web python manage.py collectstatic --noinput

# 6. Create superuser
docker-compose exec web python manage.py createsuperuser

# 7. Check service status
docker-compose ps

# 8. View logs
docker-compose logs -f

# 9. Restart services
docker-compose restart

# 10. Stop services
docker-compose down
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `.env`
   - Verify database is accessible
   - Check firewall rules

2. **Redis Connection Error**
   - Verify Redis is running
   - Check Redis password
   - Verify Redis host/port

3. **Static Files Not Loading**
   - Run `collectstatic`
   - Check Nginx configuration
   - Verify file permissions

4. **WebSocket Not Working**
   - Verify ASGI service is running
   - Check Channels routing
   - Verify Redis connection

5. **Celery Tasks Not Executing**
   - Verify Celery worker is running
   - Check Redis connection
   - Review task logs

## Support & Resources

- Django Documentation: https://docs.djangoproject.com/
- DRF Documentation: https://www.django-rest-framework.org/
- Channels Documentation: https://channels.readthedocs.io/
- Celery Documentation: https://docs.celeryq.dev/
- Docker Documentation: https://docs.docker.com/

---

**Last Updated:** 2024
**Version:** 1.0.0

