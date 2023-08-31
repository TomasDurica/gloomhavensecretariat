import { DIALOG_DATA, Dialog, DialogRef } from "@angular/cdk/dialog";
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { gameManager, GameManager } from "src/app/game/businesslogic/GameManager";
import { SettingsManager, settingsManager } from "src/app/game/businesslogic/SettingsManager";
import { AttackModifierDeck } from "src/app/game/model/data/AttackModifier";
import { Character, GameCharacterModel } from "src/app/game/model/Character";
import { FH_PROSPERITY_STEPS, GH_PROSPERITY_STEPS } from "src/app/game/model/data/EditionData";
import { ItemData } from "src/app/game/model/data/ItemData";
import { ScenarioData } from "src/app/game/model/data/ScenarioData";
import { CountIdentifier, Identifier } from "src/app/game/model/data/Identifier";
import { LootType } from "src/app/game/model/data/Loot";
import { Party } from "src/app/game/model/Party";
import { GameScenarioModel, Scenario } from "src/app/game/model/Scenario";
import { AttackModiferDeckChange } from "../../figures/attackmodifier/attackmodifierdeck";
import { ghsInputFullScreenCheck } from "../../helper/Static";
import { CharacterMoveResourcesDialog } from "../../figures/character/sheet/move-resources";
import { ScenarioConclusionComponent } from "../../footer/scenario/scenario-conclusion/scenario-conclusion";
import { PartyWeekDialogComponent } from "./week-dialog/week-dialog";
import { Subscription } from "rxjs";
import { ScenarioSummaryComponent } from "../../footer/scenario/summary/scenario-summary";
import { BattleGoalSetupDialog } from "../../figures/battlegoal/setup/battlegoal-setup";
import { ScenarioRequirementsComponent } from "./requirements/requirements";
import { WorldMapComponent } from "./world-map/world-map";
import { ItemDialogComponent } from "../../figures/items/dialog/item-dialog";
import { TreasuresDialogComponent } from "./treasures/treasures-dialog";
import { AutocompleteItem } from "../../helper/autocomplete";

@Component({
  selector: 'ghs-party-sheet-dialog',
  templateUrl: 'party-sheet-dialog.html',
  styleUrls: ['./party-sheet-dialog.scss']
})
export class PartySheetDialogComponent implements OnInit, OnDestroy {

  gameManager: GameManager = gameManager;
  settingsManager: SettingsManager = settingsManager;
  ghsInputFullScreenCheck = ghsInputFullScreenCheck;
  party: Party;
  prosperitySteps = GH_PROSPERITY_STEPS;
  prosperityHighlightSteps = GH_PROSPERITY_STEPS;
  priceModifier: number = 0;
  campaign: boolean = false;

  partyEdition: string = "";
  scenarioEditions: string[] = [];
  scenarios: Record<string, ScenarioData[]> = {};
  conclusions: Record<string, ScenarioData[]> = {};
  characters: Character[] = [];
  worldMap: boolean = false;
  items: (ItemData | undefined)[] = [];
  itemIdentifier: CountIdentifier[] = [];
  itemEdition: string = "";
  treasureEdition: string = "";
  partyAchievements: AutocompleteItem[] = [];
  globalAchievements: AutocompleteItem[] = [];
  campaignStickers: AutocompleteItem[] = [];

  fhSheet: boolean = false;
  csSheet: boolean = false;

  LootType = LootType;

  townGuardDeck: AttackModifierDeck | undefined;

  calendarSheet: number = 0;

  @ViewChild('itemIndex') itemIndex!: ElementRef;
  @ViewChild('treasureIndex') treasureIndex!: ElementRef;

  constructor(@Inject(DIALOG_DATA) public data: { campaign: boolean, partySheet: boolean }, private dialogRef: DialogRef, private dialog: Dialog) {
    this.campaign = data && data.campaign;
    this.party = gameManager.game.party;

    if (gameManager.game.edition && !this.party.edition) {
      this.party.edition = gameManager.game.edition;
    }

    if (this.party.edition) {
      this.partyEdition = this.party.edition;
    }

    if (!this.campaign && (!data || !data.partySheet) && this.partyEdition == 'jotl') {
      this.campaign = true;
    }

    if (gameManager.game.conditions && !this.party.conditions) {
      this.party.conditions = gameManager.game.conditions;
    }

    if (gameManager.game.battleGoalEditions && !this.party.battleGoalEditions) {
      this.party.battleGoalEditions = gameManager.game.battleGoalEditions;
    }

    if (gameManager.game.filteredBattleGoals && !this.party.filteredBattleGoals) {
      this.party.filteredBattleGoals = gameManager.game.filteredBattleGoals;
    }

    if (gameManager.game.unlockedCharacters && !this.party.unlockedCharacters) {
      this.party.unlockedCharacters = gameManager.game.unlockedCharacters;
    }

    if (gameManager.game.lootDeckEnhancements && !this.party.lootDeckEnhancements) {
      this.party.lootDeckEnhancements = gameManager.game.lootDeckEnhancements;
    }

    if (gameManager.game.lootDeckFixed && !this.party.lootDeckFixed) {
      this.party.lootDeckFixed = gameManager.game.lootDeckFixed;
    }

    if (gameManager.game.lootDeckSections && !this.party.lootDeckSections) {
      this.party.lootDeckSections = gameManager.game.lootDeckSections;
    }

    this.itemEdition = this.partyEdition;
    this.treasureEdition = this.partyEdition;
  }

