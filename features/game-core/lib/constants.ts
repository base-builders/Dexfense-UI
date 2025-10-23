import { EffectColor } from "./types";

export const difficultyConfig = {
  easy: {
    maxSpawn: 20,
    globalSpeed: 30,
    resist: 1.0,
    hpMultiplier: 1,
    entryFee: 1,
  },
  normal: {
    maxSpawn: 25,
    globalSpeed: 35,
    resist: 1.1,
    hpMultiplier: 1.5,
    entryFee: 10,
  },
  hard: {
    maxSpawn: 30,
    globalSpeed: 40,
    resist: 1.2,
    hpMultiplier: 2,
    entryFee: 100,
  },
};

export const sprites = [
  { key: "token2dealer", frame: { start: 0, end: 3 } },
  { key: "token2healer", frame: { start: 0, end: 2 } },
  { key: "token2tank", frame: { start: 0, end: 3 } },
  { key: "token2basic", frame: { start: 0, end: 3 } },
];

export const effectColor: EffectColor = {
  fire: 0xff5500,
  poison: 0x44ff44,
  lightning: 0xdaff37,
  ice: 0x99ffff,
  phys: 0xaaaaaa,
};

export const hpBarColor = 0xff0000;
