
const fs = require('fs');
const path = require('path');

// Path to the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');

try {
  // Read the package.json file
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // Add the missing scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Add dev script if it doesn't exist
  if (!packageJson.scripts.dev) {
    packageJson.scripts.dev = 'vite';
    console.log('Added "dev" script to package.json');
  }

  // Add build:dev script if it doesn't exist
  if (!packageJson.scripts['build:dev']) {
    packageJson.scripts['build:dev'] = 'vite build --mode development';
    console.log('Added "build:dev" script to package.json');
  }

  // Write the updated package.json back to the file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Successfully updated package.json');
  console.log('You can now run "npm run dev" to start the development server');

} catch (error) {
  console.error('Error updating package.json:', error.message);
}
