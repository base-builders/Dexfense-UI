import { useAuthStore, useNotificationStore } from "@/shared";
import {
  addButton,
  addFastBtn,
  addText,
  createPlatforms,
  getAllBossChoices,
  getAllChoices,
  initMainGameState,
  setupHUD,
  showHistory,
  showInformation,
  showNotification,
} from "../scene-helper";
import { getDafGameData, startGame } from "../services";
import { GameObjects, Physics } from "phaser";
import { effectColor, hpBarColor, sprites } from "../constants";
import {
  ArrowData,
  Difficulty,
  LightningStatusEffect,
  PoisonStatusEffect,
  StackableEffect,
  Token2,
  UnitType,
} from "../types";
import { use } from "matter";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export class MainGame extends Phaser.Scene {
  token1Name: string = "";
  token2Name: string = "";
  difficulty: Difficulty = "easy";

  // UI
  viewportWidth!: number;
  viewportHeight!: number;
  fastBtn!: Phaser.GameObjects.Image;
  hpBar!: GameObjects.Graphics;
  hpBarBackground!: GameObjects.Graphics;
  background!: GameObjects.Image;
  hpText!: GameObjects.Text;
  waveText!: GameObjects.Text;
  killText!: GameObjects.Text;
  timerText!: GameObjects.Text;
  unitCountText!: GameObjects.Text;
  swapMessage!: GameObjects.Text;
  totalEarnText!: GameObjects.Text;
  baseAmountText!: GameObjects.Text;
  notificationTimer?: Phaser.Time.TimerEvent;
  damageLogs: Phaser.GameObjects.Text[] = [];
  selected: string[] = [];
  information: string[] = [];
  onHistory: boolean = false;
  onInformation: boolean = false;
  daf: number = 1;
  spawnGroundY: number = 532;

  // offsets
  bossYOffset: number = -40;
  playerYOffset: number = -20;
  healerYOffset: number = -94;
  statusIconYOffset: number = -40;
  bossStatusIconYOffset: number = -80;

  // 게임 상태 관리
  gameId?: number;
  currentCardChoiceId?: number;

  iceZones: Phaser.GameObjects.Sprite[] = [];

  // Entity
  castle!: Phaser.Physics.Arcade.Sprite;
  token1!: GameObjects.Image;
  token2Group!: Physics.Arcade.Group;
  token2SpawnTimer?: Phaser.Time.TimerEvent;
  waveTimer?: Phaser.Time.TimerEvent;
  autoShootTimer?: Phaser.Time.TimerEvent;

  entryFee = 0;
  totalEarn = 0;

  timeScaleMultiplier = 1;

  // 상태값
  exchangeRatio = 0;
  hpMultiplier = 1;
  castleHP = 100;
  castleMaxHP = 100;
  waveCount = 1;
  killCount = 0;
  unitCount = 0;
  deathCount = 35;
  TotalToken2Count = 500;
  waveTotalDamage = 0;
  maxSpawn = 20;

  // 전투 능력치
  physFlat = 10;
  physPercent = 0;
  fireFlat = 0;
  firePercent = 0;
  poisonFlat = 0;
  poisonPercent = 0;
  iceFlat = 0;
  icePercent = 0;
  lightningFlat = 0;
  lightningPercent = 0;
  multiplier = 1;
  attackSpeed = 1;
  critChance = 0;
  executionCap = 0;

  lightningAmp = 1.2;
  iceSlowFactor = 1.0;
  poisonDuration = 2500;
  fireAmp = 0.8;
  physMultiplier = 0.1;
  poisonChance = 0.7;

  //awaken
  awakened: { [element: string]: boolean } = {
    phys: false,
    fire: false,
    lightning: false,
    poison: false,
    ice: false,
  };

  physStack = 0;
  fireCorpseExplosion = 0;
  lightningChain = 0;
  lightningShockDuration = 0;
  poisonRadius = 0;
  poisonHealBlock = false;
  iceFreezChance = 0;
  iceFreezeDuration = 0;

  globalSpeed = 25;
  globalResistTypes: { [key: string]: number } = {};
  globalSpeedBuff: number = 1.0;
  bossSpeedBuff: number = 1;
  bossResistBuff: number = 0.2;
  bossAlive: boolean = false;
  bossResistAppliedTypes: string[] = [];

  iceZoneWidth = 50;
  iceZoneLength = 6; // 6개 이어붙임
  iceZoneDuration = 3000; // 지속시간 (ms)

  constructor() {
    super("MainGame");
  }

  async create(data: {
    difficulty: Difficulty;
    exchangeRate: number;
    token1: string;
    token2: string;
  }) {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.address,
      (newAddress: string | null) => {
        if (newAddress === null) {
          this.scene.stop(); // 현재 씬 정리
          this.scene.start("MainMenu");
        }
      }
    );

    // 씬이 파괴될 때 구독 해제
    this.events.once("shutdown", unsubscribe);
    this.events.once("destroy", unsubscribe);
    const dafData = await getDafGameData(data.difficulty.toLowerCase());
    this.daf = dafData.factorValue || 1;
    const res = await startGame(data.difficulty);
    if (res) {
      console.log("Started game with ID:", res.data.gameId);
      this.gameId = res.data.gameId;
    }

    this.token1Name = data.token1;
    this.token2Name = data.token2;

    createPlatforms.call(this);

    const { width, height } = this.scale;
    this.exchangeRatio = data.exchangeRate;

    this.viewportWidth = width;
    this.viewportHeight = height;
    this.difficulty = data.difficulty || "easy";
    this.physics.add.staticImage(700, 455, "flag").setDepth(1);

    initMainGameState.call(this);

    sprites.forEach((sprite) => {
      this.anims.create({
        key: sprite.key,
        frames: this.anims.generateFrameNumbers(sprite.key, sprite.frame),
        frameRate: 6,
        repeat: -1, // The 'repeat -1' value tells the animation to loop
      });
    });

    this.hpBarBackground = this.add.graphics();
    this.hpBarBackground.fillStyle(0xffd6d6, 1);
    this.hpBarBackground.fillRect(70, 40, 520, 16);
    this.hpBarBackground.setDepth(99);

    this.hpBar = this.add.graphics();
    this.hpBar.fillStyle(0xff0000, 1);
    this.hpBar.fillRect(70, 40, 520 * (this.castleHP / this.castleMaxHP), 16);
    this.hpBar.setDepth(100);
    this.add
      .text(30, 40, "HP", {
        fontSize: "18px",
        fontFamily: '"Press Start 2P"',
        color: "#FFFFFF",
      })
      .setDepth(100);

    const historyButton = addButton.call(this, {
      x: width - 20,
      y: height - 12,
      title: "📜 History",
      //   cb: this.showHistory.bind(this),
    });

    historyButton.on("pointerdown", () => {
      showHistory.call(this);
    });

    const showInformationButton = addButton.call(this, {
      x: 240,
      y: height - 12,
      title: "📖 Information",
    });

    showInformationButton.on("pointerdown", () => {
      showInformation.call(this);
    });

    this.castle = this.physics.add
      .staticSprite(140, 406, "fortress")
      .setDepth(50);

    // (this.castle.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    // const castleBody = this.castle.body as Phaser.Physics.Arcade.Body;
    // castleBody.setSize(150, this.castle.height);
    // castleBody.setOffset(this.castle.width / 2 - 75, 0);

    this.token1 = this.add
      .image(this.castle.x + 3, this.castle.y - 20, "token1")
      .setDepth(101);

    this.token2Group = this.physics.add.group();

    this.physics.add.collider(
      this.token2Group,
      this.castle,
      (object1, object2) => {
        this.onCastleHit(
          object1 as Phaser.GameObjects.GameObject,
          object2 as Phaser.GameObjects.GameObject
        );
      },
      undefined,
      this
    );

    this.swapMessage = this.add
      .text(this.viewportWidth / 2, 10, "", {
        fontSize: "16px",
        color: "#00ff00",
        fontFamily: '"Press Start 2P"',
        backgroundColor: "#22222288",
        padding: { left: 10, right: 10, top: 4, bottom: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setVisible(false);

    addFastBtn.call(this);
    setupHUD.call(this);
    // register events
    // start countdown
    this.startAutoShootTimer();
    this.startCountdown();

    // this.fastBtn =
    //   this.timeScaleMultiplier === 2
    //     ? this.add
    //         .image(850, 30, "play")
    //         .setInteractive()
    //         .setDepth(100)
    //         .setScale(0.5, 0.5)
    //     : this.add
    //         .image(850, 30, "fast")
    //         .setInteractive()
    //         .setDepth(100)
    //         .setScale(0.5, 0.5);

    // this.fastBtn.disableInteractive(); // 🛑 처음엔 비활성화

    // // 5초 후 활성화
    // this.time.delayedCall(4500, () => {
    //   this.fastBtn.setInteractive();
    // });

    // this.fastBtn.on("pointerdown", () => {
    //   this.toggleSceneTimeScale();
    // });
  }
  update() {
    const store = useNotificationStore.getState();
    const queueLength = store.queue.length;

    const noNotificationActive =
      !this.notificationTimer || this.notificationTimer.getProgress() === 1;

    if (noNotificationActive && queueLength) {
      const next = store.shift();
      if (next)
        showNotification.call(this, next, queueLength >= 3 ? 1000 : 4000);
    }
    // Guard if token2Group isn't ready yet
    const children = (this.token2Group?.getChildren?.() ||
      []) as (Phaser.Physics.Arcade.Sprite & Token2)[];
    if (children.length > 0) {
      children.forEach((mon) => {
        const token = mon as Phaser.Physics.Arcade.Sprite & Token2;

        this.updateTokenHPBar(token);

        const keys = Object.keys(token.statusEffects || {});
        const spacing = 24;
        const startX = token.x - ((keys.length - 1) * spacing) / 2;

        // 상태이상 아이콘 위치 조정, 중첩 수 아이콘 조정
        keys.forEach((key, i) => {
          const effect = token.statusEffects[key];
          const iconX = startX + i * spacing;
          const iconY = token.unitType === "boss" ? token.y - 90 : token.y - 50;

          effect.icon.setPosition(iconX, iconY);

          if (effect.type === "stackable") {
            const stackable = effect as StackableEffect;
            if (stackable.stackText) {
              stackable.stackText.setPosition(iconX + 5, iconY + 5);
              stackable.stackText.setText(`${stackable.stacks}`);
            }
          }

          if (effect.type === "poison") {
            const poison = effect as PoisonStatusEffect;
            if (poison.stackText) {
              poison.stackText.setPosition(iconX + 5, iconY + 5);
              poison.stackText.setText(`${poison.subs.length}`);
            }
          }
        });

        // 얼음 존 감지
        const isOnIce = this.iceZones.some((zone) =>
          Phaser.Geom.Intersects.RectangleToRectangle(
            token.getBounds(),
            zone.getBounds()
          )
        );

        const originalSpeed = token.getData("originalSpeed");
        let speedFactor = 1.0;

        if (this.bossAlive) {
          speedFactor *= this.globalSpeedBuff;
        }

        if (isOnIce) {
          speedFactor *= this.iceSlowFactor;
          if (!token.getData("iceSlowed")) {
            token.setData("iceSlowed", true);
          }
        } else {
          if (token.getData("iceSlowed")) {
            token.setData("iceSlowed", false);
          }
        }

        const expectedSpeed =
          -originalSpeed * speedFactor * this.timeScaleMultiplier ** 2;
        const currentSpeed = token.body!.velocity.x;

        if (token.getData("isFrozen")) return;
        const speedRatioDiff = Math.abs(currentSpeed / expectedSpeed - 1);
        if (speedRatioDiff > 0.01) {
          // 1% 이상 차이 나면 갱신
          token.setVelocityX(expectedSpeed);
        }
      });
    }

    this.physics.world.bodies.entries.forEach((body) => {
      const arrow = body.gameObject as Phaser.Physics.Arcade.Sprite & ArrowData;
      if (arrow?.texture?.key === "arrow" && arrow.active) {
        const baseVel = arrow.getData("baseVelocity");
        if (baseVel) {
          arrow.setVelocity(
            baseVel.x * this.timeScaleMultiplier ** 2,
            baseVel.y * this.timeScaleMultiplier ** 2
          );
        }
      }
    });
  }

  // Methods

  pauseGame() {
    this.time.paused = true;
    this.physics.world.pause();
  }

  resumeGameAndStartWave() {
    this.time.paused = false;
    this.physics.world.resume();

    const waveText = addText.call(this, {
      x: this.viewportWidth / 2,
      y: this.viewportHeight / 2,
      text: `WAVE ${this.waveCount}`,
      style: {
        fontSize: "60px",
        stroke: "#000000",
        strokeThickness: 6,
      },
      depth: 200,
    });

    this.startWave();

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: waveText,
        alpha: 0,
        duration: 1000,
        onComplete: () => waveText.destroy(),
      });
    });
  }

  onCastleHit(
    castleObj: Phaser.GameObjects.GameObject,
    tokenObj: Phaser.GameObjects.GameObject
  ) {
    const token = tokenObj as Phaser.Physics.Arcade.Sprite & Token2;
    const castle = castleObj as Phaser.Physics.Arcade.Sprite;

    if (!token || !token.body || !castle || !castle.body) {
      console.warn(
        "[onCastleHit] Invalid collision objects:",
        tokenObj,
        castleObj
      );
      return;
    }

    this.castleHP -= token.damage;
    this.kill(token);
    this.updateHP(this.castleHP, this.castleMaxHP);
    this.flashHitEffect(castle, effectColor.phys);
    if (this.castleHP <= 0) this.changeScene();
  }
  changeScene() {
    this.sound.stopAll();
    this.scene.start("GameResult", {
      waveCount: this.waveCount,
      killCount: this.killCount,
      difficulty: this.difficulty,
    });
  }

  addDamageLog(text: string) {
    const x = 30;
    const y = 170;
    const spacing = 18;

    // 아래에 추가
    this.damageLogs.push(
      addText.call(this, {
        x,
        y,
        text,
        style: { fontSize: "10px" },
        origin: { x: 0, y: 0 },
        depth: 100,
      })
    );

    // 최대 8개 유지
    if (this.damageLogs.length > 6) {
      const removed = this.damageLogs.shift();
      removed?.destroy();
    }

    // 위치 재정렬 (위로)
    this.damageLogs.forEach((log, i) => {
      log.setY(y - (this.damageLogs.length - 1 - i) * spacing);
    });
  }

  calcDamage(projectile: Phaser.Physics.Arcade.Image & ArrowData): {
    total: number;
    phys: number;
    poison: number;
    fire: number;
    ice: number;
    lightning: number;
  } {
    // const multiplier = projectile.multiplier || 1;
    const critApplied = Math.random() <= this.critChance;
    const crit = this.critChance === 0 ? 1 : critApplied ? 2 : 1;

    const phys = this.calcPhysicalDamage(projectile) * crit;
    const poison = this.calcPoisonDamage(projectile);
    const fire = this.calcFireDamage(projectile) * crit;
    const ice = this.calcIceDamage(projectile) * crit;
    const lightning = this.calcLightningDamage(projectile) * crit;

    const total = phys + poison + fire + ice + lightning;

    return {
      total,
      phys,
      poison,
      fire,
      ice,
      lightning,
    };
  }

  private calcPhysicalDamage(projectile: ArrowData): number {
    const flat = projectile.damage?.phys?.flat || 0;
    const percent = projectile.damage?.phys?.percent || 0;
    const resist = this.globalResistTypes["phys"] || 1;
    return (flat * (1 + percent) * this.multiplier) / resist;
  }

  private calcPoisonDamage(projectile: ArrowData): number {
    const flat = projectile.damage?.poison?.flat || 0;
    const percent = projectile.damage?.poison?.percent || 0;
    const resist = this.globalResistTypes["poison"] || 1;
    return (flat * (1 + percent) * this.multiplier) / resist;
  }

  private calcFireDamage(projectile: ArrowData): number;
  private calcFireDamage(baseDamage: number): number;
  private calcFireDamage(arg: ArrowData | number): number {
    const resist = this.globalResistTypes["fire"] || 1;

    if (typeof arg === "number") {
      return (
        ((arg + this.fireFlat) * (1 + this.firePercent) * this.multiplier) /
        resist
      );
    } else {
      const flat = arg.damage?.fire?.flat || 0;
      const percent = arg.damage?.fire?.percent || 0;
      return (flat * (1 + percent) * this.multiplier) / resist;
    }
  }

  private calcIceDamage(projectile: ArrowData): number {
    const flat = projectile.damage?.ice?.flat || 0;
    const percent = projectile.damage?.ice?.percent || 0;
    const resist = this.globalResistTypes["ice"] || 1;
    return (flat * (1 + percent) * this.multiplier) / resist;
  }

  private clearStatusEffects(sprite: Phaser.Physics.Arcade.Sprite & Token2) {
    const effects = sprite.statusEffects;
    if (!effects) return;

    Object.entries(effects).forEach(([, effect]) => {
      if (effect.type === "stackable") {
        const stackable = effect as StackableEffect;
        stackable.timers.forEach((t) => t?.remove?.());
        stackable.stackText?.destroy();
      } else if (effect.type === "poison") {
        const poison = effect as PoisonStatusEffect;
        poison.subs.forEach((sub) => sub.timer?.remove?.());
        poison.stackText?.destroy();
      } else if (effect.type === "lightning") {
        const lightning = effect as LightningStatusEffect;
        lightning.timer?.remove?.();
      }

      effect.icon.destroy();
    });

    sprite.statusEffects = {};
  }

  private calcLightningDamage(projectile: ArrowData): number {
    const flat = projectile.damage?.lightning?.flat || 0;
    const percent = projectile.damage?.lightning?.percent || 0;
    const resist = this.globalResistTypes["lightning"] || 1;
    return (flat * (1 + percent) * this.multiplier) / resist;
  }

  kill(monster: Phaser.Physics.Arcade.Sprite & Token2) {
    if (!monster.active) return;

    this.totalEarn += ((this.entryFee * 1) / 400) * this.exchangeRatio;
    this.totalEarnText.setText(
      `Total 💰 ${this.totalEarn.toFixed(2)} ${this.token2Name} `
    );
    this.showGoldGain(
      monster.x,
      monster.y,
      ((this.entryFee * 1) / 400) * this.exchangeRatio
    );

    const hpBar = monster.getData("hpBar") as
      | Phaser.GameObjects.Graphics
      | undefined;
    if (hpBar) hpBar.destroy();
    this.clearStatusEffects(monster);

    if (monster.unitType === "boss") {
      this.onBossDeath();
    } else {
      this.killCount++;
    }

    this.sound.play("coin");

    monster.destroy();
    this.unitCount--;
    this.unitCountText.setText(
      `Unit Count ${this.unitCount}/${this.deathCount}`
    );
    this.killText.setText(`kill ${this.killCount}/${this.TotalToken2Count}`);
  }

  showGoldGain(x: number, y: number, amount: number) {
    const goldText = this.add
      .text(x, y, `💰 +${amount.toFixed(3)}`, {
        fontSize: "20px",
        color: "#FFD700",
        fontFamily: '"Press Start 2P"',
        stroke: "#000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.tweens.add({
      targets: goldText,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => goldText.destroy(),
    });
  }

  awakenedFireCorpseExplosion(
    target: Phaser.Physics.Arcade.Sprite & Token2,
    radius: number = 100
  ) {
    const nearbyEnemies =
      this.token2Group.getChildren() as (Phaser.Physics.Arcade.Sprite &
        Token2)[];

    const explosionDamage = target.getData("maxHP") * this.fireCorpseExplosion;
    const finalDamage = this.calcFireDamage(explosionDamage);

    const targets = nearbyEnemies.filter(
      (e) =>
        e !== target &&
        Phaser.Math.Distance.Between(target.x, target.y, e.x, e.y) <= radius
    );

    targets.forEach((enemy) => {
      if (enemy.hp <= 0 || !enemy.active) return;
      const lightningAmp = enemy.statusEffects["lightning"]
        ? this.lightningAmp
        : 1;
      const dealt = finalDamage * lightningAmp;
      const before = enemy.hp;

      enemy.hp -= dealt;
      this.waveTotalDamage += dealt;

      this.flashHitEffect(enemy, effectColor.fire);

      const after = enemy.hp <= 0 ? "Dead" : enemy.hp.toFixed(2);

      this.addDamageLog(
        `💣 ${enemy.unitType} took ${dealt.toFixed(2)} (HP ${before.toFixed(
          2
        )} → ${after})${enemy.statusEffects["lightning"] ? "⚡" : ""}`
      );

      if (enemy.hp <= 0) {
        this.kill(enemy);
      }
    });
  }

  applyFireExplosionDamage(
    origin: Phaser.Physics.Arcade.Sprite & Token2,
    fireDamage: number,
    radius: number = 100
  ) {
    const nearbyEnemies =
      this.token2Group.getChildren() as (Phaser.Physics.Arcade.Sprite &
        Token2)[];

    const targets = nearbyEnemies.filter(
      (e) =>
        // e !== origin &&
        Phaser.Math.Distance.Between(origin.x, origin.y, e.x, e.y) <= radius
    );

    targets.forEach((enemy) => {
      if (enemy.hp <= 0 || !enemy.active) return;
      const lightningAmp = enemy.statusEffects["lightning"]
        ? this.lightningAmp
        : 1;

      const aoeDamage = fireDamage * this.fireAmp;
      const beforeHP = enemy.hp;
      enemy.hp -= aoeDamage * lightningAmp;
      this.waveTotalDamage += aoeDamage * lightningAmp;
      this.flashHitEffect(enemy, effectColor.fire);
      const afterHP = enemy.hp <= 0 ? "Dead" : enemy.hp.toFixed(2);
      const executionCap = enemy.getData("maxHP") * this.executionCap;
      const isExecuted = enemy.hp > 0 && enemy.hp <= executionCap;

      this.addDamageLog(
        `🔥 ${enemy.unitType} took ${aoeDamage.toFixed(
          2
        )} (HP ${beforeHP.toFixed(2)} → ${afterHP})${
          enemy.statusEffects["lightning"] ? "⚡" : ""
        }${isExecuted ? "🪓" : ""}`
      );

      if (enemy.hp <= executionCap) {
        if (this.awakened.fire) {
          this.awakenedFireCorpseExplosion(enemy);
        }
        this.kill(enemy);
      }
    });
  }

  async showBossReward() {
    this.pauseGame();

    try {
      // 서버에서 보스 카드 선택지 요청
      const response = await fetch(
        `${SERVER_URL}/api/games/boss-card-choices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: useAuthStore.getState().token || "",
          },
          body: JSON.stringify({
            gameId: this.gameId,
            waveNumber: this.waveCount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get boss card choices: ${response.status}`);
      }

      const { offeredCards, cardChoiceId } = await response.json();
      this.currentCardChoiceId = cardChoiceId;

      const overlay = this.add
        .rectangle(this.viewportWidth / 2, 341, 1024, 682, 0x000000, 0.6)
        .setDepth(300);
      const cardY = 280;
      const cardSpacing = 250;
      const startX = this.viewportWidth / 2 - cardSpacing;

      const allBossChoice = getAllBossChoices(this);

      // 서버에서 받은 인덱스가 실제 배열 범위 내에 있는지 확인
      const validIndices = offeredCards.filter(
        (index: number) => index < allBossChoice.length
      );
      if (validIndices.length !== offeredCards.length) {
        console.warn(
          "Some boss card indices are out of range, using valid ones only"
        );
      }

      const choices = validIndices.map((index: number) => allBossChoice[index]);

      let hasSelected = false;
      const cards: Phaser.GameObjects.Rectangle[] = [];
      const labels: Phaser.GameObjects.Text[] = [];

      choices.forEach((choice: any, index: number) => {
        const cardX = startX + index * cardSpacing;

        const cardBg = this.add
          .rectangle(cardX, cardY, 180, 260, 0xefff5e, 1)
          .setStrokeStyle(4, 0x000000)
          .setDepth(301);

        const label = addText.call(this, {
          x: cardX,
          y: cardY - 50,
          text: choice.label,
          style: {
            fontSize: "16px",
            color: "#000000",
            align: "center",
            fontFamily: '"Quantico"',
            wordWrap: { width: 160 },
          },
          origin: { x: 0.5, y: 0.5 },
          depth: 302,
        });

        const desc = addText.call(this, {
          x: cardX,
          y: cardY + 15,
          text: choice.description,
          style: {
            fontSize: "14px",
            color: "#555555",
            fontFamily: '"Quantico"',
            wordWrap: { width: 160 },
            align: "center",
          },
          origin: { x: 0.5, y: 0.5 },
          depth: 302,
        });
        const factor = addText.call(this, {
          x: cardX,
          y: cardY + 65,
          text: choice.factor || "",
          style: {
            fontSize: "12px",
            color: "#00aa00",
            fontFamily: '"Quantico"',
            align: "center",
            wordWrap: { width: 160 },
          },
          origin: { x: 0.5, y: 0.5 },
          depth: 302,
        });

        cards.push(cardBg);
        labels.push(label, desc, factor);

        cardBg.setInteractive().on("pointerdown", async () => {
          if (hasSelected) return;
          hasSelected = true;

          try {
            // 서버에 보스 카드 선택 완료 알림
            await fetch(`${SERVER_URL}/api/games/select-card`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: useAuthStore.getState().token || "",
              },
              body: JSON.stringify({
                cardChoiceId: this.currentCardChoiceId,
                selectedCardIndex: validIndices[index],
              }),
            });

            this.sound.play("pick", { volume: 0.8 });
            choice.apply();
            this.selected.push(choice.label); // 선택한 거 저장
            overlay.destroy();
            cards.forEach((c) => c.destroy());
            labels.forEach((l) => l.destroy());
            this.time.paused = false;
            this.physics.world.resume();
          } catch (error) {
            console.error("Failed to update boss card choice:", error);
            // 에러가 발생해도 게임은 계속 진행
            this.sound.play("pick", { volume: 0.8 });
            choice.apply();
            this.selected.push(choice.label);
            overlay.destroy();
            cards.forEach((c) => c.destroy());
            labels.forEach((l) => l.destroy());
            this.time.paused = false;
            this.physics.world.resume();
          }
        });
      });
    } catch (error) {
      console.error(
        "Failed to get boss card choices, falling back to local logic:",
        error
      );
      // 서버 오류 시 기존 로직으로 폴백
      this.showBossRewardFallback();
    }
  }

  showBossRewardFallback() {
    const overlay = this.add
      .rectangle(this.viewportWidth / 2, 341, 1024, 682, 0x000000, 0.6)
      .setDepth(300);
    const cardY = 280;
    const cardSpacing = 250;
    const startX = this.viewportWidth / 2 - cardSpacing;

    const allBossChoice = getAllBossChoices(this);
    const shuffled = Phaser.Utils.Array.Shuffle(allBossChoice);
    const choices = shuffled.slice(0, 3);

    let hasSelected = false;
    const cards: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    choices.forEach((choice, index) => {
      const cardX = startX + index * cardSpacing;

      const cardBg = this.add
        .rectangle(cardX, cardY, 180, 260, 0xefff5e, 1)
        .setStrokeStyle(4, 0x000000)
        .setDepth(301);

      const label = addText.call(this, {
        x: cardX,
        y: cardY - 50,
        text: choice.label,
        style: {
          fontSize: "16px",
          color: "#000000",
          align: "center",
          fontFamily: '"Quantico"',
          wordWrap: { width: 160 },
        },
        origin: { x: 0.5, y: 0.5 },
        depth: 302,
      });

      const desc = addText.call(this, {
        x: cardX,
        y: cardY + 15,
        text: choice.description,
        style: {
          fontSize: "14px",
          color: "#555555",
          fontFamily: '"Quantico"',
          wordWrap: { width: 160 },
          align: "center",
        },
        origin: { x: 0.5, y: 0.5 },
        depth: 302,
      });
      const factor = addText.call(this, {
        x: cardX,
        y: cardY + 65,
        text: choice.factor || "",
        style: {
          fontSize: "12px",
          color: "#00aa00",
          fontFamily: '"Quantico"',
          align: "center",
          wordWrap: { width: 160 },
        },
        origin: { x: 0.5, y: 0.5 },
        depth: 302,
      });

      cards.push(cardBg);
      labels.push(label, desc, factor);

      cardBg.setInteractive().on("pointerdown", () => {
        if (hasSelected) return;
        hasSelected = true;

        this.sound.play("pick", { volume: 0.8 });
        choice.apply();
        this.selected.push(choice.label); // 선택한 거 저장
        overlay.destroy();
        cards.forEach((c) => c.destroy());
        labels.forEach((l) => l.destroy());
        this.time.paused = false;
        this.physics.world.resume();
      });
    });
  }
  onBossDeath() {
    // 보스가 부여했던 저항 속성만큼만 감소
    this.bossResistAppliedTypes.forEach((type) => {
      if (this.globalResistTypes[type] !== undefined) {
        this.globalResistTypes[type] -= this.bossResistBuff;
        // TODO 나중에 저항깍 생기면
        if (this.globalResistTypes[type] <= 1) {
          this.globalResistTypes[type] = 1;
        }
      }
    });

    this.globalSpeedBuff -= this.bossSpeedBuff;
    this.bossAlive = false;
    this.bossResistAppliedTypes = [];
    this.showBossReward();
  }
  private applyPoisonAoE(
    origin: Phaser.Physics.Arcade.Sprite & Token2,
    rawDamage: number,
    radius: number = 80,
    duration: number = 2000
  ) {
    const tickInterval = this.awakened.poison ? 250 : 500;
    const appliedDuration = duration / (this.awakened.poison ? 2 : 1);
    const tickCount = Math.round(appliedDuration / tickInterval);
    const damagePerTick = rawDamage * 0.45;

    if (this.awakened.poison) radius += this.poisonRadius;

    const allEnemies =
      this.token2Group.getChildren() as (Phaser.Physics.Arcade.Sprite &
        Token2)[];

    const targets = allEnemies.filter(
      (e) =>
        Phaser.Math.Distance.Between(origin.x, origin.y, e.x, e.y) <= radius
    );

    targets.forEach((target) => {
      if (!target.active) return;

      // 기존 중독 이펙트 없으면 생성
      if (!target.statusEffects["poison"]) {
        const icon = this.add
          .image(
            target.x,
            target.unitType === "boss" ? target.y - 80 : target.y - 40,
            "poison"
          )
          .setDepth(200)
          .setScale(0.5);

        target.statusEffects["poison"] = {
          icon,
          subs: [],
          type: "poison",
          stackText: undefined,
        } as PoisonStatusEffect;
      }

      const effect = target.statusEffects["poison"] as PoisonStatusEffect;

      let executedTicks = 0;
      const timer = this.time.addEvent({
        delay: tickInterval,
        repeat: tickCount - 1,
        callback: () => {
          if (!target.active) return;

          const before = target.hp;
          const lightningAmp = target.statusEffects["lightning"]
            ? this.lightningAmp
            : 1;

          target.hp -= damagePerTick * lightningAmp;
          this.waveTotalDamage += damagePerTick * lightningAmp;
          const afterHP = target.hp <= 0 ? "Dead" : target.hp.toFixed(2);

          this.flashHitEffect(target, 0x44ff44);

          this.addDamageLog(
            `☠️ ${target.unitType} took ${(
              damagePerTick * lightningAmp
            ).toFixed(2)} (HP ${before.toFixed(2)} → ${afterHP})${
              target.statusEffects["lightning"] ? "⚡" : ""
            }`
          );

          if (target.hp <= 0) {
            this.kill(target);
          }

          executedTicks++;
          if (executedTicks >= tickCount) {
            effect.subs = effect.subs.filter((sub) => sub.timer !== timer);
            if (effect.subs.length === 0) {
              effect.icon.destroy();
              effect.stackText?.destroy();
              delete target.statusEffects["poison"];
            }
            this.updateStatusIconPositions(target);
          }
        },
        callbackScope: this,
      });

      effect.subs.push({ timer, tickCount });
      this.updateStatusIconPositions(target);
    });
  }

  updateStatusIconPositions(sprite: Phaser.Physics.Arcade.Sprite & Token2) {
    const keys = Object.keys(sprite.statusEffects);
    const spacing = 24;
    const startX = sprite.x - ((keys.length - 1) * spacing) / 2;

    const iconYOffset =
      sprite.unitType === "boss"
        ? this.bossStatusIconYOffset
        : this.statusIconYOffset;

    keys.forEach((key, i) => {
      const effect = sprite.statusEffects[key];
      effect.icon.setPosition(startX + i * spacing, sprite.y + iconYOffset);

      if (effect.type === "stackable") {
        const stackable = effect as StackableEffect;
        if (!stackable.stackText) {
          stackable.stackText = addText.call(this, {
            x: effect.icon.x + 5,
            y: effect.icon.y + 5,
            text: `${stackable.stacks}`,
            style: {
              fontSize: "12px",
              color: "#ffffff",
              fontStyle: "bold",
              stroke: "#000000",
              strokeThickness: 2,
            },
            origin: { x: 0.5, y: 0.5 },
            depth: 201,
          });
        } else {
          stackable.stackText.setText(`${stackable.stacks}`);
          stackable.stackText.setPosition(effect.icon.x + 5, effect.icon.y + 5);
        }
      }

      if (effect.type === "poison") {
        const poisonEffect = effect as PoisonStatusEffect;
        const stackCount = poisonEffect.subs.length;
        if (!poisonEffect.stackText) {
          poisonEffect.stackText = addText.call(this, {
            x: effect.icon.x + 5,
            y: effect.icon.y + 5,
            text: `${stackCount}`,
            style: {
              fontSize: "12px",
              color: "#00ff00",
              fontStyle: "bold",
              stroke: "#000000",
              strokeThickness: 2,
            },
            origin: { x: 0.5, y: 0.5 },
            depth: 201,
          });
        } else {
          poisonEffect.stackText.setText(`${stackCount}`);
          poisonEffect.stackText.setPosition(
            effect.icon.x + 5,
            effect.icon.y + 5
          );
        }
      }
    });
  }

  private applyIceZone(origin: Phaser.Physics.Arcade.Sprite & Token2) {
    const setWidth = this.iceZoneWidth * this.iceZoneLength;
    const startX = origin.x - (setWidth * 1) / 2;
    const y =
      (origin as Token2).unitType === "healer"
        ? origin.y + this.healerYOffset + 30
        : origin.y + 20;
    const setBounds = new Phaser.Geom.Rectangle(startX, y - 10, setWidth, 50);

    // 세트 단위로 충돌 검사
    const isSetOverlapping = this.iceZones.some((zone) =>
      Phaser.Geom.Intersects.RectangleToRectangle(setBounds, zone.getBounds())
    );

    if (isSetOverlapping) return; // 겹치면 생성하지 않음

    // 세트 생성
    for (let i = 0; i < this.iceZoneLength; i++) {
      const x = startX + i * this.iceZoneWidth;

      const ice = this.add
        .sprite(x, y, "iceZone")
        .setDisplaySize(this.iceZoneWidth, 50)
        .setOrigin(0, 0.5)
        .setAlpha(1)
        .setDepth(103);

      this.iceZones.push(ice);

      this.time.delayedCall(this.iceZoneDuration, () => {
        const index = this.iceZones.indexOf(ice);
        if (index !== -1) this.iceZones.splice(index, 1);
        ice.destroy();
      });
    }
  }
  isStatusEffectActivate(ratio: number = 0.5) {
    return Math.random() <= ratio;
  }

  applyStatusEffectIcon(
    sprite: Phaser.Physics.Arcade.Sprite & Token2,
    type: "ice" | "lightning" | "poison" | "physbreak"
  ) {
    if (sprite.hp <= 0) return;
    if (!sprite.active) return;
    if (!sprite.statusEffects) sprite.statusEffects = {};

    const current = sprite.statusEffects[type];

    if (type === "ice") return;

    if (type === "poison") {
      if (!current) {
        const icon = this.add
          .image(
            sprite.x,
            sprite.unitType === "boss" ? sprite.y - 80 : sprite.y - 40,
            type
          )
          .setDepth(200)
          .setScale(0.5);

        sprite.statusEffects[type] = {
          icon,
          subs: [],
          type: "poison",
          stackText: undefined,
        } as PoisonStatusEffect;
      }
      this.updateStatusIconPositions(sprite);
      return;
    }

    if (type === "lightning") {
      const existing = current as LightningStatusEffect | undefined;
      if (existing) {
        existing.timer?.remove();
      } else {
        const icon = this.add
          .image(
            sprite.x,
            sprite.unitType === "boss" ? sprite.y - 80 : sprite.y - 40,
            type
          )
          .setDepth(200)
          .setScale(0.5);

        sprite.statusEffects["lightning"] = {
          icon,
          type: "lightning",
          timer: null,
        } as LightningStatusEffect;
      }

      const newTimer = this.time.delayedCall(1000, () => {
        const effect = sprite.statusEffects["lightning"] as
          | LightningStatusEffect
          | undefined;
        if (!effect) return;
        effect.icon.destroy();
        delete sprite.statusEffects["lightning"];
        this.updateStatusIconPositions(sprite);
      });

      (sprite.statusEffects["lightning"] as LightningStatusEffect).timer =
        newTimer;
      this.updateStatusIconPositions(sprite);
      return;
    }

    if (type === "physbreak") {
      if (current) {
        (current as StackableEffect).stacks +=
          1 + (this.awakened.phys ? this.physStack : 0);
      } else {
        const icon = this.add
          .image(
            sprite.x,
            sprite.unitType === "boss" ? sprite.y - 80 : sprite.y - 40,
            type
          )
          .setDepth(200)
          .setScale(0.5);

        sprite.statusEffects[type] = {
          icon,
          stacks: 1 + (this.awakened.phys ? this.physStack : 0),
          timers: [],
          type: "stackable",
          stackText: undefined,
        } as StackableEffect;
      }
      this.updateStatusIconPositions(sprite);
      return;
    }
  }
  applyIceStun(target: Phaser.Physics.Arcade.Sprite & Token2) {
    if (!target.active || target.getData("isFrozen")) return;

    target.setData("isFrozen", true);
    const originalSpeed = target.getData("originalSpeed") || this.globalSpeed;
    target.setVelocityX(0);

    this.time.delayedCall(this.iceFreezeDuration, () => {
      if (!target.active || !target.body) return;
      delete target.statusEffects["iceStun"];
      target.setVelocityX(-originalSpeed);
      target.setData("isFrozen", false);
    });
  }
  applyAwakenedIceAoE(
    origin: Phaser.Physics.Arcade.Sprite & Token2,
    baseDamage: number
  ) {
    const radius = 200;
    const allEnemies =
      this.token2Group.getChildren() as (Phaser.Physics.Arcade.Sprite &
        Token2)[];
    const targets = allEnemies.filter(
      (e) =>
        Phaser.Math.Distance.Between(origin.x, origin.y, e.x, e.y) <= radius
    );

    const flag = Math.random() <= this.iceFreezChance;

    targets.forEach((enemy) => {
      if (!enemy.active) return;

      // 피해 적용
      const damage = baseDamage * (Math.random() * 0.5 + 0.5); // 0.5 ~ 1.5
      const lightningAmp = enemy.statusEffects["lightning"]
        ? this.lightningAmp
        : 1;
      const dealt = damage * lightningAmp;

      const before = enemy.hp;
      enemy.hp -= dealt;
      this.waveTotalDamage += dealt;

      const after = enemy.hp <= 0 ? "Dead" : enemy.hp.toFixed(2);
      this.addDamageLog(
        `❄️ ${enemy.unitType} took ${dealt.toFixed(2)} (HP ${before.toFixed(
          2
        )} → ${after})${enemy.statusEffects["lightning"] ? "⚡" : ""}`
      );
      this.flashHitEffect(enemy, effectColor.ice);

      if (enemy.hp <= 0) this.kill(enemy);
      if (flag) this.applyIceStun(enemy);
    });
  }

  private applyPhysbreakBonus(
    target: Phaser.Physics.Arcade.Sprite & Token2
  ): number {
    const status = target.statusEffects?.["physbreak"] as StackableEffect;
    if (!status || !status.stacks) return 0;

    return this.physMultiplier * status.stacks;
  }
  private applyLightningAoE(
    origin: Phaser.Physics.Arcade.Sprite & Token2,
    targetCount: number = 5,
    // radius: number = 300,
    duration: number = 2000,
    rawDamage: number
  ) {
    const allEnemies =
      this.token2Group.getChildren() as (Phaser.Physics.Arcade.Sprite &
        Token2)[];

    if (this.awakened.lightning) {
      targetCount += this.lightningChain;
      duration += this.lightningShockDuration;
    }

    const sortedTargets = allEnemies
      .filter((e) => e !== origin)
      .map((e) => ({
        target: e,
        dist: Phaser.Math.Distance.Between(origin.x, origin.y, e.x, e.y),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, targetCount)
      .map((e) => e.target);

    let currentDamage = rawDamage * 0.7;
    sortedTargets.forEach((target) => {
      // 기존 감전 제거
      const existing = target.statusEffects["lightning"] as
        | LightningStatusEffect
        | undefined;
      if (existing) {
        existing.timer?.remove();
      } else {
        const icon = this.add
          .image(
            target.x,
            target.unitType === "boss" ? target.y - 80 : target.y - 40,
            "lightning"
          )
          .setDepth(200)
          .setScale(0.5);

        target.statusEffects["lightning"] = {
          icon,
          type: "lightning",
          timer: null,
        } as LightningStatusEffect;
      }

      // 타이머 설정
      const newTimer = this.time.delayedCall(duration, () => {
        const effect = target.statusEffects["lightning"] as
          | LightningStatusEffect
          | undefined;
        if (!effect) return;
        effect.icon.destroy();
        delete target.statusEffects["lightning"];
      });
      (target.statusEffects["lightning"] as LightningStatusEffect).timer =
        newTimer;

      // 데미지 적용
      const beforeHP = target.hp;
      const lightningAmp = target.statusEffects["lightning"]
        ? this.lightningAmp
        : 1;

      target.hp -= currentDamage * lightningAmp;
      this.waveTotalDamage += currentDamage * lightningAmp;
      this.flashHitEffect(target, effectColor.lightning);

      const afterHP = target.hp <= 0 ? "Dead" : target.hp.toFixed(2);
      //${idx + 1}:
      this.addDamageLog(
        `⚡ ${target.unitType} took ${(currentDamage * lightningAmp).toFixed(
          2
        )} (HP ${beforeHP.toFixed(2)} → ${afterHP})${
          target.statusEffects["lightning"] ? "⚡" : ""
        }`
      );

      if (target.hp <= 0) {
        this.kill(target);
      }

      currentDamage *= 1.25; // 다음 타겟은 5% 증폭된 데미지
    });
  }
  private handleArrowHit(
    arrow: Phaser.Physics.Arcade.Sprite & ArrowData,
    target: Phaser.Physics.Arcade.Sprite & Token2
  ) {
    const dmg = this.calcDamage(arrow);
    // const beforeHP = target.hp;

    // 상태이상 데미지 처리

    if (dmg.poison && this.isStatusEffectActivate(this.poisonChance)) {
      this.applyStatusEffectIcon(target, "poison");
      this.applyPoisonAoE(target, dmg.poison, 150, this.poisonDuration);
    }
    if (dmg.ice && this.isStatusEffectActivate(1)) {
      this.applyIceZone(target);
      if (this.awakened.ice) {
        this.applyAwakenedIceAoE(target, dmg.ice);
      }
    }

    if (dmg.lightning && this.isStatusEffectActivate(1)) {
      this.applyStatusEffectIcon(target, "lightning");
      this.applyLightningAoE(target, 6, 300, dmg.lightning);
    }
    if (dmg.phys) this.applyStatusEffectIcon(target, "physbreak");
    const physMultiplier = this.applyPhysbreakBonus(target);
    if (dmg.fire && this.isStatusEffectActivate(1)) {
      this.applyFireExplosionDamage(target, dmg.fire, 100);
    }
    dmg.total += dmg.phys * physMultiplier;

    // 최종 타겟 데미지 연산
    const lightningAmp = target.statusEffects["lightning"]
      ? this.lightningAmp
      : 1;
    const before = target.hp;

    target.hp -= dmg.total * lightningAmp;
    this.waveTotalDamage += dmg.total * lightningAmp;
    const afterHP = target.hp <= 0 ? "Dead" : target.hp.toFixed(2);

    this.addDamageLog(
      `⚔️ ${target.unitType} took ${(dmg.total * lightningAmp).toFixed(
        2
      )} (HP ${before.toFixed(2)} → ${afterHP})${
        target.statusEffects["lightning"] ? "⚡" : ""
      }`
    );

    this.flashHitEffect(target, 0xaaaaaa);

    if (target.hp <= 0 && target.active) {
      this.kill(target);
    }
  }

  private getFrontmostMonster(
    monsters: (Phaser.Physics.Arcade.Sprite & Token2)[]
  ): Phaser.Physics.Arcade.Sprite & Token2 {
    return monsters.reduce((a, b) => (b.x < a.x ? b : a), monsters[0]);
  }

  private createArrow(): Phaser.Physics.Arcade.Sprite & ArrowData {
    const arrow = this.physics.add
      .sprite(this.token1.x, this.token1.y, "arrow")
      .setImmovable() as Phaser.Physics.Arcade.Sprite & ArrowData;

    arrow.setDepth(105).setScale(0.05).setCircle(60).setOrigin(0.5);

    arrow.damage = {
      phys: { flat: this.physFlat, percent: this.physPercent },
      fire: { flat: this.fireFlat, percent: this.firePercent },
      poison: { flat: this.poisonFlat, percent: this.poisonPercent },
      ice: { flat: this.iceFlat, percent: this.icePercent },
      lightning: { flat: this.lightningFlat, percent: this.lightningPercent },
    };
    arrow.multiplier = this.multiplier;

    return arrow;
  }

  flashHitEffect(
    sprite: (Phaser.Physics.Arcade.Sprite & Token2) | Phaser.GameObjects.Sprite,
    hex: number
  ) {
    sprite.setTintFill(hex); // 연녹색
    this.time.delayedCall(100, () => sprite.clearTint());
  }

  async showChoiceCards() {
    this.pauseGame();

    try {
      // 서버에서 카드 선택지 요청
      const response = await fetch(`${SERVER_URL}/api/games/card-choices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: useAuthStore.getState().token || "",
        },
        body: JSON.stringify({
          gameId: this.gameId,
          waveNumber: this.waveCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get card choices: ${response.status}`);
      }

      const { offeredCards, cardChoiceId } = await response.json();
      this.currentCardChoiceId = cardChoiceId;

      const overlay = this.add
        .rectangle(
          this.viewportWidth / 2,
          this.viewportHeight / 2,
          1024,
          682,
          0x000000,
          0.6
        )
        .setDepth(300);
      const cardY = 280;
      const cardSpacing = 250;
      const startX = this.viewportWidth / 2 - cardSpacing;

      const allChoices = getAllChoices(this);

      // 서버에서 받은 인덱스가 실제 배열 범위 내에 있는지 확인
      const validIndices = offeredCards.filter(
        (index: number) => index < allChoices.length
      );
      if (validIndices.length !== offeredCards.length) {
        console.warn(
          "Some card indices are out of range, using valid ones only"
        );
      }

      const choices = validIndices.map((index: number) => allChoices[index]);

      let hasSelected = false;
      const cards: Phaser.GameObjects.Rectangle[] = [];
      const labels: Phaser.GameObjects.Text[] = [];

      choices.forEach((choice: any, index: number) => {
        const cardX = startX + index * cardSpacing;

        const cardBg = this.add
          .rectangle(cardX, cardY, 180, 260, 0xffffff, 1)
          .setStrokeStyle(4, 0x000000)
          .setDepth(301);

        const label = addText.call(this, {
          x: cardX,
          y: cardY - 50,
          text: choice.label,
          style: {
            fontSize: "16px",
            color: "#000000",
            align: "center",
            fontFamily: '"Quantico"',
            wordWrap: { width: 160 },
          },
          origin: { x: 0.5, y: 0.5 },
          depth: 302,
        });

        const desc = addText.call(this, {
          x: cardX,
          y: cardY + 15,
          text: choice.description,
          style: {
            fontSize: "14px",
            color: "#555555",
            fontFamily: '"Quantico"',
            wordWrap: { width: 160 },
            align: "center",
          },
          origin: { x: 0.5, y: 0.5 },
          depth: 302,
        });

        const factor = addText.call(this, {
          x: cardX,
          y: cardY + 65,
          text: choice.factor || "",
          style: {
            fontSize: "12px",
            color: "#00aa00",
            fontFamily: '"Quantico"',
            align: "center",
            wordWrap: { width: 160 },
          },
          origin: { x: 0.5, y: 0.5 },
          depth: 302,
        });
        cards.push(cardBg);
        labels.push(label, desc, factor);

        cardBg.setInteractive().on("pointerdown", async () => {
          if (hasSelected) return;
          hasSelected = true;

          try {
            // 서버에 카드 선택 완료 알림
            await fetch(`${SERVER_URL}/api/games/select-card`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: useAuthStore.getState().token || "",
              },
              body: JSON.stringify({
                cardChoiceId: this.currentCardChoiceId,
                selectedCardIndex: validIndices[index],
              }),
            });

            this.sound.play("pick", { volume: 0.8 });
            choice.apply();
            this.selected.push(choice.label); // 선택한 거 저장
            overlay.destroy();
            cards.forEach((c) => c.destroy());
            labels.forEach((l) => l.destroy());
            this.resumeGameAndStartWave();
          } catch (error) {
            console.error("Failed to update card choice:", error);
            // 에러가 발생해도 게임은 계속 진행
            this.sound.play("pick", { volume: 0.8 });
            choice.apply();
            this.selected.push(choice.label);
            overlay.destroy();
            cards.forEach((c) => c.destroy());
            labels.forEach((l) => l.destroy());
            this.resumeGameAndStartWave();
          }
        });
      });
    } catch (error) {
      console.error(
        "Failed to get card choices, falling back to local logic:",
        error
      );
      // 서버 오류 시 기존 로직으로 폴백
      this.showChoiceCardsFallback();
    }
  }

  showChoiceCardsFallback() {
    const overlay = this.add
      .rectangle(
        this.viewportWidth / 2,
        this.viewportHeight / 2,
        1024,
        682,
        0x000000,
        0.6
      )
      .setDepth(300);
    const cardY = 280;
    const cardSpacing = 250;
    const startX = this.viewportWidth / 2 - cardSpacing;

    const allChoices = getAllChoices(this);
    const shuffled = Phaser.Utils.Array.Shuffle(allChoices);
    const choices = shuffled.slice(0, 3);

    let hasSelected = false;
    const cards: Phaser.GameObjects.Rectangle[] = [];
    const labels: Phaser.GameObjects.Text[] = [];

    choices.forEach((choice, index) => {
      const cardX = startX + index * cardSpacing;

      const cardBg = this.add
        .rectangle(cardX, cardY, 180, 260, 0xffffff, 1)
        .setStrokeStyle(4, 0x000000)
        .setDepth(301);

      const label = addText.call(this, {
        x: cardX,
        y: cardY - 50,
        text: choice.label,
        style: {
          fontSize: "16px",
          color: "#000000",
          align: "center",
          fontFamily: '"Quantico"',
          wordWrap: { width: 160 },
        },
        origin: { x: 0.5, y: 0.5 },
        depth: 302,
      });

      const desc = addText.call(this, {
        x: cardX,
        y: cardY + 15,
        text: choice.description,
        style: {
          fontSize: "14px",
          color: "#555555",
          fontFamily: '"Quantico"',
          wordWrap: { width: 160 },
          align: "center",
        },
        origin: { x: 0.5, y: 0.5 },
        depth: 302,
      });

      const factor = addText.call(this, {
        x: cardX,
        y: cardY + 65,
        text: choice.factor || "",
        style: {
          fontSize: "12px",
          color: "#00aa00",
          fontFamily: '"Quantico"',
          align: "center",
          wordWrap: { width: 160 },
        },
        origin: { x: 0.5, y: 0.5 },
        depth: 302,
      });
      cards.push(cardBg);
      labels.push(label, desc, factor);

      cardBg.setInteractive().on("pointerdown", () => {
        if (hasSelected) return;
        hasSelected = true;

        this.sound.play("pick", { volume: 0.8 });
        choice.apply();
        this.selected.push(choice.label); // 선택한 거 저장
        overlay.destroy();
        cards.forEach((c) => c.destroy());
        labels.forEach((l) => l.destroy());
        this.resumeGameAndStartWave();
      });
    });
  }

  autoShoot() {
    const monsters =
      this.token2Group?.getChildren() as (Phaser.Physics.Arcade.Sprite &
        Token2)[];
    if (!monsters || monsters.length === 0) return;
    const arrow = this.createArrow();

    const target = this.getFrontmostMonster(monsters);

    const angle = Phaser.Math.Angle.Between(
      this.token1.x,
      this.token1.y,
      target.x,
      target.y
    );

    arrow.setRotation(angle + Phaser.Math.DegToRad(45));
    const vel = this.physics.velocityFromRotation(angle, 350);
    arrow.setVelocity(vel.x, vel.y);
    arrow.setData("baseVelocity", vel); // baseVelocity 저장

    this.sound.play("arrow", { volume: 0.3 });

    this.physics.add.collider(
      arrow,
      this.token2Group,
      (arrowObj, monsterObj) => {
        const a = arrowObj as Phaser.Physics.Arcade.Sprite & ArrowData;
        const m = monsterObj as Phaser.Physics.Arcade.Sprite & Token2;

        if (!a.active || !m.active) return;

        this.handleArrowHit(a, m);
        a.destroy();
      }
    );
  }

  startAutoShootTimer() {
    this.autoShootTimer?.remove(); // 기존 타이머 제거
    this.autoShootTimer = this.time.addEvent({
      delay: Math.ceil(1000 / this.attackSpeed),
      loop: true,
      callback: this.autoShoot,
      callbackScope: this,
    });
  }

  startCountdown() {
    const { width } = this.scale;
    const countdownText = addText.call(this, {
      x: width / 2,
      y: 250,
      text: "",
      style: { fontSize: "100px", color: "#FFFFFF" },
      origin: { x: 0.5, y: 0.5 },
    });

    let count = 3;

    this.time.addEvent({
      delay: 1000,
      repeat: 3,
      callback: () => {
        if (count > 0) {
          countdownText.setText(`${count}`);
          count--;
        } else {
          countdownText.destroy();

          if (!this.sound.get("gameBGM")) {
            const bgm = this.sound.add("gameBGM", { volume: 0.3, loop: true });

            bgm.play();
          } else {
            console.log("⚠️ 이미 gameBGM 로드됨");
          }

          this.showChoiceCards();
        }
      },
    });
  }

  getRandomTokenType(): UnitType {
    const types: UnitType[] = [
      "basic",
      "basic",
      "basic",
      "dealer",
      "healer",
      "tank",
    ];
    return Phaser.Utils.Array.GetRandom(types);
  }
  updateTokenHPBar(token: Phaser.Physics.Arcade.Sprite & Token2) {
    let hpBar = token.getData("hpBar") as
      | Phaser.GameObjects.Graphics
      | undefined;

    if (!hpBar) {
      hpBar = this.add.graphics().setDepth(104);
      token.setData("hpBar", hpBar);
    }

    hpBar.clear();
    const barWidth = 60;
    const hpRatio = token.hp / (token.getData("maxHP") || token.hp);
    const originX = token.x - barWidth / 2;
    const originY = token.unitType === "boss" ? token.y - 80 : token.y - 40;

    if (hpRatio >= 1) {
      hpBar.setVisible(false);
      return;
    }

    hpBar.setVisible(true);
    hpBar.fillStyle(0x000000, 1);
    hpBar.fillRect(originX, originY, barWidth, 6);
    hpBar.fillStyle(0xff4444, 1);
    hpBar.fillRect(originX, originY, barWidth * hpRatio, 6);
  }
  startSkillLoop(unit: Phaser.Physics.Arcade.Sprite & Token2) {
    if (!unit.skills || unit.skills.length === 0) return;

    unit.skills.forEach((skill) => {
      skill.timer = this.time.addEvent({
        delay: skill.cooldown,
        loop: true,
        callback: () => {
          if (unit.active) {
            skill.execute(unit);
          }
        },
      });
    });
  }

  updateHP(current: number, max: number) {
    this.hpBar.clear();
    this.hpBar.fillStyle(hpBarColor, 1);
    this.hpBar.fillRect(70, 40, 600 * (current / max), 16);
  }

  toggleSceneTimeScale() {
    console.log("Toggling time scale");
    this.timeScaleMultiplier = this.timeScaleMultiplier === 1 ? 2 : 1;
    this.time.timeScale = this.timeScaleMultiplier;
    this.physics.world.timeScale = this.timeScaleMultiplier;

    const newTexture = this.timeScaleMultiplier === 2 ? "play" : "fast";
    this.fastBtn.setTexture(newTexture);
  }

  startWave() {
    const wavetime = 30;
    let timer = wavetime;

    this.waveTotalDamage = 0;
    const waveConfigFactor = Math.floor((this.waveCount - 1) / 5);

    let difficultyConfig: number;

    switch (this.difficulty) {
      case "easy":
        difficultyConfig = 1;
        break;
      case "normal":
        difficultyConfig = 2;
        break;
      case "hard":
      default:
        difficultyConfig = 3;
        break;
    }

    this.waveText.setText(`Wave ${this.waveCount}/25`);

    this.unitCountText.setText(
      `Unit Count ${this.unitCount}/${this.deathCount}`
    );

    const originHp =
      this.daf *
      (waveConfigFactor + 1) *
      difficultyConfig *
      (13 + (2 + difficultyConfig) * 5 * waveConfigFactor) *
      1.4 ** (this.waveCount - 1);
    const isBossWave = this.waveCount % 5 === 0;

    if (isBossWave) {
      this.sound.play("boss");

      const boss = this.token2Group
        .create(900, this.spawnGroundY + this.bossYOffset, "token2boss")
        .setImmovable() as Physics.Arcade.Sprite & Token2;

      boss.statusEffects = {};
      boss.unitType = "boss";
      boss.hp = originHp * 2 * (waveConfigFactor * 0.5 + 1);
      boss.setData("originalSpeed", this.globalSpeed);
      boss.setData("maxHP", boss.hp);
      boss.damage = 20;
      boss.setVelocityX(boss.getData("originalSpeed") * -1);
      boss.setVelocityY(0);
      boss.setDepth(102);

      const resistTypes = ["phys", "fire", "poison", "ice", "lightning"];
      const chosenTypes = Phaser.Utils.Array.Shuffle(resistTypes).slice(
        0,
        difficultyConfig
      ); // 이지모드에서는 한개만
      const auraMsg = chosenTypes
        .map(
          (type) => `${type} Resist +${Math.round(this.bossResistBuff * 100)}%`
        )
        .join(", ");

      showNotification.call(
        this,
        `👑 Boss Aura: ${auraMsg}, Speed +${Math.round(
          this.bossSpeedBuff * 100
        )}%`
      );

      this.bossResistAppliedTypes = chosenTypes;
      chosenTypes.forEach((type) => {
        this.globalResistTypes[type] += this.bossResistBuff; // 기본 저항 수치 설정
      });
      this.globalSpeedBuff += this.bossSpeedBuff;
      this.bossAlive = true;

      this.unitCount++;
      this.unitCountText.setText(
        `Unit Count ${this.unitCount}/${this.deathCount}`
      );
      if (this.unitCount >= this.deathCount) {
        this.token2SpawnTimer?.remove();
        this.waveTimer?.remove();
        this.changeScene();
      }
    }

    this.token2SpawnTimer = this.time.addEvent({
      delay: 1000,
      repeat: this.maxSpawn - 1,
      callback: () => {
        const tokenType: UnitType = this.getRandomTokenType();
        const spawnY =
          tokenType === "healer"
            ? this.spawnGroundY + this.healerYOffset
            : this.spawnGroundY;
        const token2 = this.token2Group
          .create(900, spawnY, `token2${tokenType}`)
          .setImmovable() as Physics.Arcade.Sprite & Token2;

        token2.setDepth(309);
        token2.anims.play(`token2${tokenType}`);
        token2.statusEffects = {};

        switch (tokenType) {
          case "basic":
            token2.unitType = "basic";
            token2.hp = originHp;
            token2.damage = 10;
            token2.setData("originalSpeed", this.globalSpeed);
            token2.setData("maxHP", token2.hp);
            break;
          case "dealer":
            token2.unitType = "dealer";
            token2.hp = originHp * 0.9;
            token2.damage = 15;
            token2.setData(
              "originalSpeed",
              this.globalSpeed * (1 + difficultyConfig / 3)
            );
            token2.setData("maxHP", token2.hp);
            break;
          case "healer":
            token2.unitType = "healer";
            token2.hp = originHp * 0.7;
            token2.setData("originalSpeed", this.globalSpeed);
            token2.setData("maxHP", token2.hp);
            token2.damage = 5;
            token2.skills = [
              {
                type: "heal",
                cooldown: 500,
                execute: (caster) => {
                  const allies =
                    this.token2Group.getChildren() as (Phaser.Physics.Arcade.Sprite &
                      Token2)[];
                  allies.forEach((ally) => {
                    if (
                      Phaser.Math.Distance.Between(
                        caster.x,
                        caster.y,
                        ally.x,
                        ally.y
                      ) <= 200 &&
                      !(this.awakened.poison && ally.statusEffects["poison"])
                    ) {
                      const healAmount = ally.hp * 0.01;
                      ally.hp = Math.min(ally.hp + healAmount, ally.hp);
                      this.updateTokenHPBar(ally);
                    }
                  });
                },
              },
            ];
            this.startSkillLoop(token2);
            break;
          case "tank":
            token2.unitType = "tank";
            token2.hp =
              originHp * 1.5 * (waveConfigFactor * (difficultyConfig - 1) + 1);
            token2.setData("originalSpeed", this.globalSpeed * 0.8);
            token2.setData("maxHP", token2.hp);
            token2.damage = 6;
            break;
        }

        token2.setVelocityX(token2.getData("originalSpeed") * -1);
        token2.setVelocityY(0);
        token2.setDepth(102);

        this.unitCount++;
        this.unitCountText.setText(
          `Unit Count ${this.unitCount}/${this.deathCount}`
        );
        if (this.unitCount >= this.deathCount) {
          this.token2SpawnTimer?.remove();
          this.waveTimer?.remove();
          this.changeScene();
        }
      },
      callbackScope: this,
    });

    this.waveTimer = this.time.addEvent({
      delay: 1000,
      repeat: timer - 1,
      callback: () => {
        timer--;
        this.timerText.setText(`Time Left:  ${timer}`);
        if (timer <= 5) {
          this.timerText.setColor("#FF0000"); // 빨간색
        } else {
          this.timerText.setColor("#000000"); // 기본 검정색 (원래 색상으로)
        }
      },
      callbackScope: this,
    });

    this.time.delayedCall((wavetime - 5) * 1000, async () => {
      if (this.waveCount < 25) {
        this.waveCount++;

        // 서버에 웨이브 업데이트
        if (this.gameId) {
          try {
            await fetch(`${SERVER_URL}/api/games/update-wave`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: useAuthStore.getState().token || "",
              },
              body: JSON.stringify({
                gameId: this.gameId,
                waveCount: this.waveCount,
              }),
            });
          } catch (error) {
            console.error("Failed to update wave:", error);
          }
        }

        this.time.delayedCall(1000, () => this.startCountdown());
      } else {
        this.time.delayedCall(1000, () => this.startCountdown());
        this.changeScene();
      }
    });
  }
}
