# msnodesqlv8 Visual Demo with HMR Support

## 🎯 Features

This demo provides a complete visual interface for testing msnodesqlv8 with Hot Module Replacement (HMR) support in Electron.

### 📱 Visual Interface
- **Connection Status Indicator** with animated status dot
- **Connection Management** buttons (Connect/Disconnect)
- **Sample Query Buttons** with real SQL examples
- **Results Display** with formatted tables
- **HMR Testing Controls** for module reload testing
- **System Information** panel

### 🔄 HMR Support
- Automatic module cleanup during hot reloads
- Manual module reload testing
- Connection state preservation
- Error handling and user feedback

## 🚀 How to Test

1. **Start the development server:**
   ```bash
   npm run electron:dev
   ```

2. **Test Database Connection:**
   - Click "Connect to Database" button
   - Status indicator will show connection progress
   - Success/error messages appear in results area

3. **Execute Sample Queries:**
   - **Show Tables**: Lists all tables in the database
   - **System Columns**: Shows system column information
   - **List Databases**: Displays available databases
   - **SQL Server Version**: Shows server version info

4. **Test HMR Functionality:**
   - Make changes to `renderer.js` (e.g., modify query text or add console.log)
   - Save the file and observe HMR in action
   - Use "Reload Module" button for manual testing
   - Check console for detailed HMR logs

## 📊 Sample Queries Included

### Show Tables
```sql
SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
```

### System Columns
```sql
SELECT TOP 10 name, object_id, column_id, system_type_id 
FROM sys.columns ORDER BY object_id
```

### List Databases
```sql
SELECT name, database_id, create_date 
FROM sys.databases ORDER BY name
```

### SQL Server Version
```sql
SELECT @@VERSION as Version, @@SERVERNAME as ServerName, 
DB_NAME() as DatabaseName
```

## 🔧 Key Technical Features

### Module Cleanup Function (`renderer.js:35-58`)
```javascript
function cleanupMSNodeSQLv8() {
    // Clears require cache for msnodesqlv8
    // Resets connection state
    // Updates UI indicators
}
```

### HMR Integration (`renderer.js:317-332`)
```javascript
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        // Handle module reload with UI feedback
    });
    
    import.meta.hot.dispose(() => {
        // Cleanup before reload
    });
}
```

### Connection Management (`renderer.js:81-125`)
- Async connection testing
- Real-time status updates
- Error handling with user feedback
- Button state management

### Results Display (`renderer.js:252-310`)
- Dynamic table generation
- Data type formatting
- Performance timing
- Scrollable results area

## 🎨 UI Components

### Status Indicator
- 🔴 Red: Disconnected
- 🟡 Yellow: Connecting
- 🟢 Green: Connected
- Animated pulse effect

### Query Buttons
- Disabled when not connected
- Visual hover effects
- Click feedback

### Results Area
- Formatted tables with sticky headers
- Error/success message display
- Query information display
- Scrollable for large datasets

## 🐛 Troubleshooting

### Connection Issues
1. Verify SQL Server is running on `127.0.0.1:1433`
2. Check ODBC Driver 18 installation
3. Update connection string in `renderer.js:6`
4. Review error messages in the results area

### HMR Issues
1. Use "Reload Module" button for manual testing
2. Check browser console for detailed logs
3. Verify Vite development server is running
4. Look for module cleanup messages

### Module Loading Issues
1. Ensure `require()` is available in renderer process
2. Check that msnodesqlv8 native module is properly built
3. Run `npx electron-rebuild` if needed

## 🔧 Configuration

### Connection String Format
```
Driver={ODBC Driver 18 for SQL Server};
Server=127.0.0.1,1433;
Database=node;
UID=node_user;
PWD=StrongPassword123!;
TrustServerCertificate=yes;
Connect Timeout=10
```

### Development Commands
```bash
npm run electron:dev    # Start development server
npm run build          # Build for production
npx electron-rebuild   # Rebuild native modules
```

## 📈 Expected Behavior

### Successful HMR Cycle
1. Make changes to `renderer.js`
2. Save file
3. Console shows: "🔥 HMR: Module reloading..."
4. Module cleanup occurs
5. Module reinitializes
6. UI shows: "HMR: Module reloaded successfully"
7. Connection state preserved if connected

### Error Handling
- Connection failures show specific error messages
- Module initialization errors are displayed
- HMR failures are logged with details
- UI remains responsive during errors