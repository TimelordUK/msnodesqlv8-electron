/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
 const connectionString  = "Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;;Connect Timeout=10"

const sql = require('msnodesqlv8')

const query = 'SELECT top 2 * FROM syscolumns'

async function runner() {
    console.log(`using connection '${connectionString}' run query '${query}'`)
    const res = await sql.promises.query(connectionString, query)
    console.log(JSON.stringify(res, null, 4))
}

runner().then(() => {
    console.log('done.')
}).catch(e => {
    console.error(e)
})
