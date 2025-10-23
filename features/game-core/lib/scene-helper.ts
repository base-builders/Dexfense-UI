import Phaser from "phaser";
import { PoolList } from "./scenes";
import { useGameStore } from "@/shared";

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
    { level: "easy", amount: 1, bg: 0xb3ffcc },
    { level: "normal", amount: 10, bg: 0xfff599 },
    { level: "hard", amount: 100, bg: 0xffb3b3 },
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

  const ground = this.physics.add.staticImage(450, 550, "ground").setDepth(1);
  const fortress = this.physics.add
    .staticImage(140, 356, "fortress")
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
  this: PoolList,
  message: string,
  displayDuration: number
) {
  this.swapMessage.setText(message).setVisible(true);

  this.notificationTimer?.remove();

  this.notificationTimer = this.time.delayedCall(displayDuration, () => {
    this.swapMessage.setVisible(false);
  });
}
