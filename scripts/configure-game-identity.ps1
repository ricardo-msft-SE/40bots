param(
    [Parameter(Mandatory)][string]$TenantId,
    [Parameter(Mandatory)][string]$PresenterObjectId,
    [string]$SiteUrl = 'https://ricardo-msft-se.github.io/40bots/which-tool/',
    [switch]$EnableCliVerification
)
$ErrorActionPreference = 'Stop'
$marker = '40bots which-tool-game; managed by scripts/configure-game-identity.ps1'

function Invoke-AzJson {
    param([string[]]$Arguments)
    $result = & az @Arguments --only-show-errors --output json
    if ($LASTEXITCODE -ne 0) { throw "Azure CLI failed: $($Arguments[0..([Math]::Min(2, $Arguments.Count - 1))] -join ' ')" }
    if ($result) { return ($result -join "`n" | ConvertFrom-Json) }
}

function Invoke-Graph {
    param([string]$Method, [string]$Path, [object]$Body)
    $arguments = @('rest', '--method', $Method, '--url', "https://graph.microsoft.com/v1.0/$Path")
    $temporary = $null
    try {
        if ($null -ne $Body) {
            $temporary = [System.IO.Path]::GetTempFileName()
            $Body | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $temporary -Encoding utf8
            $arguments += @('--headers', 'Content-Type=application/json', '--body', "@$temporary")
        }
        Invoke-AzJson $arguments
    } finally {
        if ($temporary) { Remove-Item -LiteralPath $temporary -Force }
    }
}

function Get-GameApp {
    param([string]$Name)
    $apps = @(Invoke-AzJson @('ad', 'app', 'list', '--display-name', $Name) | Where-Object { $_.displayName -eq $Name })
    if ($apps.Count -gt 1) { throw "Multiple applications named $Name; refusing an ambiguous update." }
    if ($apps.Count -eq 1) {
        if ($apps[0].notes -ne $marker) { throw "$Name exists without this project's ownership marker; refusing to modify it." }
        return $apps[0]
    }
    $app = Invoke-AzJson @('ad', 'app', 'create', '--display-name', $Name, '--sign-in-audience', 'AzureADMyOrg')
    Invoke-Graph 'PATCH' "applications/$($app.id)" @{ notes = $marker } | Out-Null
    return $app
}

function Get-ServicePrincipal {
    param([string]$AppId)
    $principals = @(Invoke-AzJson @('ad', 'sp', 'list', '--filter', "appId eq '$AppId'", '--query', '[].{id:id,appId:appId}'))
    if ($principals.Count -gt 1) { throw 'Ambiguous service principal.' }
    if ($principals.Count -eq 1) { return $principals[0] }
    return Invoke-AzJson @('ad', 'sp', 'create', '--id', $AppId, '--query', '{id:id,appId:appId}')
}

function Grant-PresenterConsent {
    param([string]$ClientPrincipalId, [string]$ResourcePrincipalId)
    $filter = [uri]::EscapeDataString("clientId eq '$ClientPrincipalId'")
    $grants = Invoke-Graph 'GET' "oauth2PermissionGrants?`$filter=$filter" $null
    $existing = @($grants.value | Where-Object {
        $_.resourceId -eq $ResourcePrincipalId -and $_.principalId -eq $PresenterObjectId -and $_.consentType -eq 'Principal'
    })
    if ($existing.Count -gt 1) { throw 'Ambiguous delegated grant.' }
    if ($existing.Count -eq 1) {
        if ($existing[0].scope -ne 'Recommend') { throw 'Existing grant has unexpected scopes; refusing to overwrite it.' }
        return
    }
    Invoke-Graph 'POST' 'oauth2PermissionGrants' @{
        clientId = $ClientPrincipalId
        resourceId = $ResourcePrincipalId
        consentType = 'Principal'
        principalId = $PresenterObjectId
        scope = 'Recommend'
    } | Out-Null
}

$account = Invoke-AzJson @('account', 'show', '--query', '{tenantId:tenantId}')
if ($account.tenantId -ne $TenantId) { throw 'Azure CLI is signed in to a different tenant.' }
$presenter = Invoke-AzJson @('ad', 'signed-in-user', 'show', '--query', '{id:id}')
if ($presenter.id -ne $PresenterObjectId) { throw 'CLI user does not match the approved presenter.' }

$api = Get-GameApp 'Which Tool Game API'
$spa = Get-GameApp 'Which Tool Game Presenter'
$existingScope = @($api.api.oauth2PermissionScopes | Where-Object { $_.value -eq 'Recommend' })
$scopeId = if ($existingScope.Count -eq 1) { $existingScope[0].id } else { [guid]::NewGuid().ToString() }
$scope = @{
    id = $scopeId; value = 'Recommend'; type = 'User'; isEnabled = $true
    adminConsentDisplayName = 'Request a tool recommendation'
    adminConsentDescription = 'Submit fictional work scenarios to the Which Tool game API.'
    userConsentDisplayName = 'Request a tool recommendation'
    userConsentDescription = 'Submit fictional work scenarios to the Which Tool game API.'
}
Invoke-Graph 'PATCH' "applications/$($api.id)" @{
    identifierUris = @("api://$($api.appId)")
    api = @{
        requestedAccessTokenVersion = 2
        oauth2PermissionScopes = @($scope)
    }
} | Out-Null
Invoke-Graph 'PATCH' "applications/$($spa.id)" @{
    spa = @{ redirectUris = @($SiteUrl, 'http://localhost:8000/which-tool/') }
    requiredResourceAccess = @(@{ resourceAppId = $api.appId; resourceAccess = @(@{ id = $scopeId; type = 'Scope' }) })
} | Out-Null

$apiPrincipal = Get-ServicePrincipal $api.appId
$spaPrincipal = Get-ServicePrincipal $spa.appId
Grant-PresenterConsent $spaPrincipal.id $apiPrincipal.id
if ($EnableCliVerification) {
    $cli = Get-ServicePrincipal '04b07795-8ddb-461a-bbee-02f9e1bf7b46'
    Grant-PresenterConsent $cli.id $apiPrincipal.id
}
$context = @{
    tenantId = $TenantId; presenterObjectId = $PresenterObjectId
    apiClientId = $api.appId; spaClientId = $spa.appId
    scope = "api://$($api.appId)/Recommend"; redirectUri = $SiteUrl
    apiServicePrincipalId = $apiPrincipal.id; spaServicePrincipalId = $spaPrincipal.id
}
$contextPath = Join-Path $PSScriptRoot '..\.azure\game-context.json'
$context | ConvertTo-Json | Set-Content -LiteralPath $contextPath -Encoding utf8
$context | ConvertTo-Json
