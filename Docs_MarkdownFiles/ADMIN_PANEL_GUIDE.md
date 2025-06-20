# 🛠️ Oracle Admin Panel Documentation

## Overview

The Oracle Admin Panel is a comprehensive dashboard for monitoring and configuring the CHODE-NET Oracle system. It provides real-time metrics, configuration controls, and administrative tools to ensure optimal performance in both development and production environments.

## 🔐 Access Control

### Authentication Requirements
- **SIWS Authentication**: Must be connected with a Solana wallet and authenticated via Sign-In With Solana
- **Admin Wallet Verification**: Only specific wallet addresses have admin access
- **Auto-routing**: Access via `/admin` URL or navigate programmatically

### Setting Up Admin Access
1. Update `ADMIN_WALLET_ADDRESS` in `src/components/AdminPanel/AdminDashboard.tsx`
2. Replace `"YOUR_WALLET_ADDRESS_HERE"` with your actual Solana wallet address
3. Ensure you're authenticated with that wallet when accessing the admin panel

```typescript
// Example configuration
const ADMIN_WALLET_ADDRESS = "6kVcNk8ChodeNetOracleAdminWallet123JtgK"
```

## 📊 Dashboard Features

### System Metrics
Real-time monitoring of key Oracle system metrics:

- **Total Events**: Cumulative count of all live game events
- **Events (Last Hour)**: Recent activity indicator
- **Active Connections**: Real-time user connections
- **Avg Response Time**: System performance indicator with status color coding:
  - 🟢 Good (< 100ms)
  - 🟡 Fair (100-200ms)
  - 🔴 Poor (> 200ms)

### LiveEventFeed Configuration

#### Demo Data Control
- **Purpose**: Toggle fallback demo events when no real data is available
- **Production Use**: Disable for production to show only real events
- **Development Use**: Enable for testing and demonstration purposes

#### Event Filtering
- **Purpose**: Filter out debug and internal events from the live feed
- **Options**: 
  - Enabled: Shows only meaningful user events
  - Disabled: Shows all events including debug messages

#### Performance Throttling
- **Purpose**: Prevent UI lag during high-volume event periods
- **Configuration**: 
  - Toggle: Enable/disable throttling
  - Slider: Set max events per second (1-50)
- **Recommended Settings**:
  - Development: 10-20 events/second
  - Production: 5-10 events/second for optimal UX

#### Real-time Updates
- **Purpose**: Control Supabase real-time subscriptions
- **Use Cases**:
  - Disable for debugging connection issues
  - Enable for live production monitoring

#### Debug Mode
- **Purpose**: Enable detailed console logging for troubleshooting
- **Features**:
  - Enhanced event processing logs
  - Debug event visibility
  - Detailed error reporting

### System Administration

#### Quick Actions
- **Inject Test Event**: Add a test event to verify the live feed system
- **Refresh Metrics**: Update all system statistics manually
- **Clear All Events**: Delete all live events (⚠️ irreversible operation)

#### Configuration Management
- **Export Config**: Copy current admin configuration to clipboard as JSON
- **Import Config**: Restore configuration from JSON (useful for backup/restore)

## 🔧 Technical Implementation

### Architecture
```
AdminPage.tsx (Router wrapper)
└── AdminDashboard.tsx (Main component)
    ├── Authentication Check (SIWS)
    ├── Metrics Loading (Supabase)
    ├── Configuration Management (localStorage)
    └── Real-time Updates (Custom events)
```

### Data Flow
1. **Configuration Storage**: Settings stored in `localStorage` with key `oracle_admin_config`
2. **Event Broadcasting**: Configuration changes broadcast via `adminConfigUpdated` custom event
3. **Component Integration**: LiveEventFeed listens for config updates and adjusts behavior

### Key Files
- `src/components/AdminPanel/AdminDashboard.tsx` - Main admin interface
- `src/components/AdminPanel/AdminPage.tsx` - Router wrapper
- `src/components/AdminPanel/AdminPanel.css` - Custom styling
- `src/main.tsx` - Routing configuration
- `src/lib/liveEventUtils.ts` - Enhanced filtering logic

## 🚀 Usage Guide

### Initial Setup
1. **Set Admin Wallet**: Update `ADMIN_WALLET_ADDRESS` constant
2. **Connect Wallet**: Ensure you're authenticated with the admin wallet
3. **Access Panel**: Navigate to `/admin` or use direct URL

