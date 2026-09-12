const { app, dialog } = require('electron')
process.on('uncaughtException', e => { console.error('UNCAUGHT:', e.message); app.exit(1) })
const cs = "Driver={ODBC Driver 18 for SQL Server};Server=127.0.0.1,1433;Database=node;UID=node_user;PWD=StrongPassword123!;TrustServerCertificate=yes;Connect Timeout=10"
app.whenReady().then(async () => {
  console.log('electron', process.versions.electron, '| node', process.versions.node, '| napi', process.versions.napi, '| abi', process.versions.modules)
  let sql
  try {
    sql = require('msnodesqlv8')
    console.log('NATIVE ADDON LOADED OK, sql.open is', typeof sql.open)
  } catch (e) { console.error('LOAD FAILED:', e.message); return app.exit(2) }
  try {
    const rows = await sql.promises.query(cs, "select @@VERSION as v, 1+1 as two")
    console.log('QUERY OK:', JSON.stringify(rows).slice(0, 220))
  } catch (e) { console.error('QUERY FAILED:', e.message) }
  app.exit(0)
})
