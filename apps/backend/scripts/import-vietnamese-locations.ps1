$ErrorActionPreference = 'Stop'

$backendRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $backendRoot '.env'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Backend environment file was not found: $envFile"
}

$temporaryDirectory = Join-Path $env:TEMP 'job-platform-vietnamese-locations'
$schemaFile = Join-Path $temporaryDirectory 'schema.sql'
$dataFile = Join-Path $temporaryDirectory 'data.sql'
$runnerFile = Join-Path $temporaryDirectory 'import-locations.cjs'
$sourceBaseUrl = 'https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/master/postgresql'

New-Item -ItemType Directory -Force -Path $temporaryDirectory | Out-Null

$schemaSql = (Invoke-WebRequest -UseBasicParsing -Uri "$sourceBaseUrl/postgres_CreateTables_vn_units.sql").Content
$dataSql = (Invoke-WebRequest -UseBasicParsing -Uri "$sourceBaseUrl/postgres_ImportData_vn_units.sql").Content

# The application only needs administrative units, provinces, and wards.
# Remove the optional regional lookup table and its seed records from the upstream dataset.
$schemaSql = $schemaSql -replace '(?m)^-- DROP TABLE IF EXISTS administrative_regions;\r?\n?', ''
$schemaSql = $schemaSql -replace '(?s)-- CREATE administrative_regions TABLE.*?(?=-- CREATE administrative_units TABLE)', ''
$dataSql = $dataSql -replace '(?s)-- DATA for administrative_regions --.*?(?=-- DATA for administrative_units --)', ''

Set-Content -LiteralPath $schemaFile -Value $schemaSql -Encoding utf8
Set-Content -LiteralPath $dataFile -Value $dataSql -Encoding utf8

$nodeScript = @'
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const [envFile, schemaFile, dataFile, backendRoot] = process.argv.slice(2);
const requireFromBackend = createRequire(path.join(backendRoot, "package.json"));
const { Client } = requireFromBackend("pg");
requireFromBackend("dotenv").config({ path: envFile, quiet: true });

const sslEnabled = process.env.DB_SSL === "true" || process.env.DB_SSL === "1";
const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "job_platform",
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

(async () => {
  await client.connect();
  try {
    const result = await client.query(
      "SELECT to_regclass('public.provinces') IS NOT NULL AS installed",
    );

    if (result.rows[0].installed) {
      console.log("Vietnamese administrative data is already installed.");
      return;
    }

    await client.query("BEGIN");
    await client.query(fs.readFileSync(schemaFile, "utf8").replace(/^\uFEFF/, ""));
    await client.query(fs.readFileSync(dataFile, "utf8").replace(/^\uFEFF/, ""));
    await client.query("COMMIT");
    console.log("Vietnamese administrative data imported successfully.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error("Could not import Vietnamese administrative data:", error);
  process.exitCode = 1;
});
'@
Set-Content -LiteralPath $runnerFile -Value $nodeScript -Encoding utf8

Push-Location $backendRoot
try {
  & node $runnerFile $envFile $schemaFile $dataFile $backendRoot
  if ($LASTEXITCODE -ne 0) { throw 'Could not import Vietnamese administrative data.' }
} finally {
  Pop-Location
}