### Common Configuration Scenarios

#### Development Environment
```json
{
  "demoDataEnabled": true,
  "eventFilteringEnabled": false,
  "performanceThrottling": false,
  "debugMode": true,
  "realTimeEnabled": true,
  "maxEventsPerSecond": 20
}
```

#### Production Environment
```json
{
  "demoDataEnabled": false,
  "eventFilteringEnabled": true,
  "performanceThrottling": true,
  "debugMode": false,
  "realTimeEnabled": true,
  "maxEventsPerSecond": 8
}
```

#### Debug/Troubleshooting Mode
```json
{
  "demoDataEnabled": false,
  "eventFilteringEnabled": false,
  "performanceThrottling": false,
  "debugMode": true,
  "realTimeEnabled": true,
  "maxEventsPerSecond": 50
}
```

### Monitoring Best Practices

#### Daily Monitoring
- Check error rates (should be < 1%)
- Monitor event volume trends
- Verify system uptime

#### Performance Optimization
- Adjust throttling based on user feedback
- Monitor response times during peak usage
- Clear old events periodically to maintain performance

#### Troubleshooting
1. Enable debug mode for detailed logs
2. Disable event filtering to see all events
3. Check real-time connection status
4. Use test event injection to verify pipeline

## 🛡️ Security Considerations

### Access Control
- Admin access is wallet-address based
- No session sharing between wallets
- Automatic logout on wallet disconnect

### Data Protection
- Configuration stored locally (no sensitive data in database)
- All admin actions logged to console
- Irreversible actions require confirmation

### Production Safety
- Admin panel has no access to user funds or sensitive operations
- Changes affect only UI behavior and monitoring
- Database modifications are limited to test data and metrics

## 🔄 Integration with LiveEventFeed

### Real-time Configuration Updates
The admin panel integrates seamlessly with the LiveEventFeed system:

1. **Configuration Broadcasting**: Changes are broadcast via custom events
2. **Dynamic Filtering**: Event filtering updates in real-time
3. **Performance Throttling**: Applied immediately without restart
4. **Debug Visibility**: Debug events show/hide based on admin settings

### Event Processing Pipeline
```
Game Event → Database → Real-time Subscription → Admin Config Filter → UI Display
```

### Supported Event Types
- **Game Events**: tap_activity, slap_events, evolution_events
- **Oracle Events**: prophecy_requests, lore_generation
- **System Events**: connection_changes, state_updates
- **Debug Events**: internal_state_change, heartbeat (visible in debug mode)

## 📈 Metrics and Analytics

### Available Metrics
- **Event Volume**: Total and hourly event counts
- **Connection Health**: Active connections and response times
- **Error Tracking**: Error rates and failure types
- **System Performance**: Uptime and availability

### Future Enhancements
- Historical trend analysis
- Automated alerting for critical issues
- User behavior analytics
- Performance benchmarking

## 🆘 Troubleshooting

### Common Issues

#### "Access Denied" Error
- **Cause**: Wallet address not in admin list
- **Solution**: Update `ADMIN_WALLET_ADDRESS` in AdminDashboard.tsx

#### Configuration Not Saving
- **Cause**: localStorage limitations or browser restrictions
- **Solution**: Check browser storage permissions, try different browser

#### Events Not Updating
- **Cause**: Real-time connection issues or filtering too restrictive
- **Solution**: Check real-time toggle, disable filtering temporarily

#### Performance Issues
- **Cause**: Too many events or throttling disabled
- **Solution**: Enable throttling, reduce max events per second

### Debug Steps
1. Open browser developer tools
2. Enable admin debug mode
3. Check console for detailed error messages
4. Verify Supabase connection status
5. Test with event injection feature

## 📝 Change Log

### Version 1.0 (Initial Release)
- Complete admin authentication system
- Real-time metrics dashboard
- LiveEventFeed configuration controls
- Performance throttling system
- Debug mode and logging
- Configuration export/import
- System administration tools

### Future Roadmap
- User management features
- Advanced analytics dashboard
- Automated monitoring alerts
- Custom event type filtering
- Historical data visualization
- Performance optimization tools

---

*For technical support or feature requests, refer to the main project documentation or contact the development team.* 