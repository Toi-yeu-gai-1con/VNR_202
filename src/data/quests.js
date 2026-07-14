export function createQuestState() {
  return {
    tvaBriefingAccepted: false,
    tvaPortalTarget: null,
    tvaTrackedChapterId: null,
    tvaReportedRelics: new Set(),
    zone1Started: false,
    zone1Delivered: new Set(),
    zone1RewardClaimed: false,
    zone1SoldierDecision: null,
    zone2Fragments: new Set(),
    zone2TowerActivated: false,
    zone2RewardClaimed: false,
    zone3Recruits: new Set(),
    zone3ThreadClaimed: false,
    zone3HamletsFreed: new Set(),
    zone3BossDefeated: false,
    zone3MapClaimed: false,
    zone4Barriers: new Set(),
    zone4Farmers: new Set(),
    zone4GearClaimed: false,
  };
}