  ngOnInit(): void {
    this.uiChangeSubscription = gameManager.uiChange.subscribe({
      next: () => {
        if (this.party != gameManager.game.party) {
          this.party = gameManager.game.party;
          this.update();
        }

        if (this.townGuardDeck && this.party.townGuardDeck) {
          this.townGuardDeck.fromModel(this.party.townGuardDeck);
        }
      }
    })
    this.update();
  }

  uiChangeSubscription: Subscription | undefined;

  ngOnDestroy(): void {
    if (this.uiChangeSubscription) {
      this.uiChangeSubscription.unsubscribe();
    }
  }

  close() {
    this.dialogRef.close();
  }

  toggleCampaignMode() {
    gameManager.stateManager.before(this.party.campaignMode ? "disablePartyCampaignMode" : "enablePartyCampaignMode");
    this.party.campaignMode = !this.party.campaignMode;
    gameManager.stateManager.after();
    this.update();
  }

  openMap() {
    this.dialog.open(WorldMapComponent, {
      backdropClass: 'fullscreen-backdrop',
      panelClass: 'fullscreen-panel',
      data: gameManager.game.edition
    })
    this.close();
  }

  changePlayer(event: any, index: number) {
    gameManager.stateManager.before("setPlayer", event.target.value, '' + (index + 1));
    this.party.players[index] = event.target.value;
    gameManager.stateManager.after();
  }

  removePlayer(index: number) {
    gameManager.stateManager.before("removePlayer", this.party.players[index], '' + (index + 1));
    this.party.players.splice(index, 1);
    gameManager.stateManager.after();
  }

  unlockScenario(indexElement: HTMLInputElement, groupElement: HTMLInputElement, edition: string) {
    let index: string = indexElement.value;
    let group: string | undefined = groupElement.value || undefined;
    const scenarioData = gameManager.scenarioManager.scenarioData(edition, true).find((scenarioData) => scenarioData.index == index && scenarioData.group == group);
    indexElement.classList.add('error');
    groupElement.classList.add('error');
    if (scenarioData && this.scenarios[edition].indexOf(scenarioData) == -1 && !this.party.manualScenarios.some((gameScenarioModel) => gameScenarioModel.index == scenarioData.index && gameScenarioModel.edition == scenarioData.edition && gameScenarioModel.group == scenarioData.group && !gameScenarioModel.isCustom)) {
      gameManager.stateManager.before("addManualScenario", ...gameManager.scenarioManager.scenarioUndoArgs(new Scenario(scenarioData)));
      gameManager.game.party.manualScenarios.push(new GameScenarioModel(scenarioData.index, scenarioData.edition, scenarioData.group, false, "", []));
      gameManager.stateManager.after();
      indexElement.classList.remove('error');
      indexElement.value = "";
      groupElement.classList.remove('error');
      groupElement.value = "";
      this.update();
    }
  }


  setName(event: any) {
    if (this.party.name != event.target.value) {
      gameManager.stateManager.before("setPartyName", event.target.value);
      this.party.name = event.target.value;
      gameManager.stateManager.after();
    }
  }

  setLocation(event: any) {
    if (this.party.location != event.target.value) {
      gameManager.stateManager.before("setPartyLocation", event.target.value);;
      this.party.location = event.target.value;
      gameManager.stateManager.after();
    }
  }

  setNotes(event: any) {
    if (this.party.notes != event.target.value) {
      gameManager.stateManager.before("setPartyNotes", event.target.value);
      this.party.notes = event.target.value;
      gameManager.stateManager.after();
    }
  }

  addAchievement(input: HTMLInputElement) {
    if (input.value) {
      let achievement = input.value;
      Object.keys(settingsManager.label.data.partyAchievements).forEach((key) => {
        if (settingsManager.label.data.partyAchievements[key].toLowerCase() == achievement.toLowerCase()) {
          achievement = key;
        }
      })
      gameManager.stateManager.before("addPartyAchievement", achievement);
      this.party.achievementsList.push(achievement);
      gameManager.stateManager.after();
      input.value = "";
      this.update();
    }
  }

  removeAchievement(index: number) {
    gameManager.stateManager.before("removePartyAchievement", this.party.achievementsList[index]);
    this.party.achievementsList.splice(index, 1);
    gameManager.stateManager.after();
    this.update();
  }



  addGlobalAchievement(input: HTMLInputElement) {
    if (input.value) {
      let achievement = input.value;
      Object.keys(settingsManager.label.data.globalAchievements).forEach((key) => {
        if (settingsManager.label.data.globalAchievements[key].toLowerCase() == achievement.toLowerCase()) {
          achievement = key;
        }
      })
      gameManager.stateManager.before("addGlobalAchievement", achievement);
      this.party.globalAchievementsList.push(achievement);
      gameManager.stateManager.after();
      input.value = "";
      this.update();
    }
  }

  removeGlobalAchievement(index: number) {
    gameManager.stateManager.before("removeGlobalAchievement", this.party.globalAchievementsList[index]);
    this.party.globalAchievementsList.splice(index, 1);
    gameManager.stateManager.after();
    this.update();
  }


