import Phaser from "phaser";
import { MainGame, PoolList } from "./scenes";
import { useAuthStore, useGameStore } from "@/shared";
import { difficultyConfig } from "./constants";
import { Difficulty } from "./types";

export function addLogoutButton(this: Phaser.Scene) {
  const { width } = this.scale;
  this.add
    .text(width - 70, 30, "Logout", {
      fontFamily: '"Press Start 2P"',
      fontSize: 12,
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
      backgroundColor: "#FF0000",
      align: "center",
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
      useAuthStore.getState().clearAuth(); // 상태 초기화
      this.scene.stop("PoolList");
      this.scene.start("MainMenu"); // MainMenu로 이동
    })
    .setDepth(100);
}

export function addBalanceInfo(this: PoolList) {
  const { token1Amount, token2Amount } = useGameStore.getState().balance;
  const token1AmountText =
    token1Amount !== undefined && token1Amount !== null
      ? `Balance ETH: ${token1Amount.toFixed(4)}`
      : `Token1: Error`;

  const token2AmountText =
    token2Amount !== undefined && token2Amount !== null
      ? `Balance USDT: ${token2Amount.toFixed(4)}`
      : `Token2: Error`;

  this.token1Amount = this.add
    .text(40, 30, token1AmountText, {
      fontFamily: '"Press Start 2P"',
      fontSize: 10,
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
      align: "right",
    })
    .setOrigin(0)
    .setDepth(100);

  this.token2Amount = this.add
    .text(40, 55, token2AmountText, {
      fontFamily: '"Press Start 2P"',
      fontSize: 10,
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
      align: "right",
    })
    .setOrigin(0)
    .setDepth(100);
}

