import { Scene } from "phaser";
import { EventBus } from "../event-bus";
export class Preloader extends Scene {
  constructor() {
    super({ key: "Preloader" });
  }

  preload() {
    if (!this.textures.exists("loading"))
      this.load.image("loading", "assets/loader.gif");
    if (!this.textures.exists("coin"))
      this.load.audio("coin", "sound/coin.mp3");
    if (!this.textures.exists("boss"))
      this.load.audio("boss", "sound/boss.mp3");
    if (!this.textures.exists("arrow"))
      this.load.audio("arrow", "sound/arrow.mp3");
    if (!this.textures.exists("gameBGM"))
      this.load.audio("gameBGM", "sound/gamebgm.mp3");
    if (!this.textures.exists("pick"))
      this.load.audio("pick", "sound/pick.mp3");

    if (!this.textures.exists("ground"))
      this.load.image("ground", "assets/platform.png");
    if (!this.textures.exists("fortress"))
      this.load.image("fortress", "assets/fortress.png");
    if (!this.textures.exists("flag"))
      this.load.image("flag", "assets/flag.png");
    if (!this.textures.exists("token1"))
      this.load.image("token1", "assets/token1.png");
    if (!this.textures.exists("token2"))
      this.load.image("token2", "assets/token2.png");
    if (!this.textures.exists("arrow"))
      this.load.image("arrow", "assets/arrow.png");
    if (!this.textures.exists("fire"))
      this.load.image("fire", "assets/fire.png");
    if (!this.textures.exists("poison"))
      this.load.image("poison", "assets/poison.png");
    if (!this.textures.exists("ice")) this.load.image("ice", "assets/ice.png");
    if (!this.textures.exists("physbreak"))
      this.load.image("physbreak", "assets/physbreak.png");
    if (!this.textures.exists("lightning"))
      this.load.image("lightning", "assets/lightning.png");
    if (!this.textures.exists("iceZone"))
      this.load.image("iceZone", "assets/iceZone.png");

    if (!this.textures.exists("fast"))
      this.load.image("fast", "assets/fast.png");
    if (!this.textures.exists("play"))
      this.load.image("play", "assets/play.png");
    if (!this.textures.exists("token2dealer"))
      this.load.spritesheet("token2dealer", "assets/dealer-sprite.png", {
        frameWidth: 64,
        frameHeight: 90,
      });
    if (!this.textures.exists("token2tank"))
      this.load.spritesheet("token2tank", "assets/tank-sprite.png", {
        frameWidth: 80,
        frameHeight: 90,
      });
    if (!this.textures.exists("token2healer"))
      this.load.spritesheet("token2healer", "assets/healer-sprite.png", {
        frameWidth: 42,
        frameHeight: 47,
      });
    if (!this.textures.exists("token2basic"))
      this.load.spritesheet("token2basic", "assets/basic-sprite.png", {
        frameWidth: 36,
        frameHeight: 80,
      });
    if (!this.textures.exists("token2boss"))
      this.load.spritesheet("token2boss", "assets/boss-sprite.png", {
        frameWidth: 152,
        frameHeight: 226,
      });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("❌ Failed to load:", file.key);
    });

    this.load.on("complete", () => {
      EventBus.emit("assets-loaded");
      this.scene.start("MainMenu");
    });
  }
}