  setReputation(value: number) {
    if (this.party.reputation != value) {
      gameManager.stateManager.before("setPartyReputation", "" + value);
      if (value > 20) {
        value = 20
      } else if (value < -20) {
        value = -20;
      }
      this.party.reputation = value;
      gameManager.stateManager.after();
      this.update();
    }
  }

  characterPerks(characterModel: GameCharacterModel): number {
    if (characterModel.progress && characterModel.progress.perks && characterModel.progress.perks.length > 0) {
      return characterModel.progress.perks.reduce((a, b) => a + b);
    }

    return 0;
  }

  setPlayerNumber(characterModel: GameCharacterModel, event: any) {
    if (!isNaN(+event.target.value) && characterModel.number != +event.target.value && (+event.target.value > 0)) {
      gameManager.stateManager.before("setPlayerNumber", "data.character." + characterModel.name, event.target.value);
      characterModel.number = +event.target.value;
      gameManager.stateManager.after();
    }
  }

  reactivateCharacter(characterModel: GameCharacterModel) {
    gameManager.stateManager.before("setRetired", "data.character." + characterModel.name, "" + false);
    let character = new Character(gameManager.getCharacterData(characterModel.name, characterModel.edition), characterModel.level);
    character.fromModel(characterModel);
    character.progress.retired = false;
    gameManager.game.figures.push(character);
    this.party.retirements.splice(this.party.retirements.indexOf(characterModel), 1);
    gameManager.stateManager.after();
  }

  removeParty() {
    if (gameManager.game.parties.length > 1) {
      gameManager.stateManager.before("removeParty", this.party.name || '%party% ' + this.party.id);
      gameManager.game.parties.splice(gameManager.game.parties.indexOf(this.party), 1);
      this.changeParty(gameManager.game.parties[0]);
      gameManager.stateManager.after();
    }
  }

  newParty() {
    let party = new Party();
    gameManager.stateManager.before("addParty", party.name || '%party% ' + party.id);
    this.addParty(party);
    gameManager.stateManager.after();
  }

  addParty(party: Party) {
    let id = 0;
    while (gameManager.game.parties.some((party) => party.id == id)) {
      id++;
    }
    party.id = id;
    gameManager.game.parties.push(party);
    this.changeParty(party);
  }

  selectParty(event: any) {
    const party = gameManager.game.parties.find((party) => party.id == event.target.value);
    if (party) {
      gameManager.stateManager.before("changeParty", party.name || '%party% ' + party.id);
      this.changeParty(party);
      gameManager.stateManager.after();
    }
  }

  changeParty(party: Party) {
    gameManager.changeParty(party);
    this.update();
  }

  setDonations(value: number) {
    if (this.party.donations == value) {
      value--;
    }
    if (value < 0) {
      value = 0;
    }

    gameManager.stateManager.before("setPartyDonations", "" + value);
    this.party.donations = value;
    gameManager.stateManager.after();
  }

  setProsperity(value: number) {
    if (this.party.prosperity == value) {
      value--;
    }
    if (value > (gameManager.fhRules() ? 132 : 64)) {
      value = (gameManager.fhRules() ? 132 : 64)
    } else if (value < 0) {
      value = 0;
    }

    gameManager.stateManager.before("setPartyProsperity", "" + value);
    this.party.prosperity = value;
    gameManager.stateManager.after();
  }

