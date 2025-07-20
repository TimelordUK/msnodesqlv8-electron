#!/usr/bin/env node

// Quick debug test for msnodesqlv8 loading (CommonJS version)
console.log('🔍 Debug Test for msnodesqlv8 (CommonJS)');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

try {
    console.log('\n📦 Testing module loading...');
    const sql = require('msnodesqlv8');
    console.log('✅ msnodesqlv8 loaded successfully');
    console.log('Available methods:', Object.keys(sql).slice(0, 10).join(', '));
    
    if (sql.meta) {
        console.log('Module metadata:', sql.meta);
    }
    
    console.log('\n🔌 Testing connection (this will likely fail without SQL Server)...');
    const connectionString = "Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;Connect Timeout=10";
    
    sql.query(connectionString, "SELECT 1 as test", (err, result) => {
        if (err) {
            console.log('❌ Connection failed (expected):', err.message);
            if (err.code) console.log('Error code:', err.code);
            if (err.sqlstate) console.log('SQL State:', err.sqlstate);
            
            // Common error diagnostics
            if (err.message.includes('ODBC Driver')) {
                console.log('💡 Hint: Install ODBC Driver 18 for SQL Server');
            } else if (err.message.includes('server was not found')) {
                console.log('💡 Hint: SQL Server is not running on 127.0.0.1:1433');
            } else if (err.message.includes('Login failed')) {
                console.log('💡 Hint: Check username/password in connection string');
            }
        } else {
            console.log('✅ Connection successful:', result);
        }
    });
    
} catch (error) {
    console.error('❌ Module loading failed:', error.message);
    console.error('Error details:', error);
}

console.log('\n📋 Summary:');
console.log('- If module loads but connection fails: SQL Server setup issue');
console.log('- If module fails to load: Native module compilation issue');
console.log('- Run "npx electron-rebuild" if you see native module errors');