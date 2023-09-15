export const createProjectQuery =
  'mutation createProject ($companyId: Int!, $label: String!, $goal: String!, $scope: String!, $typeId: Int!,$startDate: ISO8601Date!, $tags: [String!]) { createProject( input: { companyId: $companyId label: $label goal: $goal playbooksIds: [1] scope: $scope typeId: $typeId startDate: $startDate tags: $tags } ) { errors project { apiCode id pid } } }';
