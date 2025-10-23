import { useAuthStore, useNotificationStore } from "@/shared";
import { GameObjects, Scene } from "phaser";
import {
  createPlatforms,
  createPoolCard,
  createDifficultyButtons,
  showNotification,
} from "../scene-helper";
import { refreshExchangeRate, refreshUserBalance } from "../services";

export class PoolList extends Scene {
  token1 = "ETH";
  token2 = "USDT";
  activeButtons: GameObjects.Container | null = null;
  notificationTimer?: Phaser.Time.TimerEvent;
  swapMessage!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "PoolList" });
  }

  preload() {}

  async create() {
    this.swapMessage = this.add
      .text(512, 10, "", {
        fontSize: "16px",
        color: "#00ff00",
        fontFamily: '"Press Start 2P"',
        backgroundColor: "#22222288",
        padding: { left: 10, right: 10, top: 4, bottom: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setVisible(false);

    await refreshExchangeRate();
    await refreshUserBalance();

    const { width, height } = this.scale;

    console.log("Scene: Pool List");
    // Create the pool list UI
    const userToken = useAuthStore.getState().token;

    createPlatforms.call(this);

    const card = createPoolCard.call(this);
    card.setInteractive().on("pointerdown", () => {
      if (this.activeButtons) {
        this.activeButtons.destroy();
      }

      // 카드 아래 위치에 버튼 배치
      const baseY = card.y + card.height / 2 + 100; // 100 = 여백
      const buttons = createDifficultyButtons.call(this, baseY);

      // 버튼을 씬에 추가 및 추적
      this.add.existing(buttons);
      this.activeButtons = buttons;
    });

    this.add
      .text(width / 2, 100, "POOL LIST", {
        fontFamily: '"Press Start 2P"',
        fontSize: 20,
        color: "#F1FCD1",
        stroke: "#63A363",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    const graphics = this.add.graphics();
    graphics.fillStyle(0xf1fcd1, 0.6);
    graphics.lineStyle(4, 0x63a363, 1);
    graphics.fillRoundedRect(72, 190, width - 144, height - 220, 20); // 좌우 마진 적용
    graphics.strokeRoundedRect(72, 190, width - 144, height - 220, 20);
    graphics.setDepth(99);
  }

  update() {
    const store = useNotificationStore.getState();
    const queueLength = store.queue.length;

    const noNotificationActive =
      !this.swapMessage.visible &&
      (!this.notificationTimer || this.notificationTimer.getProgress() === 1);

    if (noNotificationActive && queueLength) {
      const next = store.shift();
      if (next)
        showNotification.call(this, next, queueLength >= 3 ? 1000 : 4000);
    }
  }
}
