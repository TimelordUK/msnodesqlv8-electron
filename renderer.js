/**
 * msnodesqlv8 Demo with Visual Interface and HMR Support
 * This file demonstrates HMR with msnodesqlv8 and provides a rich UI for testing
 */

const connectionString = "Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;;Connect Timeout=10";

let sql = null;
let isConnected = false;
let lastError = null;

// Sample queries for demonstration
const queries = {
  tables: {
    name: "Show Tables",
    sql: "SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  },
  columns: {
    name: "System Columns",
    sql: "SELECT TOP 10 name, object_id, column_id, system_type_id FROM sys.columns ORDER BY object_id"
  },
  databases: {
    name: "List Databases", 
    sql: "SELECT name, database_id, create_date FROM sys.databases ORDER BY name"
  },
  version: {
    name: "SQL Server Version",
    sql: "SELECT @@VERSION as Version, @@SERVERNAME as ServerName, DB_NAME() as DatabaseName"
  }
};

// UI Elements
let elements = {};

// Module reload utilities for HMR
function cleanupMSNodeSQLv8() {
    console.log('🧹 Cleaning up msnodesqlv8 module...');
    try {
        if (typeof require !== 'undefined' && sql) {
            const modulePath = require.resolve('msnodesqlv8');
            delete require.cache[modulePath];
            
            // Clear any related cache entries
            Object.keys(require.cache).forEach(key => {
                if (key.includes('msnodesqlv8')) {
                    delete require.cache[key];
                }
            });
        }
        
        sql = null;
        isConnected = false;
        updateConnectionStatus('disconnected', 'Module cleaned up');
        console.log('✅ msnodesqlv8 module cleanup completed');
    } catch (error) {
        console.error('❌ Error during module cleanup:', error);
        showMessage('Module cleanup failed: ' + error.message, 'error');
    }
}

async function initializeMSNodeSQLv8() {
    try {
        console.log('🚀 Initializing msnodesqlv8 module...');
        
        if (typeof require !== 'undefined') {
            sql = require('msnodesqlv8');
            console.log('✅ msnodesqlv8 module initialized successfully');
            lastError = null;
            updateDebugInfo();
            return true;
        } else {
            console.error('❌ require() not available - msnodesqlv8 needs CommonJS support');
            lastError = new Error('require() not available in this environment');
            showMessage('require() not available in this environment', 'error');
            updateDebugInfo();
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to initialize msnodesqlv8:', error);
        lastError = error;
        showMessage('Failed to initialize msnodesqlv8: ' + error.message, 'error');
        updateDebugInfo();
        return false;
    }
}

// Connection management
async function connectToDatabase() {
    console.log('🔌 Starting connection process...');
    console.log('Connection string:', connectionString.replace(/PWD=[^;]+/, 'PWD=***'));
    
    if (!sql && !(await initializeMSNodeSQLv8())) {
        console.error('❌ Failed to initialize msnodesqlv8 module');
        showMessage('Failed to initialize msnodesqlv8 module', 'error');
        return false;
    }

    updateConnectionStatus('connecting', 'Connecting to database...');
    enableQueryButtons(false);

    try {
        console.log('🔌 Testing database connection...');
        console.log('Using msnodesqlv8 version:', sql.meta ? sql.meta.version : 'unknown');
        
        // Test connection with a simple query
        console.log('📡 Executing test query...');
        const result = await sql.promises.query(connectionString, "SELECT 1 as TestConnection, @@VERSION as Version");
        
        console.log('✅ Query result received:', result);
        
        isConnected = true;
        updateConnectionStatus('connected', 'Connected to SQL Server');
        enableQueryButtons(true);
        
        console.log('✅ Database connection successful');
        showMessage('Successfully connected to SQL Server', 'success');
        
        // Show connection info
        if (result && result.length > 0) {
            const version = result[0].Version;
            console.log('📊 SQL Server version:', version);
            showMessage(`Connected to: ${version.split('\n')[0]}`, 'success');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            sqlstate: error.sqlstate,
            stack: error.stack
        });
        
        isConnected = false;
        updateConnectionStatus('disconnected', 'Connection failed');
        enableQueryButtons(false);
        
        // Show detailed error information
        let errorMsg = error.message;
        if (error.code) errorMsg += ` (Code: ${error.code})`;
        if (error.sqlstate) errorMsg += ` (SQL State: ${error.sqlstate})`;
        
        showMessage('Connection failed: ' + errorMsg, 'error');
        
        // Add specific troubleshooting hints
        if (error.message.includes('Login failed')) {
            showMessage('Hint: Check username and password in connection string', 'error');
        } else if (error.message.includes('server was not found')) {
            showMessage('Hint: Check server address and port (127.0.0.1:1433)', 'error');
        } else if (error.message.includes('ODBC Driver')) {
            showMessage('Hint: Install ODBC Driver 18 for SQL Server', 'error');
        }
        
        return false;
    }
}

function disconnectFromDatabase() {
    console.log('🔌 Disconnecting from database...');
    isConnected = false;
    updateConnectionStatus('disconnected', 'Disconnected');
    enableQueryButtons(false);
    showMessage('Disconnected from database', 'success');
}

// Query execution
async function executeQuery(queryKey) {
    if (!isConnected || !sql) {
        showMessage('Not connected to database', 'error');
        return;
    }

    const query = queries[queryKey];
    if (!query) {
        showMessage('Unknown query type', 'error');
        return;
    }

    try {
        showQueryInfo(query.name, query.sql);
        console.log(`🔍 Executing query: ${query.name}`);
        
        const startTime = Date.now();
        const result = await sql.promises.query(connectionString, query.sql);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Query completed in ${duration}ms, ${result.length} rows returned`);
        displayResults(result, query.name, duration);
        
    } catch (error) {
        console.error('❌ Query execution failed:', error);
        showMessage(`Query failed: ${error.message}`, 'error');
    }
}

// UI Management
function initializeUI() {
    // Cache DOM elements
    elements = {
        connectionStatus: document.getElementById('connection-status'),
        statusText: document.querySelector('.status-text'),
        connectBtn: document.getElementById('connect-btn'),
        disconnectBtn: document.getElementById('disconnect-btn'),
        queryButtons: {
            tables: document.getElementById('query-tables'),
            columns: document.getElementById('query-columns'),
            databases: document.getElementById('query-databases'),
            version: document.getElementById('query-version')
        },
        reloadBtn: document.getElementById('reload-module'),
        clearBtn: document.getElementById('clear-results'),
        toggleDebugBtn: document.getElementById('toggle-debug'),
        debugSection: document.getElementById('debug-section'),
        debugModuleStatus: document.getElementById('debug-module-status'),
        debugConnectionString: document.getElementById('debug-connection-string'),
        debugLastError: document.getElementById('debug-last-error'),
        resultsContainer: document.getElementById('results-container'),
        nodeVersion: document.getElementById('node-version'),
        chromeVersion: document.getElementById('chrome-version'),
        electronVersion: document.getElementById('electron-version')
    };

    // Set up event listeners
    elements.connectBtn.addEventListener('click', connectToDatabase);
    elements.disconnectBtn.addEventListener('click', disconnectFromDatabase);
    
    Object.keys(elements.queryButtons).forEach(key => {
        elements.queryButtons[key].addEventListener('click', () => executeQuery(key));
    });
    
    elements.reloadBtn.addEventListener('click', async () => {
        console.log('🔄 Manual module reload triggered');
        cleanupMSNodeSQLv8();
        setTimeout(async () => {
            if (await initializeMSNodeSQLv8()) {
                showMessage('Module reloaded successfully', 'success');
            }
        }, 100);
    });
    
    elements.clearBtn.addEventListener('click', clearResults);
    
    elements.toggleDebugBtn.addEventListener('click', () => {
        const isHidden = elements.debugSection.style.display === 'none';
        elements.debugSection.style.display = isHidden ? 'block' : 'none';
        elements.toggleDebugBtn.textContent = isHidden ? 'Hide Debug Info' : 'Toggle Debug Info';
        if (isHidden) updateDebugInfo();
    });

    // Display system information
    if (elements.nodeVersion) elements.nodeVersion.textContent = process.versions.node;
    if (elements.chromeVersion) elements.chromeVersion.textContent = process.versions.chrome;
    if (elements.electronVersion) elements.electronVersion.textContent = process.versions.electron;

    // Initialize debug info
    updateDebugInfo();

    console.log('🎮 UI initialized');
}

function updateConnectionStatus(status, message) {
    if (!elements.connectionStatus) return;
    
    elements.connectionStatus.className = `status-indicator ${status}`;
    if (elements.statusText) {
        elements.statusText.textContent = message;
    }
    
    // Update button states
    if (elements.connectBtn && elements.disconnectBtn) {
        elements.connectBtn.disabled = (status === 'connected' || status === 'connecting');
        elements.disconnectBtn.disabled = (status !== 'connected');
    }
}

function enableQueryButtons(enabled) {
    Object.values(elements.queryButtons).forEach(btn => {
        if (btn) btn.disabled = !enabled;
    });
}

function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `${type}-message`;
    messageEl.textContent = message;
    
    // Remove existing messages of the same type
    const existing = elements.resultsContainer.querySelector(`.${type}-message`);
    if (existing) existing.remove();
    
    elements.resultsContainer.insertAdjacentElement('afterbegin', messageEl);
}

function showQueryInfo(name, sql) {
    const queryInfoEl = document.createElement('div');
    queryInfoEl.className = 'query-info';
    queryInfoEl.innerHTML = `<strong>${name}:</strong> ${sql}`;
    
    // Remove existing query info
    const existing = elements.resultsContainer.querySelector('.query-info');
    if (existing) existing.remove();
    
    elements.resultsContainer.insertAdjacentElement('afterbegin', queryInfoEl);
}

function displayResults(data, queryName, duration) {
    // Clear previous results
    const noData = elements.resultsContainer.querySelector('.no-data');
    if (noData) noData.remove();
    
    const existingTable = elements.resultsContainer.querySelector('.results-table');
    if (existingTable) existingTable.remove();

    if (!data || data.length === 0) {
        showMessage('Query returned no results', 'info');
        return;
    }

    // Create table
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const columns = Object.keys(data[0]);
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            const value = row[col];
            
            // Format different data types
            if (value instanceof Date) {
                td.textContent = value.toLocaleString();
            } else if (typeof value === 'object' && value !== null) {
                td.textContent = JSON.stringify(value);
            } else {
                td.textContent = value !== null ? value.toString() : 'NULL';
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    elements.resultsContainer.appendChild(table);
    
    // Show summary
    showMessage(`${data.length} rows returned in ${duration}ms`, 'success');
}

function clearResults() {
    elements.resultsContainer.innerHTML = '<div class="no-data">No data to display. Connect to database and run a query.</div>';
}

function updateDebugInfo() {
    if (!elements.debugModuleStatus) return;
    
    // Update module status
    if (sql) {
        elements.debugModuleStatus.textContent = 'Loaded ✅';
    } else {
        elements.debugModuleStatus.textContent = 'Not loaded ❌';
    }
    
    // Update connection string (masked)
    const maskedConnectionString = connectionString.replace(/PWD=[^;]+/, 'PWD=***');
    elements.debugConnectionString.textContent = maskedConnectionString;
    
    // Update last error
    if (lastError) {
        let errorText = lastError.message;
        if (lastError.code) errorText += ` (${lastError.code})`;
        elements.debugLastError.textContent = errorText;
        elements.debugLastError.style.color = '#dc3545';
    } else {
        elements.debugLastError.textContent = 'None';
        elements.debugLastError.style.color = '#28a745';
    }
}

// HMR support
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        console.log('🔥 HMR: Module reloading...');
        cleanupMSNodeSQLv8();
        setTimeout(async () => {
            if (await initializeMSNodeSQLv8()) {
                showMessage('HMR: Module reloaded successfully', 'success');
            }
        }, 100);
    });

    import.meta.hot.dispose(() => {
        console.log('🔥 HMR: Disposing module...');
        cleanupMSNodeSQLv8();
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Application starting...');
    initializeUI();
    
    // Initialize module but don't auto-connect
    await initializeMSNodeSQLv8();
    
    console.log('✅ Application ready');
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    cleanupMSNodeSQLv8();
});