/**
 * build-ignore.js
 * Used by Vercel 'Ignored Build Step' to skip redundant builds in the monorepo.
 * 
 * Usage in Vercel Dashboard:
 * Ignored Build Step: node ../../scripts/build-ignore.js [app-name]
 */

const { execSync } = require('child_process');

const appName = process.argv[2];

if (!appName) {
  console.error('❌ Build Ignore: No app name provided.');
  process.exit(1); // Build proceed by default on error
}

try {
  console.log(`[Build Ignore] Checking changes for: ${appName}`);

  // Vercel only provides the latest commit. We compare against the previous commit or the 'main' branch.
  // In Vercel, 'HEAD^' usually works if it's a push.
  const diff = execSync('git diff --name-only HEAD^ HEAD').toString();
  
  const relevantPaths = [
    `apps/${appName}`,
    'packages/',
    'pnpm-lock.yaml',
    'package.json'
  ];

  const hasChanges = relevantPaths.some(path => diff.includes(path));

  if (hasChanges) {
    console.log('✅ Changes detected in app or shared packages. Proceeding with build.');
    process.exit(1); // Exit with 1 tells Vercel to PROCEED
  } else {
    console.log('⏭️ No relevant changes detected. Skipping build to save deployment quota.');
    process.exit(0); // Exit with 0 tells Vercel to CANCEL
  }
} catch (e) {
  console.error('[Build Ignore] Error checking git diff. Defaulting to proceed build.');
  process.exit(1); // Default to build on error to be safe
}
