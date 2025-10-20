import { Scene } from "phaser";
import { EventBus } from "../event-bus";
export class Preloader extends Scene {
  constructor() {
    super({ key: "Preloader" });
  }

  preload() {
    this.load.image("loading", "assets/loader.gif");

    this.load.audio("coin", "sound/coin.mp3");
    this.load.audio("boss", "sound/boss.mp3");
    this.load.audio("arrow", "sound/arrow.mp3");
    this.load.audio("gameBGM", "sound/gamebgm.mp3");
    this.load.audio("pick", "sound/pick.mp3");

    this.load.image("ground", "assets/platform.png");
    this.load.image("fortress", "assets/fortress.png");
    this.load.image("flag", "assets/flag.png");
    this.load.image("token1", "assets/token1.png");
    this.load.image("token2", "assets/token2.png");
    this.load.image("arrow", "assets/arrow.png");
    this.load.image("fire", "assets/fire.png");
    this.load.image("poison", "assets/poison.png");
    this.load.image("ice", "assets/ice.png");
    this.load.image("physbreak", "assets/physbreak.png");
    this.load.image("lightning", "assets/lightning.png");
    this.load.image("iceZone", "assets/iceZone.png");

    this.load.image("fast", "assets/fast.png");
    this.load.image("play", "assets/play.png");
    this.load.spritesheet("token2dealer", "assets/dealer-sprite.png", {
      frameWidth: 64,
      frameHeight: 90,
    });
    this.load.spritesheet("token2tank", "assets/tank-sprite.png", {
      frameWidth: 80,
      frameHeight: 90,
    });
    this.load.spritesheet("token2healer", "assets/healer-sprite.png", {
      frameWidth: 42,
      frameHeight: 47,
    });
    this.load.spritesheet("token2basic", "assets/basic-sprite.png", {
      frameWidth: 36,
      frameHeight: 80,
    });
    this.load.spritesheet("token2boss", "assets/boss-sprite.png", {
      frameWidth: 152,
      frameHeight: 226,
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("❌ Failed to load:", file.key);
    });

    this.load.on("complete", () => {
      EventBus.emit("assets-loaded");
    });
  }
}
