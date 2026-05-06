sed -i '/const handleIgnoreReward = () => {/,/      if (!activeReward || !state.user) return;/d' ./App.tsx
sed -i '/const updatedUser = {/i\
  const handleIgnoreReward = () => {\
      if (!activeReward || !state.user) return;\
' ./App.tsx
sed -i '/pendingRewards: \[.../a\
      };\
      if (activeReward.label === '"'"'Daily Login Bonus'"'"' || activeReward.id.startsWith('"'"'login-bonus-'"'"')) {\
          updatedUser.lastLoginRewardDate = new Date().toISOString();\
      }\
' ./App.tsx
