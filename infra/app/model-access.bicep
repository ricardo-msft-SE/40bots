param accountName string
param principalId string

resource account 'Microsoft.CognitiveServices/accounts@2024-10-01' existing = {
  name: accountName
}

var roleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd')
resource inferenceAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(account.id, principalId, roleId)
  scope: account
  properties: {
    roleDefinitionId: roleId
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
