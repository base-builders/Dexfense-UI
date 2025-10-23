export type Difficulty = "easy" | "normal" | "hard";

export type UnitType = "basic" | "dealer" | "healer" | "tank" | "boss";
export type User = {
  address: string;
};

export type UnitSkill = {
  type: "heal" | "resist" | "speed";
  cooldown: number;
  timer?: Phaser.Time.TimerEvent;
  execute: (caster: Phaser.Physics.Arcade.Sprite & Token2) => void;
};

export type Token2 = {
  unitType: UnitType;
  hp: number;
  speed: number;
  damage: number;
  statusEffects: { [key: string]: BaseStatusEffect };
  skills?: UnitSkill[];
  resistMap?: { [element: string]: number }; // 각 속성별 저항 수치
};

export type ArrowData = {
  damage: {
    [key: string]: {
      flat: number;
      percent: number;
    };
  };
  multiplier?: number;
  critChance?: number;
  attackSpeed?: number;
};

export type EffectType = "poison" | "lightning" | "phys" | "fire" | "ice";

export type EffectColor = {
  [key in EffectType]: number;
};

export type BaseStatusEffect = {
  icon: Phaser.GameObjects.Image;
  type: "stackable" | "poison" | "lightning";
};

export type LightningStatusEffect = BaseStatusEffect & {
  type: "lightning";
  timer: Phaser.Time.TimerEvent | null;
};

export type StackableEffect = BaseStatusEffect & {
  type: "stackable";
  stacks: number;
  timers: Phaser.Time.TimerEvent[];
  stackText?: Phaser.GameObjects.Text;
};

export type PoisonStatusEffect = BaseStatusEffect & {
  type: "poison";
  subs: { timer: Phaser.Time.TimerEvent; tickCount: number }[];
  stackText?: Phaser.GameObjects.Text;
};