  exportParty() {
    const downloadButton = document.createElement('a');
    downloadButton.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.party)));
    downloadButton.setAttribute('download', (this.party.name ? this.party.name + "_" : "") + "campaign.json");
    document.body.appendChild(downloadButton);
    downloadButton.click();
    document.body.removeChild(downloadButton);
  }

  importParty(event: any) {
    const parent = event.target.parentElement;
    parent.classList.remove("error");
    try {
      const reader = new FileReader();
      reader.addEventListener('load', (event: any) => {
        const party = Object.assign(new Party(), JSON.parse(event.target.result));
        if (!party) {
          parent.classList.add("error");
        } else {
          gameManager.stateManager.before("importParty");
          if (party.id == this.party.id && party.name && party.name == this.party.name) {
            gameManager.game.party = party;
          } else {
            this.addParty(party);
          }
          this.party = gameManager.game.party;
          gameManager.stateManager.after();
        }
      });

      reader.readAsText(event.target.files[0]);
    } catch (e: any) {
      console.warn(e);
      parent.classList.add("error");
    }
  }

  countFinished(scenarioData: ScenarioData, casual: boolean = false): number {
    return (casual ? this.party.casualScenarios : this.party.scenarios).filter((value) => scenarioData.index == value.index && scenarioData.edition == value.edition && scenarioData.group == value.group).length;
  }

  isManual(scenarioData: ScenarioData): boolean {
    return this.party.manualScenarios.find((value) => scenarioData.index == value.index && scenarioData.edition == value.edition && scenarioData.group == value.group) != undefined;
  }

  addSuccess(scenarioData: ScenarioData, force: boolean = false) {
    if (!gameManager.scenarioManager.isBlocked(scenarioData) && !gameManager.scenarioManager.isLocked(scenarioData) || force) {
      const conclusions = gameManager.sectionData(scenarioData.edition).filter((sectionData) =>
        sectionData.edition == scenarioData.edition && sectionData.parent == scenarioData.index && sectionData.group == scenarioData.group && sectionData.conclusion);
      if (conclusions.length == 0) {
        this.addSuccessIntern(scenarioData);
      } else {
        this.dialog.open(ScenarioConclusionComponent, {
          panelClass: ['dialog'],
          data: { conclusions: conclusions, parent: scenarioData }
        }).closed.subscribe({
          next: (conclusion) => {
            if (conclusion) {
              this.addSuccessIntern(scenarioData, conclusion as ScenarioData);
            }
          }
        });
      }
    }
  }

  addSuccessIntern(scenarioData: ScenarioData, conclusionSection: ScenarioData | undefined = undefined) {
    gameManager.stateManager.before("finishScenario.success", ...gameManager.scenarioManager.scenarioUndoArgs(new Scenario(scenarioData)));
    gameManager.scenarioManager.finishScenario(new Scenario(scenarioData), true, conclusionSection, false, undefined, false, gameManager.game.party.campaignMode && this.countFinished(scenarioData) == 0, true);
    gameManager.stateManager.after();

    this.update();
  }

  removeSuccess(scenarioData: ScenarioData, casual: boolean = false) {
    const scenarios = (casual ? this.party.casualScenarios : this.party.scenarios);
    const value = scenarios.find((value) => value.index == scenarioData.index && value.edition == scenarioData.edition && value.group == scenarioData.group);
    if (value) {
      gameManager.stateManager.before("finishScenario.remove" + (casual ? 'Casual' : ''), ...gameManager.scenarioManager.scenarioUndoArgs(new Scenario(scenarioData)));
      scenarios.splice(scenarios.indexOf(value), 1);
      gameManager.stateManager.after();
    }
    this.update();
  }

  removeManual(scenarioData: ScenarioData) {
    const value = this.party.manualScenarios.find((value) => value.index == scenarioData.index && value.edition == scenarioData.edition && value.group == scenarioData.group);
    if (value) {
      gameManager.stateManager.before("removeManualScenario", ...gameManager.scenarioManager.scenarioUndoArgs(new Scenario(scenarioData)));
      this.party.manualScenarios.splice(this.party.manualScenarios.indexOf(value), 1);
      gameManager.stateManager.after();
    }
    this.update();
  }

  scenarioRewards(scenarioData: ScenarioData) {
    const conclusion = this.party.conclusions.filter((value) => value.edition == scenarioData.edition).map((value) => gameManager.sectionData(scenarioData.edition).find((sectionData) => sectionData.index == value.index && sectionData.edition == value.edition && sectionData.group == value.group) as ScenarioData).find((conclusionData) => conclusionData.parent == scenarioData.index && conclusionData.group == scenarioData.group);

    this.dialog.open(ScenarioSummaryComponent, {
      panelClass: 'dialog',
      data: {
        scenario: new Scenario(scenarioData),
        conclusion: conclusion,
        success: true,
        rewardsOnly: true
      }
    })
  }

  scenarioRequirements(scenarioData: ScenarioData) {
    if (gameManager.scenarioManager.isLocked(scenarioData)) {
      this.dialog.open(ScenarioRequirementsComponent, {
        panelClass: 'dialog',
        data: { scenarioData: scenarioData, hideMenu: true }
      })
    }
  }


  maxScenario(scenarios: ScenarioData[]) {
    return Math.max(...scenarios.map((scenarioData) => scenarioData.index.length));
  }

  changeEdition(event: any) {
    this.partyEdition = event.target.value != 'undefined' && event.target.value || "";
    this.itemEdition = this.partyEdition;
    this.treasureEdition = this.partyEdition;
    this.update();
  }

  update(updateSheet: boolean = true): void {
    if (updateSheet) {
      this.fhSheet = gameManager.fhRules();
      this.csSheet = !this.fhSheet && gameManager.editionRules('cs');
    }
    const editions = this.partyEdition && [this.partyEdition] || gameManager.editions();
    this.scenarioEditions = [];
    editions.forEach((edition) => {
      let scenarioData = gameManager.scenarioManager.scenarioData(edition).filter((scenarioData) => (!scenarioData.spoiler || settingsManager.settings.spoilers.indexOf(scenarioData.name) != -1 || scenarioData.solo && gameManager.game.unlockedCharacters.indexOf(scenarioData.solo) != -1));
      if (scenarioData.length > 0) {
        this.scenarios[edition] = scenarioData.sort((a, b) => {
          if (a.group && !b.group) {
            return 1;
          } else if (!a.group && b.group) {
            return -1;
          } else if (a.group && b.group && a.group != b.group) {
            return a.group < b.group ? -1 : 1;
          }

          if (!isNaN(+a.index) && !isNaN(+b.index)) {
            return +a.index - +b.index;
          }

          return a.index.toLowerCase() < b.index.toLowerCase() ? -1 : 1
        });
        this.scenarioEditions.push(edition);
      }

      this.conclusions[edition] = this.party.conclusions.filter((value) => value.edition == edition).map((value) => gameManager.sectionData(edition).find((sectionData) => sectionData.index == value.index && sectionData.edition == value.edition && sectionData.group == value.group) as ScenarioData).filter((conclusionData) => !this.party.scenarios.find((scenarioModel) => scenarioModel.edition == conclusionData.edition && scenarioModel.group == conclusionData.group && scenarioModel.index == conclusionData.parent));
    });

    if (this.party.reputation >= 0) {
      this.priceModifier = Math.ceil((this.party.reputation - 2) / 4) * -1;
    } else {
      this.priceModifier = Math.floor((this.party.reputation + 2) / 4) * -1;
    }

    const campaign = gameManager.campaignData();
    this.townGuardDeck = gameManager.attackModifierManager.buildTownGuardAttackModifierDeck(this.party, campaign);
    if (this.party.townGuardDeck) {
      this.townGuardDeck.fromModel(this.party.townGuardDeck);
    } else {
      gameManager.attackModifierManager.shuffleModifiers(this.townGuardDeck);
      this.townGuardDeck.active = false;
      this.party.townGuardDeck = this.townGuardDeck.toModel();
    }

    this.calendarSheet = Math.floor(this.party.weeks / 81);
    this.characters = gameManager.game.figures.filter((figure) => figure instanceof Character && Object.keys(figure.progress.loot).some((type) => figure.progress.loot[type as LootType])).map((figure) => figure as Character);

    if (this.fhSheet) {
      this.prosperitySteps = FH_PROSPERITY_STEPS;
    } else {
      this.prosperitySteps = GH_PROSPERITY_STEPS;
    }

    if (settingsManager.settings.fhStyle) {
      this.prosperityHighlightSteps = [];
      this.prosperitySteps.forEach((step, index) => {
        const start = index > 0 ? this.prosperitySteps[index - 1] + 1 : 0;
        for (let i = start; i < step; i++) {
          if ((i - start) % 5 == 4) {
            this.prosperityHighlightSteps.push(i);
          }
        }
      })
    } else {
      this.prosperityHighlightSteps = this.prosperitySteps;
    }

    this.partyAchievements = [];
    this.globalAchievements = [];
    this.campaignStickers = [];
    const editionData = gameManager.editionData.find((editionData) => this.partyEdition && editionData.edition == this.partyEdition);
    if (editionData) {
      if (editionData.worldMap) {
        this.worldMap = true;
      }
      if (editionData.label && editionData.label[settingsManager.settings.locale] && editionData.label[settingsManager.settings.locale].partyAchievements) {
        this.partyAchievements.push(...Object.keys(editionData.label[settingsManager.settings.locale].partyAchievements).map((achievement) => new AutocompleteItem(editionData.label[settingsManager.settings.locale].partyAchievements[achievement], achievement, this.party.achievementsList.indexOf(achievement) != -1)));
      } else if (editionData.label && editionData.label['en'] && editionData.label['en'].partyAchievements) {
        this.partyAchievements.push(...Object.keys(editionData.label['en'].partyAchievements).map((achievement) => new AutocompleteItem(editionData.label['en'].partyAchievements[achievement], achievement, this.party.achievementsList.indexOf(achievement) != -1)));
      }

      if (editionData.label && editionData.label[settingsManager.settings.locale] && editionData.label[settingsManager.settings.locale].globalAchievements) {
        this.globalAchievements.push(...Object.keys(editionData.label[settingsManager.settings.locale].globalAchievements).map((achievement) => new AutocompleteItem(editionData.label[settingsManager.settings.locale].globalAchievements[achievement], achievement, this.party.globalAchievementsList.indexOf(achievement) != -1)));
      } else if (editionData.label && editionData.label['en'] && editionData.label['en'].globalAchievements) {
        this.globalAchievements.push(...Object.keys(editionData.label['en'].globalAchievements).map((achievement) => new AutocompleteItem(editionData.label['en'].globalAchievements[achievement], achievement, this.party.globalAchievementsList.indexOf(achievement) != -1)));
      }

      if (editionData.campaign && editionData.campaign.campaignStickers) {
        this.campaignStickers.push(...editionData.campaign.campaignStickers.map((sticker) => {
          sticker = sticker.split(':')[0];
          return new AutocompleteItem(settingsManager.getLabel('data.campaignSticker.' + sticker), sticker, this.party.campaignStickers.indexOf(sticker) != -1);
        }));
      }
    }

    this.itemIdentifier = this.party.unlockedItems.filter((identifier) => !this.itemEdition || identifier.edition == this.itemEdition).sort((a, b) => {
      if (!this.partyEdition && a.edition != b.edition) {
        return gameManager.editions().indexOf(a.edition) - gameManager.editions().indexOf(b.edition);
      }

      return +a.name - +b.name;
    });

    this.items = this.itemIdentifier.map((identifier) => gameManager.itemManager.getItem(+identifier.name, identifier.edition, true));
  }

  characterIcon(name: string): string {
    return gameManager.characterManager.characterIcon(name);
  }


  addItem(indexElement: HTMLInputElement, edition: string) {
    const itemId: string = indexElement.value;
    if (itemId && edition) {
      if (this.hasItem(itemId, edition)) {
        indexElement.classList.add('warning');
      } else {
        indexElement.classList.add('error');
        const itemData = gameManager.itemManager.getItems(edition, true).find((itemData) => itemId == '' + itemData.id);
        if (itemData) {
          gameManager.stateManager.before("addUnlockedItem", edition, itemId, itemData.name);
          this.party.unlockedItems = this.party.unlockedItems || [];
          this.party.unlockedItems.push(new CountIdentifier(itemId, edition));
          this.itemIndex.nativeElement.value = "";
          indexElement.classList.remove('error');
          gameManager.stateManager.after();
          this.update();
        }
      }
    }
  }

  hasItem(item: string, edition: string): boolean {
    return this.party.unlockedItems && this.party.unlockedItems.some((identifier) => identifier.name == item && identifier.edition == edition);
  }

  removeItem(item: ItemData) {
    const identifier = this.party.unlockedItems.find((identifier) => identifier.name == '' + item.id && identifier.edition == item.edition);
    if (identifier) {
      gameManager.stateManager.before("removeUnlockedItem", item.edition, '' + item.id, item.name);
      this.party.unlockedItems.splice(this.party.unlockedItems.indexOf(identifier), 1);
      gameManager.stateManager.after();
      this.update();
    }
  }

  openItem(item: ItemData) {
    this.dialog.open(ItemDialogComponent, {
      data: item
    })
  }

  incItemCount(item: ItemData, itemIdentifier: CountIdentifier) {
    gameManager.stateManager.before("updateUnlockedItemCount", item.edition, '' + item.id, item.name);
    if (itemIdentifier.count < 0) {
      itemIdentifier.count = 1;
    } else {
      itemIdentifier.count += 1;
      if (itemIdentifier.count >= item.count) {
        itemIdentifier.count = -1;
      }
    }
    gameManager.stateManager.after();
  }

  treasuresDialog() {
    this.dialog.open(TreasuresDialogComponent, {
      panelClass: 'dialog',
      data: this.party
    })
  }

  treasures(): Identifier[] {
    return this.party.treasures.filter((identifier) => !this.treasureEdition || identifier.edition == this.treasureEdition).sort((a, b) => {
      if (!this.treasureEdition && a.edition != b.edition) {
        return gameManager.editions().indexOf(a.edition) - gameManager.editions().indexOf(b.edition);
      }

      return +a.name - +b.name;
    });
  }

  addTreasure(indexElement: HTMLInputElement, edition: string) {
    const treasure: string = indexElement.value;
    if (treasure && !isNaN(+treasure) && edition) {
      if (this.hasTreasure(treasure, edition)) {
        indexElement.classList.add('warning');
      } else {
        indexElement.classList.add('error');
        const editionData = gameManager.editionData.find((editionData) => editionData.edition == edition);
        if (editionData && editionData.treasures) {
          const treasureIndex = +treasure - (editionData.treasureOffset || 0);
          if (treasureIndex >= 0 && treasureIndex < editionData.treasures.length) {
            gameManager.stateManager.before("addTreasure", edition, treasure);
            this.party.treasures = this.party.treasures || [];
            this.party.treasures.push(new Identifier(treasure, edition));
            this.treasureIndex.nativeElement.value = "";
            indexElement.classList.remove('error');
            gameManager.stateManager.after();
          }
        }
      }
    }
  }

  hasTreasure(treasure: string, edition: string): boolean {
    return this.party.treasures && this.party.treasures.some((identifier) => identifier.name == treasure && identifier.edition == edition);
  }

  removeTreasure(treasure: Identifier) {
    gameManager.stateManager.before("removeTreasure", treasure.edition, treasure.name);
    this.party.treasures.splice(this.party.treasures.indexOf(treasure), 1);
    gameManager.stateManager.after();
  }

  sectionsForWeekFixed(week: number): string[] {
    const campaign = gameManager.campaignData();
    if (campaign.weeks && campaign.weeks[week + 1]) {
      return campaign.weeks[week + 1] || [];
    }
    return [];
  }

  sectionsForWeek(week: number): string[] {
    if (this.party.weekSections && this.party.weekSections[week + 1]) {
      return this.party.weekSections[week + 1] || [];
    }
    return [];
  }

  isConclusion(section: string): boolean {
    return this.party.conclusions.find((model) => model.edition == gameManager.game.edition && model.index == section) != undefined;
  }

  hasConclusions(section: string): boolean {
    const conclusions = gameManager.sectionData(gameManager.game.edition).filter((sectionData) => sectionData.conclusion && !sectionData.parent && sectionData.parentSections && sectionData.parentSections.length == 1 && sectionData.parentSections.find((parentSections) => parentSections.length == 1 && parentSections.indexOf(section) != -1));
    return conclusions.length > 0 && conclusions.every((conclusion) => !gameManager.game.party.conclusions.find((model) => model.edition == conclusion.edition && model.index == conclusion.index && model.group == conclusion.group));
  }

  openConclusions(section: string, week: number) {
    let conclusions: ScenarioData[] = gameManager.sectionData(gameManager.game.edition).filter((sectionData) => sectionData.conclusion && !sectionData.parent && sectionData.parentSections && sectionData.parentSections.length == 1 && sectionData.parentSections.find((parentSections) => parentSections.length == 1 && parentSections.indexOf(section) != -1)).map((conclusion) => {
      conclusion.name = "";
      return conclusion;
    });

    if (conclusions.length > 0) {
      this.dialog.open(ScenarioConclusionComponent, {
        panelClass: ['dialog'],
        data: { conclusions: conclusions, parent: gameManager.sectionData(gameManager.game.edition).find((sectionData) => sectionData.index == section && !sectionData.group) }
      }).closed.subscribe({
        next: (conclusion) => {
          if (conclusion) {
            const scenario = new Scenario(conclusion as ScenarioData);
            gameManager.stateManager.before("finishConclusion", ...gameManager.scenarioManager.scenarioUndoArgs(scenario));
            gameManager.scenarioManager.finishScenario(scenario, true, scenario, false, undefined, false, gameManager.game.party.campaignMode, true);
            this.party.weekSections[week] = this.party.weekSections[week] || [];
            this.party.weekSections[week]?.push(scenario.index);
            gameManager.stateManager.after();

            this.dialog.open(ScenarioSummaryComponent, {
              panelClass: 'dialog',
              data: {
                scenario: scenario,
                conclusionOnly: true
              }
            })
          }
        }
      });
    }
  }

  finishConclusion(indexElement: HTMLInputElement) {
    let index: string = indexElement.value;
    indexElement.classList.add('error');
    const conclusion = gameManager.sectionData(this.partyEdition || gameManager.currentEdition()).find((sectionData) => sectionData.index == index);
    if (conclusion) {
      const scenario = new Scenario(conclusion as ScenarioData);
      indexElement.classList.remove('error');
      indexElement.value = "";
      this.dialog.open(ScenarioSummaryComponent, {
        panelClass: 'dialog',
        data: {
          scenario: scenario,
          conclusionOnly: true
        }
      }).closed.subscribe({ next: () => this.update() })
    }
  }

  removeConclusion(section: string, edition: string) {
    gameManager.stateManager.before("removeConclusion", gameManager.game.party.name, section + '');
    gameManager.game.party.conclusions = gameManager.game.party.conclusions.filter((conclusion) => conclusion.edition != edition || conclusion.index != section);
    // TODO: remove week
    gameManager.stateManager.after();
    this.update();
  }

  setWeek(value: number) {
    if (this.party.weeks == value) {
      value--;
    }
    if (value < 0) {
      value = 0;
    }

    let conclusions: string[] = [];
    for (let week = this.party.weeks; week < value; week++) {
      this.sectionsForWeekFixed(week).forEach((section) => {
        if (this.hasConclusions(section)) {
          conclusions.push(section);
        }
      })
      this.sectionsForWeek(week).forEach((section) => {
        if (this.hasConclusions(section)) {
          conclusions.push(section);
        }
      })

      conclusions.forEach((conclusion) => {
        this.openConclusions(conclusion, value);
      })
    }

    gameManager.stateManager.before("setPartyWeeks", "" + value);
    for (let week = this.party.weeks; week < value; week++) {
      const sectionsForWeeks = [...this.sectionsForWeekFixed(week), ...this.sectionsForWeek(week)]
      sectionsForWeeks.forEach((section) => {
        const sectionData = gameManager.sectionData(gameManager.game.edition).find((sectionData) => sectionData.index == section && sectionData.conclusion);
        if (sectionData && !gameManager.game.party.conclusions.find((model) => model.edition == sectionData.edition && model.index == sectionData.index && model.group == sectionData.group)) {
          gameManager.scenarioManager.finishScenario(new Scenario(sectionData), true, undefined, false, undefined, false, gameManager.game.party.campaignMode, true);
        }
      })
    }
    this.party.weeks = value;
    gameManager.stateManager.after();
    this.update();
  }

  setWeekSection(week: number) {
    this.dialog.open(PartyWeekDialogComponent, {
      panelClass: ['dialog-invert'],
      data: week
    });
  }

  setResource(type: LootType, event: any) {
    if (!isNaN(+event.target.value)) {
      gameManager.stateManager.before("setPartyResource", this.party.name, "game.loot." + type, event.target.value);
      this.party.loot[type] = +event.target.value;
      gameManager.stateManager.after();
    }
  }

  moveResources(character: Character) {
    this.dialog.open(CharacterMoveResourcesDialog, {
      panelClass: 'dialog',
      data: character
    }).closed.subscribe({ next: () => this.update() });
  }

  setInspiration(event: any) {
    if (!isNaN(+event.target.value) && this.party.inspiration != +event.target.value) {
      gameManager.stateManager.before("setPartyInspiration", this.party.name, event.target.value);
      this.party.inspiration = +event.target.value;
      gameManager.stateManager.after();
    }
  }

  setTotalDefense(event: any) {
    if (!isNaN(+event.target.value) && this.party.defense != +event.target.value) {
      gameManager.stateManager.before("setPartyTotalDefense", this.party.name, event.target.value);
      this.party.defense = +event.target.value;
      gameManager.stateManager.after();
    }
  }

  setSoldiers(value: number) {
    if (this.party.soldiers == value) {
      value--;
    }
    if (value < 0) {
      value = 0;
    }

    gameManager.stateManager.before("setPartySoldiers", "" + value);
    this.party.soldiers = value;
    gameManager.stateManager.after();
  }

  setMorale(value: number) {
    if (this.party.morale == value) {
      value--;
    }
    if (value < 0) {
      value = 0;
    }

    gameManager.stateManager.before("setPartyMorale", "" + value);
    this.party.morale = value;
    gameManager.stateManager.after();
  }

  setTownGuardPerks(value: number) {
    if (this.party.townGuardPerks == value) {
      value--;
    }
    if (value < 0) {
      value = 0;
    }

    gameManager.stateManager.before("setPartyTownGuardPerks", "" + value);
    this.party.townGuardPerks = value;
    gameManager.stateManager.after();
  }

  toggleTownGuardPerkSection(section: string, force: boolean = false) {
    this.party.townGuardPerkSections = this.party.townGuardPerkSections || [];
    const index = this.party.townGuardPerkSections.indexOf(section);
    if (index != -1 || this.party.townGuardPerkSections.length < Math.floor(this.party.townGuardPerks / 3) || force) {
      gameManager.stateManager.before(index == -1 ? "addPartyTownGuardPerkSection" : "removePartyTownGuardPerkSection", section);
      if (index == -1) {
        this.party.townGuardPerkSections.push(section);
      } else {
        this.party.townGuardPerkSections.splice(index, 1);
      }
      const active = this.townGuardDeck && this.townGuardDeck.active || false;
      this.townGuardDeck = gameManager.attackModifierManager.buildTownGuardAttackModifierDeck(this.party, gameManager.campaignData());
      this.townGuardDeck.active = active;
      gameManager.attackModifierManager.shuffleModifiers(this.townGuardDeck);
      this.party.townGuardDeck = this.townGuardDeck.toModel();

      gameManager.stateManager.after();
    }
  }

  addCampaignSticker(campaignStickerElement: HTMLInputElement) {
    const sticker = campaignStickerElement.value;
    if (sticker) {
      this.party.campaignStickers = this.party.campaignStickers || [];

      let total = 1;
      const campaign = gameManager.campaignData();
      if (campaign.campaignStickers) {
        const campaignSticker = campaign.campaignStickers.find((campaignSticker) => campaignSticker.startsWith(sticker.toLowerCase().replaceAll(' ', '-') + ':'));
        if (campaignSticker) {
          total = +(campaignSticker.split(':')[1]);
        }
      }

      const count = this.party.campaignStickers.filter((campaignSticker) => campaignSticker.toLowerCase().replaceAll(' ', '-') == sticker.toLowerCase().replaceAll(' ', '-')).length;

      if (count < total) {
        gameManager.stateManager.before("addCampaignSticker", sticker);
        this.party.campaignStickers.push(sticker);
        campaignStickerElement.value = "";
        gameManager.stateManager.after();
        this.update();
      }
    }
  }

  removeCampaignSticker(campaignSticker: string) {
    const index = this.party.campaignStickers.indexOf(campaignSticker);
    if (index != -1) {
      gameManager.stateManager.before("removeCampaignSticker", campaignSticker);
      this.party.campaignStickers.splice(index, 1);
      gameManager.stateManager.after();
      this.update();
    }
  }

  campaignStickerImage(stringValue: string, stickerIndex: number): string | undefined {
    const campaign = gameManager.campaignData();
    const sticker = stringValue.toLowerCase().replaceAll(' ', '-');

    let total = 0;
    if (campaign.campaignStickers) {
      const campaignSticker = campaign.campaignStickers.find((campaignSticker) => campaignSticker == sticker || campaignSticker.startsWith(sticker));
      if (campaignSticker) {
        if (campaignSticker.indexOf(':') != -1) {
          total = +(campaignSticker.split(':')[1]);
        }
        else {
          total = 1;
        }
      }
    }

    if (total == 1) {
      return './assets/images/fh/party/campaign-stickers/' + sticker + '.png';
    } else if (total > 1) {
      const mappedSticker = this.party.campaignStickers.map((sticker, index) => { return { sticker: sticker.toLowerCase().replaceAll(' ', '-'), origIndex: index } });
      const mapped = mappedSticker.filter((value) => value.sticker == sticker).map((value, index) => { return { sticker: value.sticker, origIndex: value.origIndex, index: index + 1 } }).find((value) => value.origIndex == stickerIndex);
      if (mapped) {
        return './assets/images/fh/party/campaign-stickers/' + sticker + '-' + mapped.index + '.png';
      }
    }
    return undefined;
  }

  beforeTownGuardDeck(change: AttackModiferDeckChange) {
    gameManager.stateManager.before("updateAttackModifierDeck." + change.type, 'party.campaign.townGuard', ...change.values);
  }

  afterTownGuardDeck(change: AttackModiferDeckChange) {
    this.townGuardDeck = change.deck;
    this.party.townGuardDeck = this.townGuardDeck.toModel();
    gameManager.stateManager.after();
  }

  toggleTownGuardDeck() {
    if (this.townGuardDeck) {
      this.beforeTownGuardDeck(new AttackModiferDeckChange(this.townGuardDeck, this.townGuardDeck.active && !gameManager.game.lootDeck.active ? 'amDeckHide' : 'amDeckShow'));
      this.townGuardDeck.active = !this.townGuardDeck.active;
      this.afterTownGuardDeck(new AttackModiferDeckChange(this.townGuardDeck, !this.townGuardDeck.active ? 'amDeckHide' : 'amDeckShow'));
    }
  }

  battleGoalSetup() {
    this.dialog.open(BattleGoalSetupDialog, {
      panelClass: ['dialog']
    });
  }

}
