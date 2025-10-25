import {
  useAuthStore,
  useGameResultStore,
  useNotificationStore,
} from "@/shared";
import { createPlatforms } from "../scene-helper";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

export class GameResult extends Phaser.Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  title!: Phaser.GameObjects.Text;

  difficulty: "easy" | "normal" | "hard" = "easy";
  snappedRatio!: number;
  waveReached!: number;
  totalKilled: number = 500;
  baseRatio!: number;
  killedStandard = 400;
  entryFee = 0.0001;

  swapMessage!: Phaser.GameObjects.Text;
  notificationTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("GameResult");
  }

  init(data: {
    waveCount: number;
    killCount: number;
    difficulty: "easy" | "normal" | "hard";
  }) {
    this.waveReached = data.waveCount;
    this.totalKilled = data.killCount;
    this.difficulty = data.difficulty;
    this.entryFee = data.difficulty === "easy" ? 0.0001 : data.difficulty === "normal" ? 0.001 : 0.01;
  }

  async create() {
    createPlatforms.call(this);

    const { width, height } = this.scale;

    this.swapMessage = this.add
      .text(450, 10, "", {
        fontSize: "16px",
        color: "#00ff00",
        fontFamily: '"Press Start 2P"',
        backgroundColor: "#22222288",
        padding: { left: 10, right: 10, top: 4, bottom: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setVisible(false);

    try {
      const res = await fetch(`${SERVER_URL}/api/pools/expectRatio`);
      const data = await res.json();

      this.baseRatio = data.token2Amount;
      this.snappedRatio = Number(data.token2Amount);

      useGameResultStore.getState().setIsPending(true);

      const token = useAuthStore.getState().token;
      const resultRes = await fetch(
        `${SERVER_URL}/api/games/${this.difficulty}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            difficulty: this.difficulty,
            totalMonstersKilled: this.totalKilled,
            lastWave: this.waveReached,
          }),
        }
      );

      if (!resultRes.ok) {
        const errorData = await resultRes.json();
        console.error("❌ Failed to submit game result:", errorData);
      } else {
        useGameResultStore.getState().setGameResultSubmitted(true);
      }
    } catch (err) {
      console.error("❌ Failed to fetch pool ratio:", err);
      this.baseRatio = -1;
      this.snappedRatio = -1;
    }

    this.title = this.add
      .text(width / 2, 80, "Game Result", {
        fontFamily: '"Press Start 2P"',
        fontSize: 18,
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
    graphics.fillRoundedRect(50, 160, width - 100, height - 180, 20);
    graphics.strokeRoundedRect(50, 160, width - 100, height - 180, 20);
    graphics.setDepth(99);

    const labelStyle = {
      fontSize: "18px",
      fontFamily: '"Press Start 2P"',
      color: "#000000",
    };
    const valueStyle = { ...labelStyle, align: "right" as const };

    const startY = 180;
    const lineGap = 34;

    // Label + Value
    this.add.text(80, startY, "Difficulty", labelStyle).setDepth(100);
    this.add
      .text(width - 80, startY, this.difficulty, valueStyle)
      .setOrigin(1, 0)
      .setDepth(100);

    this.add
      .text(80, startY + lineGap, "Snapped Ratio", labelStyle)
      .setDepth(100);
    this.add
      .text(width - 80, startY + lineGap, `1:${this.snappedRatio}`, valueStyle)
      .setOrigin(1, 0)
      .setDepth(100);

    this.add
      .text(80, startY + lineGap * 2, "Wave Reached", labelStyle)
      .setDepth(100);
    this.add
      .text(width - 80, startY + lineGap * 2, `${this.waveReached}`, valueStyle)
      .setOrigin(1, 0)
      .setDepth(100);

    this.add
      .text(80, startY + lineGap * 3, "Total Killed", labelStyle)
      .setDepth(100);
    this.add
      .text(width - 80, startY + lineGap * 3, `${this.totalKilled}`, valueStyle)
      .setOrigin(1, 0)
      .setDepth(100);

    // Formula
    const base = this.baseRatio * this.entryFee;
    const formula = `${base} x ( ${this.totalKilled} / ${
      this.killedStandard
    } ) = ${(base * (this.totalKilled / this.killedStandard)).toFixed(2)}`;
    this.add
      .text(width / 2, startY + lineGap * 5, formula, {
        fontSize: "20px",
        fontFamily: "Courier",
        color: "#000000",
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Reward Ratio
    const rewardRatio = (this.totalKilled / this.killedStandard) * 100;
    this.add
      .text(
        width / 2,
        startY + lineGap * 6,
        `Reward Ratio: ${rewardRatio.toFixed(1)}%`,
        {
          fontSize: "16px",
          fontFamily: "Quantico",
          color: "#000000",
        }
      )
      .setOrigin(0.5)
      .setDepth(100);

    // Divider
    this.add
      .rectangle(width / 2, startY + lineGap * 7, width - 180, 2, 0x000000)
      .setDepth(100);

    // Total Amount
    this.add
      .text(70, startY + lineGap * 8, "Total Amount", {
        fontSize: "18px",
        fontFamily: '"Press Start 2P"',
        color: "#000000",
      })
      .setDepth(100);
    this.add
      .text(
        width - 80,
        startY + lineGap * 8,
        `${(base * (this.totalKilled / this.killedStandard)).toFixed(2)}`,
        {
          fontSize: "18px",
          fontFamily: '"Press Start 2P"',
          color: "#000000",
        }
      )
      .setOrigin(1, 0)
      .setDepth(100);

    // Next Button
    const nextBtn = this.add
      .text(width - 60, height - 30, "Try Again? >", {
        fontSize: "18px",
        fontFamily: '"Press Start 2P"',
        color: "0xdaff37",
      })
      .setOrigin(1, 1)
      .setDepth(101)
      .setInteractive();

    nextBtn.on("pointerdown", () => {
      this.scene.start("PoolList");
    });
  }

  update() {
    const store = useNotificationStore.getState();
    const queueLength = store.queue.length;

    const noNotificationActive =
      !this.swapMessage.visible &&
      (!this.notificationTimer || this.notificationTimer.getProgress() === 1);

    if (noNotificationActive && queueLength) {
      const next = store.shift();
      if (next) this.showNotification(next, queueLength >= 3 ? 1000 : 4000);
    }
  }

  showNotification(message: string, displayDuration: number) {
    this.swapMessage.setText(message).setVisible(true);

    this.notificationTimer?.remove();

    this.notificationTimer = this.time.delayedCall(displayDuration, () => {
      this.swapMessage.setVisible(false);
    });
  }
}
