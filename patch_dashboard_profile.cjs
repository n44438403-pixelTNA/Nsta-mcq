const fs = require('fs');

let content = fs.readFileSync('components/StudentDashboard.tsx', 'utf8');

// Remove Sub History button
content = content.replace(/<button[^>]*onClick={\(\) => onTabChange\('SUB_HISTORY' as any\)}[\s\S]*?<\/button>/, '');

// Remove Teacher Store button
content = content.replace(/\{\/\* TEACHER UPGRADE \/ STORE BUTTON \*\/\}\s*<button[^>]*onClick={\(\) => onTabChange\('TEACHER_STORE' as any\)}[\s\S]*?<\/button>/, '');

// Fix grid layout class (if it was grid-cols-2 and we removed buttons, maybe leave it or change to grid-cols-2)
// Since we are removing two buttons, the edit profile and marksheet remain, so grid-cols-2 works fine.

fs.writeFileSync('components/StudentDashboard.tsx', content);
