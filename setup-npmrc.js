const fs = require("fs");
const { execSync } = require("child_process");

// Load environment variables from .env file
const envFileContent = fs.readFileSync(".env", "utf-8");
const envVariables = envFileContent.split("\n").reduce((acc, line) => {
  const [key, value] = line.split("=").map((str) => str.trim());
  if (key && value) {
    acc[key] = value;
  }
  return acc;
}, {});

const {
  CODEARTIFACT_DOMAIN,
  CODEARTIFACT_DOMAIN_OWNER,
  AWS_REGION,
  CODEARTIFACT_REPOSITORY,
} = envVariables;

// Generate the CodeArtifact auth token using AWS CLI
const CODEARTIFACT_AUTH_TOKEN = execSync(
  `aws codeartifact get-authorization-token --domain ${CODEARTIFACT_DOMAIN} --domain-owner ${CODEARTIFACT_DOMAIN_OWNER} --region ${AWS_REGION} --query authorizationToken --output text`
)
  .toString()
  .trim();

// Create the .npmrc file
const npmrcContent = `
registry=https://registry.npmjs.org/

registry=https://${CODEARTIFACT_DOMAIN}-${CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${CODEARTIFACT_REPOSITORY}
//${CODEARTIFACT_DOMAIN}-${CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${CODEARTIFACT_REPOSITORY}/:_authToken=${CODEARTIFACT_AUTH_TOKEN}
`;

fs.writeFileSync(".npmrc", npmrcContent);

console.log(".npmrc file has been created.");
