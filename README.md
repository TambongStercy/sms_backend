# School Management System with Database Synchronization

A robust school management system with bidirectional database synchronization between online (VPS) and offline (local school) servers.

## Features

- **Bidirectional Sync**: Automatic synchronization between VPS and local servers
- **Offline-First**: Full functionality when internet is unavailable
- **Conflict Resolution**: Smart conflict resolution with business logic
- **Real-time Updates**: Immediate sync when network is restored
- **Comprehensive Logging**: Detailed sync logs and error tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   VPS Server    │◄──►│  Local Server   │
│   (Online)      │    │  (School)       │
│                 │    │                 │
│ - Admin Data    │    │ - Classroom     │
│ - Reports       │    │   Data          │
│ - Payments      │    │ - Attendance    │
│ - Announcements │    │ - Real-time     │
└─────────────────┘    │   Operations    │
                       └─────────────────┘
```

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**For VPS Server:**
```env
NODE_ENV=production
SERVER_TYPE=remote
SERVER_ID=vps_main_001
DATABASE_URL_PRODUCTION="postgresql://user:pass@localhost:5432/school_db"
REMOTE_SYNC_URL=http://school-local-ip:3000/api/sync
```

**For Local School Server:**
```env
NODE_ENV=development
SERVER_TYPE=local
SERVER_ID=local_school_001
DATABASE_URL_DEVELOPMENT="postgresql://user:pass@localhost:5432/school_db_local"
REMOTE_SYNC_URL=https://your-vps.com/api/sync
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 3. Start the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Sync Configuration

### Automatic Sync
- Runs every 5 minutes by default
- Configurable via `AUTO_SYNC_INTERVAL` environment variable
- Automatically triggers when network is restored

### Manual Sync
```bash
# Trigger manual sync
npm run sync:trigger

# Check sync status
npm run sync:status
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sync/trigger` | POST | Trigger manual sync |
| `/api/sync/status` | GET | Get sync status |
| `/api/sync/logs` | GET | Get sync history |
| `/api/sync/auto/start` | POST | Start auto sync |
| `/api/sync/auto/stop` | POST | Stop auto sync |

## Conflict Resolution Strategy

### Business Logic Rules

1. **Student Attendance**: Local server wins (real-time data)
2. **Payment Transactions**: VPS server wins (authoritative)
3. **User Passwords**: Latest change wins
4. **Marks/Grades**: Latest entry wins (teacher corrections)
5. **Administrative Data**: VPS server wins

### Conflict Types

- **LOCAL_WINS**: Local data takes precedence
- **REMOTE_WINS**: Remote data takes precedence  
- **TIMESTAMP_WINS**: Most recent change wins
- **MERGE**: Combine both values
- **MANUAL**: Requires manual intervention

## Data Sync Priority

### High Priority (Synced First)
- Users and authentication
- Academic years and terms
- Classes and subjects
- Student enrollments

### Medium Priority
- Marks and grades
- Attendance records
- Teacher assignments

### Low Priority
- Reports and analytics
- Announcements
- Audit logs

## Network Handling

### Online Mode
- Real-time bidirectional sync
- Immediate conflict resolution
- Full feature availability

### Offline Mode
- Local operations continue
- Changes queued for sync
- Automatic sync when online

### Network Recovery
- Automatic detection
- Immediate sync trigger
- Conflict resolution

## Monitoring and Logging

### Sync Logs
```javascript
{
  "sync_id": "1703123456789",
  "start_time": "2023-12-21T10:30:00Z",
  "status": "COMPLETED",
  "records_processed": 150,
  "conflicts": 2,
  "errors": []
}
```

### Health Checks
- `/health` - Server health
- `/api/sync/health` - Sync service health
- Network connectivity monitoring

## Security Considerations

- API key authentication for sync endpoints
- Rate limiting on sync operations
- Encrypted data transmission
- Server ID validation
- Audit trail for all changes

## Deployment

### VPS Deployment
```bash
# Clone repository
git clone <repo-url>
cd school-management-sync

# Install dependencies
npm install

# Set production environment
export NODE_ENV=production
export SERVER_TYPE=remote

# Build and start
npm run build
npm start
```

### Local School Deployment
```bash
# Same steps but with local configuration
export NODE_ENV=development
export SERVER_TYPE=local
```

## Troubleshooting

### Common Issues

1. **Sync Failures**
   - Check network connectivity
   - Verify API keys
   - Review sync logs

2. **Database Conflicts**
   - Check conflict resolution logs
   - Manual resolution may be required
   - Verify server IDs

3. **Performance Issues**
   - Adjust sync intervals
   - Monitor database performance
   - Check network latency

### Debug Commands
```bash
# Check sync status
curl http://localhost:3000/api/sync/status

# View recent logs
curl http://localhost:3000/api/sync/logs

# Test network connectivity
curl http://localhost:3000/api/sync/health
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

MIT License - see LICENSE file for details