export function createDifficultyButtons(this: PoolList, baseY: number) {
  const container = this.add
    .container(this.scale.width / 2, baseY)
    .setDepth(105);

  // 난이도/수량/배경색
  const configs: Array<{
    level: "easy" | "normal" | "hard";
    amount: number;
    bg: number; // hex color
  }> = [
    { level: "easy", amount: 0.0001, bg: 0xb3ffcc },
    { level: "normal", amount: 0.001, bg: 0xfff599 },
    { level: "hard", amount: 0.01, bg: 0xffb3b3 },
  ];

  const spacing = 220; // 버튼 간 간격

  // 공용 버튼 생성기
  const makeSwapButton = (
    offsetX: number,
    cfg: { level: "easy" | "normal" | "hard"; amount: number; bg: number }
  ) => {
    const btnWidth = 200;
    const btnHeight = 90;
    const radius = 12;

    // 컨테이너
    const btn = this.add.container(offsetX, 0);
    btn.setSize(btnWidth, btnHeight);

    // 배경(라운드 사각형)
    const bg = this.add.graphics();
    bg.fillStyle(cfg.bg, 1);
    bg.lineStyle(3, 0x000000, 1);
    bg.fillRoundedRect(
      -btnWidth / 2,
      -btnHeight / 2,
      btnWidth,
      btnHeight,
      radius
    );
    bg.strokeRoundedRect(
      -btnWidth / 2,
      -btnHeight / 2,
      btnWidth,
      btnHeight,
      radius
    );
    btn.add(bg);

    // 1줄: SWAP 1 SOL
    const line1 = this.add
      .text(0, -12, `SWAP ${cfg.amount} ${this.token1}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "12px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    // 2줄: EASY/NORMAL/HARD
    const line2 = this.add
      .text(0, 16, cfg.level.toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    btn.add([line1, line2]);

    // 인터랙션 영역
    const hitZone = this.add
      .zone(0, 0, btnWidth, btnHeight)
      .setOrigin(0.5)
      .setRectangleDropZone(btnWidth, btnHeight)
      .setInteractive({ useHandCursor: true });
    btn.add(hitZone);

    // 효과
    hitZone.on("pointerover", () => btn.setScale(1.03));
    hitZone.on("pointerout", () => btn.setScale(1.0));

    // 클릭 로직
    hitZone.on("pointerdown", () => {
      const { token1Amount } = useGameStore.getState().balance;
      const exchangeRate = useGameStore.getState().exchangeRate;
      if (token1Amount < cfg.amount) {
        const notice = this.add
          .text(
            512,
            550,
            `❌ Not enough balance for ${cfg.level.toUpperCase()} (Need ${
              cfg.amount
            } ${this.token1})`,
            {
              fontSize: "18px",
              fontFamily: '"Press Start 2P"',
              backgroundColor: "#222",
              color: "#fff",
              padding: { x: 10, y: 5 },
            }
          )
          .setOrigin(0.5)
          .setDepth(200);

        this.time.delayedCall(2000, () => notice.destroy());

        return;
      }
      this.scene.start("MainGame", {
        difficulty: cfg.level,
        exchangeRate,
        token1: this.token1,
        token2: this.token2,
      });
    });

    return btn;
  };

  // 버튼 3개 배치
  configs.forEach((cfg, i) => {
    const offsetX = i * spacing - spacing;
    container.add(makeSwapButton(offsetX, cfg));
  });

  return container;
}
export function createPlatforms(this: Phaser.Scene) {
  const group = this.physics.add.staticGroup();

  const ground = this.physics.add.staticImage(450, 600, "ground").setDepth(1);
  const fortress = this.physics.add
    .staticImage(140, 406, "fortress")
    .setDepth(2);

  // 그룹에 추가하면 한 번에 관리(선택)
  group.add(ground);
  group.add(fortress);

  // 씬 종료 시 정리(메모리 누수 방지)
  const cleanup = () => {
    try {
      group.clear(true, true);
    } catch (e) {
      // ignore
    }
  };
  this.events.once("shutdown", cleanup);
  this.events.once("destroy", cleanup);

  return group;
}

export function createPoolCard(this: PoolList) {
  const card = this.add
    .container(this.scale.width / 2, this.scale.height / 2)
    .setDepth(100);
  const bgWidth = 700;
  const bgHeight = 80;
  const bg = this.add.graphics();
  bg.fillStyle(0xffffff, 0.7);
  bg.fillRoundedRect(-bgWidth / 2, -60, bgWidth, bgHeight, 16);
  bg.lineStyle(3, 0x000000);
  bg.strokeRoundedRect(-bgWidth / 2, -60, bgWidth, bgHeight, 16);
  card.add(bg);

  const leftToken = this.add
    .text(-240, -20, this.token1, {
      fontSize: "14px",
      fontFamily: '"Press Start 2P"',
      color: "#000000",
    })
    .setOrigin(0.2);

  const ratio = useGameStore.getState().ratio;

  const ratioText = this.add
    .text(0, -20, ratio || "1:1", {
      fontSize: "14px",
      fontFamily: '"Press Start 2P"',
      color: "#000000",
    })
    .setOrigin(0.2);
  const unsubscribe = useGameStore.subscribe(
    (state) => state.ratio,
    (newRatio) => ratioText.setText(newRatio || "1:1")
  );

  // 씬 종료 시 구독 해제
  this.events.once("shutdown", unsubscribe);
  this.events.once("destroy", unsubscribe);
  const rightToken = this.add
    .text(240, -20, this.token2, {
      fontSize: "14px",
      fontFamily: '"Press Start 2P"',
      color: "#000000",
    })
    .setOrigin(0.2);

  card.add([leftToken, ratioText, rightToken]);

  card.setSize(bgWidth, bgHeight);
  return card;
}

export function showNotification(
  this: PoolList | MainGame,
  message: string,
  displayDuration: number = 4000
) {
  this.swapMessage.setText(message).setVisible(true);

  this.notificationTimer?.remove();

  this.notificationTimer = this.time.delayedCall(displayDuration, () => {
    this.swapMessage.setVisible(false);
  });
}

export function initMainGameState(this: MainGame) {
  const config = difficultyConfig[this.difficulty as Difficulty];
  let maxSpan: number;
  switch (this.difficulty) {
    case "easy":
      maxSpan = 20;
      break;
    case "normal":
      maxSpan = 25;
      break;
    case "hard":
      maxSpan = 30;
      break;
    default:
      maxSpan = 20;
  }
  this.maxSpawn = maxSpan;
  this.TotalToken2Count = maxSpan * 25;

  this.entryFee = config.entryFee;

  this.selected = [];
  this.information = [];
  this.onHistory = false;
  this.onInformation = false;

  this.totalEarn = 0;

  // 게임 상태
  this.hpMultiplier = config.hpMultiplier;
  this.castleHP = 100;
  this.castleMaxHP = 100;
  this.waveCount = 1;
  this.killCount = 0;
  this.unitCount = 0;
  this.waveTotalDamage = 0;
  this.bossAlive = false;
  this.bossResistAppliedTypes = [];
  this.maxSpawn = config.maxSpawn;

  // 전투 기본 수치
  this.physFlat = 0;
  this.physPercent = 0;
  this.fireFlat = 0;
  this.firePercent = 0;
  this.poisonFlat = 0;
  this.poisonPercent = 0;
  this.iceFlat = 0;
  this.icePercent = 0;
  this.lightningFlat = 0;
  this.lightningPercent = 0;
  this.multiplier = 1;
  this.attackSpeed = 1;
  this.critChance = 0;
  this.executionCap = 0;

  // 전투 보정 계수
  this.lightningAmp = 1.1;
  this.iceSlowFactor = 1.0;
  this.poisonDuration = 2000;
  this.fireAmp = 0.8;
  this.physMultiplier = 0.1;
  this.poisonChance = 0.7;

  // 아이스존 관련
  this.iceZoneWidth = 50;
  this.iceZoneLength = 6;
  this.iceZoneDuration = 3000;

  //awaken
  this.awakened = {
    phys: false,
    fire: false,
    lightning: false,
    poison: false,
    ice: false,
  };
  this.physStack = 0;
  this.fireCorpseExplosion = 0;
  this.lightningChain = 0;
  this.lightningShockDuration = 0;
  this.poisonRadius = 0;
  this.poisonHealBlock = false;
  this.iceFreezChance = 0.5;
  this.iceFreezeDuration = 500;

  // 난이도에 따른 스탯 적용
  this.globalSpeed = config.globalSpeed;
  this.globalResistTypes = {
    phys: config.resist,
    fire: config.resist,
    poison: config.resist,
    ice: config.resist,
    lightning: config.resist,
  };

  // 보스 버프 관련
  this.globalSpeedBuff = 1.0;
  this.bossSpeedBuff = 1;
  this.bossResistBuff = 0.2;

  // 타이머 및 이펙트 정리
  this.token2SpawnTimer?.remove();
  this.waveTimer?.remove();
  this.autoShootTimer?.remove();
  this.notificationTimer?.remove();

  this.iceZones.forEach((z) => z.destroy());
  this.iceZones = [];
  this.damageLogs.forEach((l) => l.destroy());
  this.damageLogs = [];
}

export function addButton(
  this: Phaser.Scene,
  {
    x,
    y,
    title,
    style,
  }: // cb,
  {
    x: number;
    y: number;
    title: string;
    style?: Phaser.Types.GameObjects.Text.TextStyle;
    // cb: () => void;
  }
) {
  const button = this.add
    .text(x, y, title, {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: '"Press Start 2P"',
      padding: { left: 15, right: 15, top: 8, bottom: 8 },
      align: "center",
      ...style,
    })
    .setOrigin(1, 1) // 오른쪽 아래 정렬
    .setDepth(110)
    .setAlpha(0.8)
    .setInteractive({ useHandCursor: true });
  return button;
  // button.on("pointerdown", cb);
}

export function showHistory(this: MainGame) {
  this.pauseGame();
  if (this.onHistory || this.onInformation) return;
  this.onHistory = true;
  const infoTexts: Phaser.GameObjects.Text[] = [];
  const { width, height } = this.scale;
  const overlay = this.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
    .setDepth(300);
  if (this.selected.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    infoTexts;
    const half = Math.ceil(this.selected.length / 2);

    this.selected.forEach((text, index) => {
      const isLeft = index < half;
      const x = isLeft ? 50 : 450; // 왼쪽/오른쪽 열
      const y = 100 + (index % half) * 26;

      const infoText = this.add
        .text(x, y, text, {
          color: "#ffffff",
          fontSize: "12px",
          fontFamily: '"Press Start 2P"',
          align: "left",
        })
        .setOrigin(0, 0)
        .setDepth(302);

      infoTexts.push(infoText);
    });
  }
  const closeButton = this.add
    .text(width / 2, 550, "CLOSE", {
      fontSize: "24px",
      color: "#ffffff",
      // backgroundColor: '#000000',
      fontFamily: '"PRESS START 2P"',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setInteractive({ useHandCursor: true });

  closeButton.on("pointerdown", () => {
    overlay.destroy();
    if (this.selected.length > 0) infoTexts.forEach((t) => t.destroy());
    closeButton.destroy();
    this.onHistory = false;
    this.time.paused = false;
    this.physics.world.resume();
  });
}

export function addFastBtn(this: MainGame) {
  // fast-forward 버튼 생성
  const isFast = this.timeScaleMultiplier === 2;

  // 버튼 배경용 사각형
  const boxX = 850;
  const boxY = 30;
  const boxW = 64;
  const boxH = 64;

  // 배경 박스 추가
  const fastBox = this.add
    .rectangle(boxX, boxY, boxW, boxH, 0xffffaa, 0.4) // 밝은 노란색 + 약간 투명
    .setStrokeStyle(2, 0xffd700, 0.8) // 금색 테두리 느낌
    .setDepth(99)
    .setScrollFactor(0);

  // 버튼 이미지
  this.fastBtn = this.add
    .image(boxX, boxY, isFast ? "play" : "fast")
    .setInteractive()
    .setDepth(100)
    .setScale(0.5)
    .setScrollFactor(0);

  // 🟨 “눌러보세요” 텍스트 (optional)
  const hintText = this.add
    .text(boxX, boxY + 40, "Tap me!", {
      fontFamily: '"Press Start 2P"',
      fontSize: "8px",
      color: "#000000",
    })
    .setOrigin(0.5, 0)
    .setDepth(100)
    .setAlpha(0.6)
    .setScrollFactor(0);

  // 🔸 컨테이너로 묶어서 하나로 관리
  const fastBtnContainer = this.add
    .container(0, 0, [fastBox, this.fastBtn, hintText])
    .setDepth(100);

  // 🛑 처음엔 비활성화
  this.fastBtn.disableInteractive();
  hintText.setVisible(false);

  // 5초 후 활성화 + 안내 표시
  this.time.delayedCall(4500, () => {
    this.fastBtn.setInteractive();
    hintText.setVisible(true);

    // 약간 깜빡이는 효과로 “눌러봐” 유도
    this.tweens.add({
      targets: hintText,
      alpha: { from: 0.6, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 600,
    });
  });

  // 클릭 시 속도 토글
  this.fastBtn.on("pointerdown", () => {
    this.toggleSceneTimeScale();

    // 눌렀으면 안내 텍스트 숨기기
    hintText.setVisible(false);
  });
}

export function setupHUD(this: MainGame) {
  /** HUD 요소를 전부 container에 추가 */

  const hudBoxW = 220;
  const hudBoxH = 120;
  const hudOffsetY = 60;
  const hudBoxCenterX = this.viewportWidth - hudBoxW / 2 - 20;
  const hudBoxCenterY = hudOffsetY + hudBoxH / 2;
  const hudBg = this.add
    .rectangle(hudBoxCenterX, hudBoxCenterY, hudBoxW, hudBoxH, 0xffffff, 0.8)
    .setStrokeStyle(2, 0xffffff, 0.06)
    .setDepth(95);

  const hudContainer = this.add
    .container(hudBoxCenterX - hudBoxW / 2, hudBoxCenterY - hudBoxH / 2)
    .setDepth(110);

  const textRightEdge = hudBoxW - 10; // 오른쪽 여백 10
  const textBaseY = 20;
  const textGap = 16;
  const textStyle = {
    fontSize: "12px",
    fontFamily: '"Press Start 2P"',
    color: "#000000",
  };

  // ✅ 공통 텍스트 생성 함수
  const makeText = (text: string, offsetY: number) => {
    const txt = this.add
      .text(textRightEdge, textBaseY + offsetY, text, textStyle)
      .setOrigin(1, 0) // ✅ 오른쪽 정렬
      .setScrollFactor(0);
    hudContainer.add(txt);
    return txt;
  };

  this.waveText = makeText("Wave 1/25", 0);
  this.killText = makeText(
    `Kill ${this.killCount}/${this.TotalToken2Count}`,
    textGap
  );
  this.unitCountText = makeText("Unit Count 0/25", textGap * 2);
  this.timerText = makeText("Time Left 30", textGap * 3);
  this.baseAmountText = makeText(
    `Base Amount : ${(this.entryFee * this.exchangeRatio).toFixed(2)} ${
      this.token2Name
    }`,
    textGap * 5
  );

  this.totalEarnText = this.add
    .text(
      570,
      hudOffsetY + hudBoxH + 10,
      `Total 💰 ${this.totalEarn.toFixed(3)} ${this.token2Name}`,
      {
        fontSize: "14px",
        color: "#FFFF00",
        fontFamily: '"Press Start 2P"',
        stroke: "#000",
        strokeThickness: 2,
      }
    )
    .setDepth(100)
    .setOrigin(0, 0);
  hudContainer.addAt(hudBg, 0);

  /** Scene 종료 시 정리 */
  this.events.once("shutdown", () => {
    hudContainer.destroy(true);
    hudBg.destroy();
  });
}

export function showInformation(this: MainGame) {
  this.pauseGame();
  if (this.onInformation || this.onHistory) return;
  this.onInformation = true;

  const overlay = this.add
    .rectangle(
      this.viewportWidth / 2,
      this.viewportHeight / 2,
      1024,
      682,
      0x000000,
      0.75
    )
    .setDepth(300);

  const infoTexts: Phaser.GameObjects.Text[] = [];

  const infoList = [
    `🗡️ Physical Flat: ${this.physFlat}`,
    `🗡️ Physical %: ${(this.physPercent * 100).toFixed(1)}% `,
    `🗡️ Physical Awakend: ${this.awakened.phys} `,
    `🗡️ Phys Multiplier: x${this.physMultiplier.toFixed(2)} `,
    `🗡️ Phys Stack: ${this.physStack} `,
    `🔥 Fire Awakend: ${this.awakened.fire} `,
    `🔥 Fire Flat: ${this.fireFlat} `,
    `🔥 Fire AOE Amp: ${this.fireAmp} `,
    `🔥 Fire Corpse Explosion: ${this.fireCorpseExplosion * 100}% `,
    `🔥 Fire %: ${(this.firePercent * 100).toFixed(1)}% `,
    `🔥 Execution Cap: ${(this.executionCap * 100).toFixed(1)}% `,
    `☠️ Poison Awakend: ${this.awakened.poison} `,
    `☠️ Poison Flat: ${this.poisonFlat} `,
    `☠️ Poison %: ${(this.poisonPercent * 100).toFixed(1)}% `,
    `☠️ Poison Accelated: ${this.awakened.poison ? "x2" : "x1"} `,
    `☠️ Poison Radius: ${this.poisonRadius} `,
    `☠️ Poison Heal Block: ${this.awakened.poison ? "Yes" : "No"} `,
    `☠️ Poison Chance: ${(this.poisonChance * 100).toFixed(1)}% `,
    `☠️ Poison Duration: ${(this.poisonDuration / 1000).toFixed(1)} s`,
    `❄️ Ice Awakend: ${this.awakened.ice} `,
    `❄️ Ice Flat: ${this.iceFlat} `,
    `❄️ Ice %: ${(this.icePercent * 100).toFixed(1)}% `,
    `❄️ Ice Slow Factor: ${Math.round((1 - this.iceSlowFactor) * 100)}% `,
    `❄️ Ice Freez Chance: ${(this.iceFreezChance * 100).toFixed(1)}% `,
    `❄️ Ice Freez Duration: ${(this.iceFreezeDuration / 1000).toFixed(1)} s`,
    `⚡ Lightning Awakend: ${this.awakened.lightning} `,
    `⚡ Lightning Flat: ${this.lightningFlat} `,
    `⚡ Lightning %: ${(this.lightningPercent * 100).toFixed(1)}% `,
    `⚡ Lightning Amp: x${this.lightningAmp.toFixed(2)} `,
    `⚡ Lightning Chain: ${this.lightningChain + 6} `,
    `⚡ Lightning Shock Duration: ${(
      (this.lightningShockDuration + 1000) /
      1000
    ).toFixed(1)} s`,
    `💥 Multiplier: x${this.multiplier.toFixed(2)} `,
    `🏹 Attack Speed: x${this.attackSpeed.toFixed(2)} `,
    `🎯 Crit Chance: ${(this.critChance * 100).toFixed(1)}% `,
  ];

  const half = Math.ceil(infoList.length / 2);

  infoList.forEach((text, index) => {
    const isLeft = index < half;
    const x = isLeft ? 50 : 450; // 왼쪽/오른쪽 열
    const y = 100 + (index % half) * 26;

    const infoText = this.add
      .text(x, y, text, {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "Arial Black",
        align: "left",
      })
      .setOrigin(0, 0)
      .setDepth(302);

    infoTexts.push(infoText);
  });

  const closeButton = this.add
    .text(this.viewportWidth / 2, 550, "CLOSE", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: '"PRESS START 2P"',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(302)
    .setInteractive({ useHandCursor: true });

  closeButton.on("pointerdown", () => {
    overlay.destroy();
    infoTexts.forEach((t) => t.destroy());
    closeButton.destroy();
    this.onInformation = false;
    this.time.paused = false;
    this.physics.world.resume();
  });
}

export function addText(
  this: Phaser.Scene,
  {
    x,
    y,
    text,
    style,
    origin = { x: 0.5, y: 0.5 },
    depth = 10,
  }: {
    x: number;
    y: number;
    text: string;
    style?: Phaser.Types.GameObjects.Text.TextStyle;
    origin?: { x: number; y: number };
    depth?: number;
  }
) {
  return this.add
    .text(x, y, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: "24px",
      color: "#FFFFFF",
      ...style,
    })
    .setOrigin(origin.x, origin.y)
    .setDepth(depth);
}

function nextIceSlowFactor(before: number) {
  if (Math.round(before) > 0.4) {
    const after = before - 0.1;
    if (Math.round(after * 10) === 4) {
      return `Slow rate 60% (MAX)`;
    } else {
      return `Movement speed reduced by  ${Math.round((1 - after) * 100)}%`;
    }
  } else {
    return `Slow rate 60% (MAX)`;
  }
}

export function getAllChoices(game: MainGame) {
  const waveScale = game.waveCount;
  const iceSlowFactor = nextIceSlowFactor(game.iceSlowFactor);
  return [
    {
      label: `🗡️ +${10 + 6 * waveScale} Physical Flat Damage`,
      description: `Each hit stacks bonus physical damage taken.`,
      apply: () => {
        game.physFlat += 10 + 6 * waveScale;
        game.physMultiplier += 0.05;
        game.attackSpeed += 5 / 100;
        game.startAutoShootTimer();
      },
      factor: `Multiplier, stack, and attack speed +5%`,
    },
    {
      label: `🔥 +${10 + 5 * waveScale} Fire Flat Damage`,
      description: `Deals AoE damage on impact. Executes enemies under 5% HP.`,
      apply: () => {
        game.fireFlat += 10 + 5 * waveScale;
        game.fireAmp += 0.05;
        game.fireAmp = Math.round(game.fireAmp);
        if (Math.round(game.executionCap * 100) / 100 < 0.8) {
          game.executionCap += game.executionCap === 0 ? 0.04 : 0.01;
        } else {
          game.executionCap = 0.08;
        }
      },
      factor: `${Math.round(
        game.fireAmp * 100
      )}% AoE damage, +1% execution cap (Max 8%)`,
    },
    {
      label: `☠️ +${10 + 5 * waveScale} Poison Flat Damage`,
      description: `Deals damage over time in an area.`,
      apply: () => {
        game.poisonFlat += 10 + waveScale * 5;
        if (game.poisonChance < 1) {
          game.poisonChance += 0.1;
        } else {
          game.poisonDuration += 500;
        }
      },
      factor:
        game.poisonChance < 1 ? `Poison chance +10%` : `Poison duration +0.5s`,
    },
    {
      label: `❄️ +${10 + 5 * waveScale} Ice Flat Damage`,
      description: `Slows enemies within a zone.`,
      apply: () => {
        game.iceFlat += 10 + 5 * waveScale;
        if (Math.round(game.iceSlowFactor) > 0.4) {
          game.iceSlowFactor -= 0.1;
          if (Math.round(game.iceSlowFactor * 10) === 4) {
            game.iceSlowFactor = 0.4;
          }
        } else game.iceSlowFactor = 0.4;
      },
      factor: iceSlowFactor,
    },
    {
      label: `⚡ +${10 + 5 * waveScale} Lightning Flat Damage`,
      description: `Makes enemies take increased damage.`,
      apply: () => {
        game.lightningFlat += 10 + 5 * waveScale;
        game.lightningAmp += 0.05;
      },
      factor: `Shock effect +5%, chain targets: ${6 + game.lightningChain}`,
    },
    {
      label: `🗡️ +${20 + 6 * waveScale}% Physical Damage`,
      description: `Increases physical damage dealt.`,
      apply: () => {
        if (game.physFlat <= 0) game.physFlat += 5;
        game.physPercent += (20 + 6 * waveScale) / 100;
        game.physMultiplier += 0.05;
        game.attackSpeed += 5 / 100;
        game.startAutoShootTimer();
      },
      factor: `Multiplier, stack, and attack speed +5%`,
    },
    {
      label: `🔥 +${20 + 6 * waveScale}% Fire Damage`,
      description: `Increases fire AoE damage.`,
      apply: () => {
        if (game.fireFlat <= 0) game.fireFlat += 5;
        game.firePercent += (20 + 6 * waveScale) / 100;
        game.fireAmp += 0.05;
        game.fireAmp = Math.round(game.fireAmp);
        if (Math.round(game.executionCap * 100) / 100 < 0.8) {
          game.executionCap += game.executionCap === 0 ? 0.04 : 0.01;
        } else {
          game.executionCap = 0.08;
        }
      },
      factor: `${Math.round(
        game.fireAmp * 100
      )}% AoE damage, +1% execution cap (Max 8%)`,
    },
    {
      label: `☠️ +${20 + 6 * waveScale}% Poison Damage`,
      description: `Increases poison tick damage.`,
      apply: () => {
        if (game.poisonFlat <= 0) game.poisonFlat += 5;
        game.poisonPercent += (20 + 2 * waveScale) / 100;
        if (game.poisonChance < 1) {
          game.poisonChance += 0.1;
        } else {
          game.poisonDuration += 500;
        }
      },
      factor:
        game.poisonChance < 1 ? `Poison chance +10%` : `Poison duration +0.5s`,
    },
    {
      label: `❄️ +${20 + 7 * waveScale}% Ice Damage`,
      description: `Increases slow zone damage.`,
      apply: () => {
        if (game.iceFlat <= 0) game.iceFlat += 5;
        game.icePercent += (20 + 7 * waveScale) / 100;
        if (Math.round(game.iceSlowFactor) > 0.4) {
          game.iceSlowFactor -= 0.1;
          if (Math.round(game.iceSlowFactor * 10) === 4) {
            game.iceSlowFactor = 0.4;
          }
        } else game.iceSlowFactor = 0.4;
      },
      factor: iceSlowFactor,
    },
    {
      label: `⚡ +${20 + 6 * waveScale}% Lightning Damage`,
      description: `Increases lightning amp damage.`,
      apply: () => {
        if (game.lightningFlat <= 0) game.lightningFlat += 5;
        game.lightningPercent += (20 + 6 * waveScale) / 100;
        game.lightningAmp += 0.05;
      },
      factor: `Shock effect +5%, chain targets: ${6 + game.lightningChain}`,
    },
    ...(game.waveCount > 1
      ? [
          {
            label: `💥 +${5 + 4 * waveScale}% Overall Damage Multiplier`,
            description: `Boosts all damage.`,
            apply: () => (game.multiplier += (5 + 4 * waveScale) / 100),
            factor: `Overall damage +${5 + 4 * waveScale}%`,
          },
        ]
      : []),
    ...(game.critChance < 1 && game.waveCount > 1
      ? [
          {
            label: `🎯 +25% Critical Hit Chance`,
            description: `Doubles critical hit damage.`,
            apply: () => (game.critChance += 25 / 100),
            factor: `Critical hit chance +25%`,
          },
        ]
      : []),
    ...(game.waveCount > 1
      ? [
          {
            label: `🏹 +30% Attack Speed`,
            description: `Fires arrows faster.`,
            apply: () => {
              game.attackSpeed += 30 / 100;
              game.startAutoShootTimer();
            },
            factor: `Attack speed +30%`,
          },
        ]
      : []),
  ];
}

export function addFastButton(this: MainGame) {}

export function getAllBossChoices(game: MainGame) {
  return [
    {
      label: `🗡️ +1 Phys Stack per Attack`,
      description: `Each attack applies an additional physbreak stack.`,
      apply: () => {
        game.awakened.phys = true;
        game.physMultiplier += 0.05;
        game.physStack += 1;
        game.attackSpeed += 0.25;
      },
      factor: `Physbreak stacks +${game.physStack + 1}, Attack Speed +25%`,
    },
    {
      label: `🔥 Corpse Explosion +8%`,
      description: `Kills enemies with fire explosions, dealing 8% of their HP as AoE damage.`,
      apply: () => {
        game.awakened.fire = true;
        game.fireCorpseExplosion += 0.08;
      },
      factor: `Triggers ${
        (game.fireCorpseExplosion + 0.08) * 100
      }% HP AoE explosion`,
    },
    {
      label: `⚡ Lightning Chain +1`,
      description: `Lightning jumps to 1 more target and shock lasts 0.2s longer. 100% crit chance.`,
      apply: () => {
        game.awakened.lightning = true;
        game.lightningChain += 1;
        game.critChance = 1;
      },
      factor: `Chain targets: ${
        game.lightningChain + 7
      }, Critical Hit Chance 100%`,
    },
    {
      label: `☠️ Poison Radius + Healblock`,
      description: `Larger poison AoE, heal block, double tick speed.`,
      apply: () => {
        game.awakened.poison = true;
        game.poisonHealBlock = true;
        game.poisonChance = 1;
        game.poisonDuration += 500;
      },
      factor: `Poison radius +${
        game.poisonRadius + 10
      }, Healing blocked, Poison Chance 100%, Duration +0.5s`,
    },
    {
      label: `❄️ AoE Freeze Chance`,
      description: `Chance to freeze enemies in an area for ${(
        Math.round((game.iceFreezeDuration / 1000) * 100) / 100
      ).toFixed(2)}s. AoE damage x0.5 ~ x1.5.`,
      apply: () => {
        game.awakened.ice = true;
        if (game.iceFreezChance < 1) game.iceFreezChance += 0.1;
        game.iceFreezeDuration += 100;
      },
      factor: `Freeze Chance +10%, Freeze Duration +0.1s`,
    },
  ];
}
