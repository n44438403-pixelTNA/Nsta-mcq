const fs = require('fs');

let content = fs.readFileSync('components/StudentDashboard.tsx', 'utf8');

// Remove class section from profile
const search = `                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-xs font-bold text-slate-600 uppercase mb-1">Class</p>
                            <p className="text-lg font-black text-slate-800">{user.classLevel} • {user.board} • {user.stream}</p>
                        </div>`;

content = content.replace(search, '');

fs.writeFileSync('components/StudentDashboard.tsx', content);
