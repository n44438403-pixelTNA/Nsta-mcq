import json

app_content = open('App.tsx').read()
print("handleClaimReward exists:", "handleClaimReward" in app_content)
print("Credits update exists:", "updatedUser.credits = (updatedUser.credits || 0) + (activeReward.amount || 0);" in app_content)
