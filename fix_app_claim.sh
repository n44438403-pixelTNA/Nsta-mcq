sed -i '/if (activeReward.type === '"'"'COINS'"'"') {/i\
      if (activeReward.label === '"'"'Daily Login Bonus'"'"' || activeReward.id.startsWith('"'"'login-bonus-'"'"')) {\
          updatedUser.lastLoginRewardDate = new Date().toISOString();\
      }' ./App.tsx
