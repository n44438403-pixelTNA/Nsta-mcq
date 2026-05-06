const fs = require('fs');
let content = fs.readFileSync('components/StudentSidebar.tsx', 'utf8');

// remove offline downloads and ai history and sub history
const search1 = `        { id: 'HISTORY', icon: History, label: 'Cloud History', color: 'text-slate-600', featureId: 'f21', category: 'LEARNING' },
        { id: 'ANALYTICS', icon: Trophy, label: 'Test Analysis', color: 'text-teal-600', featureId: 'f50', category: 'LEARNING' },
        { id: 'AI_HISTORY' as any, icon: BrainCircuit, label: 'AI History', color: 'text-indigo-600', featureId: 'f101', category: 'LEARNING' },
        { id: 'DOWNLOADS' as any, icon: Download, label: 'Offline Downloads', color: 'text-blue-500', category: 'LEARNING' },`;

const replace1 = `        { id: 'HISTORY', icon: History, label: 'Cloud History', color: 'text-slate-600', featureId: 'f21', category: 'LEARNING' },
        { id: 'ANALYTICS', icon: Trophy, label: 'Test Analysis', color: 'text-teal-600', featureId: 'f50', category: 'LEARNING' },`;

const search2 = `        { id: 'STORE', icon: Crown, label: 'Premium Store', color: 'text-yellow-600', featureId: 'f12', category: 'PREMIUM' },
        { id: 'SUB_HISTORY' as any, icon: CreditCard, label: 'My Plan', color: 'text-blue-600', featureId: 'f11', category: 'PREMIUM' },
        { id: 'REDEEM', icon: Gift, label: 'Redeem Code', color: 'text-pink-600', category: 'PREMIUM' },`;

const replace2 = `        { id: 'STORE', icon: Crown, label: 'Premium Store', color: 'text-yellow-600', featureId: 'f12', category: 'PREMIUM' },
        { id: 'REDEEM', icon: Gift, label: 'Redeem Code', color: 'text-pink-600', category: 'PREMIUM' },`;


content = content.replace(search1, replace1).replace(search2, replace2);
fs.writeFileSync('components/StudentSidebar.tsx', content);
