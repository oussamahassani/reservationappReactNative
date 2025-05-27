
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

try {
  // Read the package.json file
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Add the dev script if it doesn't exist
  if (!packageJson.scripts.dev) {
    packageJson.scripts.dev = 'expo start';
    console.log('Added "dev" script to package.json');
  }

  // Add the build:dev script if it doesn't exist
  if (!packageJson.scripts['build:dev']) {
    packageJson.scripts['build:dev'] = 'vite build --mode development';
    console.log('Added "build:dev" script to package.json');
  }

  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Successfully updated package.json');
  console.log('Now you can run "npm run dev" or "npm run build:dev"');

} catch (error) {
  console.error('Error updating package.json:', error);
}
