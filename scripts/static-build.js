/**
 * Static build script for Azure Static Web Apps deployment.
 * Temporarily moves server-only API routes out of src/app/api/
 * so that `next build` with output: "export" can succeed.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiRenderDir = path.join(__dirname, '..', 'src', 'app', 'api', 'render');
const tmpDir = path.join(__dirname, '..', '.tmp-api-render');

const exists = fs.existsSync(apiRenderDir);

try {
  // Move server-only route out
  if (exists) {
    fs.renameSync(apiRenderDir, tmpDir);
    console.log('Temporarily moved api/render for static build');
  }

  // Run the build with static export
  execSync('npx cross-env STATIC_EXPORT=true next build', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
} finally {
  // Always restore
  if (exists && fs.existsSync(tmpDir)) {
    fs.renameSync(tmpDir, apiRenderDir);
    console.log('Restored api/render after build');
  }
}
