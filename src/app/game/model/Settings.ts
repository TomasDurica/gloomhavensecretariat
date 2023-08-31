
export class Settings {
  abilities: boolean = true;
  abilityNumbers: boolean = true;
  abilityReveal: boolean = true;
  activeApplyConditions: boolean = true;
  activeStandees: boolean = true;
  activeSummons: boolean = true;
  addAllMonsters: boolean = false;
  allyAttackModifierDeck: boolean = true;
  alwaysAllyAttackModifierDeck: boolean = false;
  alwaysFhSolo: boolean = false;
  alwaysHazardousTerrain: boolean = false;
  alwaysLootApplyDialog = false;
  alwaysLootDeck: boolean = false;
  applyConditions: boolean = true;
  applyLongRest: boolean = true;
  applyLoot: boolean = true;
  autoBackup: number = -1;
  autoBackupFinish: boolean = false;
  autoBackupUrl: { url: string, method: string, fileUpload: boolean, username: string | undefined, password: string | undefined, authorization: string | undefined } | undefined;
  automaticAttackModifierFullscreen: boolean = true;
  automaticStandees: boolean = true;
  automaticStandeesDialog: boolean = false;
  automaticUnlocking: boolean = true;
  autoscroll: boolean = true;
  barsize: number = 1;
  backupHint: boolean = true;
  battleGoals: boolean = false;
  battleGoalsCharacter: boolean = false;
  battleGoalsFh: boolean = false;
  browserNavigation: boolean = false;
  calculate: boolean = true;
  calculateStats: boolean = true;
  calculateShieldStats: boolean = true;
  characterAttackModifierDeck: boolean = true;
  characterAttackModifierDeckPermanent: boolean = false;
  characterHandSize: boolean = false;
  characterIdentities: boolean = true;
  characterIdentityHint: boolean = true;
  characterItems: boolean = false;
  characterSheet: boolean = true;
  combineSummonAction: boolean = true;
  debugRightClick: boolean = false;
  disableAnimations: boolean = false;
  disableArtwork: boolean = false;
  disableColumns: boolean = false;
  disableDragFigures: boolean = false;
  disablePinchZoom: boolean = false;
  disabledTurnConfirmation: boolean = false;
  disableSortFigures: boolean = false;
  disableStandees: boolean = false;
  disableWakeLock: boolean = false;
  dragValues: boolean = true;
  editionDataUrls: string[] = [];
  editions: string[] = [];
  eliteFirst: boolean = true;
  excludeEditionDataUrls: string[] = [];
  expireConditions: boolean = true;
  fhGhItems: boolean = false;
  fhStyle: boolean = false;
  fontsize: number = 1;
  fullscreen: boolean = false;
  hideAbsent: boolean = false;
  hideStats: boolean = true;
  hints: boolean = true;
  initiativeRequired: boolean = true;
  interactiveAbilities: boolean = true;
  locale: string = "en";
  lootDeck: boolean = true;
  maxUndo: number = 100;
  portraitMode: boolean = true;
  monsters: boolean = true;
  moveElements: boolean = true;
  partySheet: boolean = true;
  pressDoubleClick: boolean = true;
  randomStandees: boolean = false;
  scenarioNumberInput: boolean = false;
  scenarioRooms: boolean = true;
  scenarioRules: boolean = true;
  serverAutoconnect: boolean = true;
  serverPassword: string | undefined;
  serverPort: number | undefined;
  serverSettings: boolean = false;
  serverUrl: string | undefined;
  serverWss: boolean = false;
  showBossMonster: boolean = true;
  showFullAbilityCard: boolean = false;
  showHiddenMonster: boolean = false;
  spoilers: string[] = [];
  standeeStats: boolean = false;
  statAnimations: boolean = false;
  theme: string = "";
  tooltips: boolean = true;
  treasuresLoot: boolean = true;
  treasures: boolean = true;
  zoom: number = 100;
}