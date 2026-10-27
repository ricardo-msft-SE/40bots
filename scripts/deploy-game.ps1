param(
    [ValidateSet('Provision', 'Resolve', 'Publish')][string]$Stage,
    [string]$SubscriptionId = 'ee0073ce-de38-45ed-a940-4dbfd9435dc1'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$plan = Get-Content -LiteralPath (Join-Path $root '.azure\deployment-plan.md') -Raw
if ($plan -notmatch '(?m)^Status: (Validated|Deployed)\r?$') { throw 'Complete azure-validate before deployment.' }
$contextPath = Join-Path $root '.azure\game-context.json'
$context = Get-Content -LiteralPath $contextPath -Raw | ConvertFrom-Json
if (-not $context.apiClientId -or $context.apiClientId -eq '00000000-0000-0000-0000-000000000000') {
    throw 'Create the approved app registrations before provisioning.'
}
$account = (& az account show --subscription $SubscriptionId --query '{id:id,tenantId:tenantId}' -o json | ConvertFrom-Json)
if ($LASTEXITCODE -ne 0 -or $account.tenantId -ne $context.tenantId) { throw 'Azure subscription/tenant does not match the configured identity.' }
Push-Location $root
try {
    if ($Stage -in @('Provision', 'Resolve')) {
        if ($Stage -eq 'Provision') {
            $outputs = & az deployment sub create --subscription $SubscriptionId --location eastus2 `
                --name which-tool-game --template-file infra\main.bicep `
                --parameters infra\main.parameters.json "apiAudience=$($context.apiClientId)" `
                --query properties.outputs --only-show-errors --output json
        } else {
            $outputs = & az deployment sub show --subscription $SubscriptionId --name which-tool-game `
                --query properties.outputs --only-show-errors --output json
        }
        if ($LASTEXITCODE -ne 0) { throw 'Could not obtain successful infrastructure deployment outputs.' }
        $values = ($outputs -join "`n" | ConvertFrom-Json)
        $name = $values.AZURE_FUNCTION_NAME.value
        $group = $values.RESOURCE_GROUP_NAME.value
        $hostResult = & az functionapp show --name $name --resource-group $group --subscription $SubscriptionId `
            --query '{standard:defaultHostName,raw:properties.defaultHostName}' --output json
        if ($LASTEXITCODE -ne 0) { throw 'Could not read the Function hostname.' }
        $hostData = $hostResult -join "`n" | ConvertFrom-Json
        $hostname = if ($hostData.raw) { $hostData.raw } else { $hostData.standard }
        if (-not $hostname -or $hostname -notmatch '^[a-z0-9][a-z0-9.-]+\.azurewebsites\.net$') {
            throw 'Azure returned no valid Function hostname; public configuration was not updated.'
        }
        $context | Add-Member -Force NoteProperty functionName $name
        $context | Add-Member -Force NoteProperty resourceGroup $group
        $context | Add-Member -Force NoteProperty apiUrl "https://$hostname/api/recommend"
        $context | Add-Member -Force NoteProperty identityPrincipalId $values.API_IDENTITY_PRINCIPAL_ID.value
        $context | Add-Member -Force NoteProperty identityClientId $values.API_IDENTITY_CLIENT_ID.value
        $context | Add-Member -Force NoteProperty storageAccount $values.STORAGE_ACCOUNT_NAME.value
        $context | ConvertTo-Json | Set-Content -LiteralPath $contextPath -Encoding utf8
        $context | ConvertTo-Json
    } elseif ($Stage -eq 'Publish') {
        if (-not $context.functionName -or -not $context.resourceGroup -or -not $context.storageAccount) {
            throw 'Resolve successful infrastructure deployment outputs first.'
        }
        $networkResult = & az functionapp show --name $context.functionName --resource-group $context.resourceGroup `
            --subscription $SubscriptionId --query '{standard:virtualNetworkSubnetId,raw:properties.virtualNetworkSubnetId}' --output json
        if ($LASTEXITCODE -ne 0) { throw 'Could not verify Function VNet integration before publishing.' }
        $network = $networkResult -join "`n" | ConvertFrom-Json
        $subnetId = if ($network.raw) { $network.raw } else { $network.standard }
        $storageResult = & az storage account show --name $context.storageAccount --resource-group $context.resourceGroup `
            --subscription $SubscriptionId --query publicNetworkAccess --output tsv
        if ($LASTEXITCODE -ne 0 -or $storageResult -notin @('Enabled', 'Disabled', 'SecuredByPerimeter')) {
            throw 'Could not verify effective storage public network access before publishing.'
        }
        if ($storageResult -ne 'Enabled' -and -not $subnetId) {
            throw 'Storage public access is restricted and the Function has no VNet integration. Validate approved private endpoints and DNS before publishing; do not override policy or enable shared keys.'
        }
        & npm run build:api
        if ($LASTEXITCODE -ne 0) { throw 'API packaging failed.' }
        & npm ci --omit=dev --prefix dist-api --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Production dependency restore failed.' }
        $archive = Join-Path $root '.azure\game-api.zip'
        Compress-Archive -Path (Join-Path $root 'dist-api\*') -DestinationPath $archive -Force
        & az functionapp deployment source config-zip --subscription $SubscriptionId `
            --resource-group $context.resourceGroup --name $context.functionName `
            --src $archive --build-remote false --only-show-errors --output none
        if ($LASTEXITCODE -ne 0) { throw 'API publishing failed.' }
        Write-Output "Published API: $($context.apiUrl)"
    } else {
        throw 'Specify -Stage Provision, -Stage Resolve, or -Stage Publish.'
    }
} finally {
    Pop-Location
}
