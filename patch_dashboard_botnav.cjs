const fs = require('fs');
let content = fs.readFileSync('components/StudentDashboard.tsx', 'utf8');

// remove AI Hub from bottom nav
content = content.replace(/\{\(\(\) => \{\s*const access = getFeatureAccess\('AI_CENTER'\);[\s\S]*?<span className="text-\[9px\] font-bold mt-1">AI Hub<\/span>\s*<\/button>\s*\);\s*\}\)\(\)\}/, '');

fs.writeFileSync('components/StudentDashboard.tsx', content);
