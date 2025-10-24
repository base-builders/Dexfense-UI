## Getting Started

First, run the development server on develop branch:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# 🧱 Dexfense Protocol

**A Web3 Tower Defense Game Built on the Base Network**

DexFense is a new type of Web3 tower defense game where every in-game action is linked to an on-chain transaction.  
Players can exchange in-game assets through a real-time swap mechanism on the **Base Network**, where each cleared round increases both **risk and reward**.

---

## 🚀 Tech Stack

| Category         | Stack                                        |
| ---------------- | -------------------------------------------- |
| Framework        | **Next.js 15**, **TypeScript**               |
| Game Engine      | **Phaser 5**                                 |
| State Management | **Zustand**                                  |
| Web3 Integration | **RainbowKit + Wagmi (Base / Base Sepolia)** |

---

## 🎮 Features

- ⚔️ **Real-Time Tower Defense Gameplay** — built with Phaser 5 physics and rendering
- 💰 **On-Chain Swap Integration** — in-game swaps tied directly to Base Network transactions
- 🧠 **Dynamic Difficulty Scaling** — choose difficulty and risk levels per round
- 🪙 **Zustand State Store** — unified management for Auth, Balances, and Game data
- 🧩 **Modular Scene System** — reusable helper functions for scene transitions and UI layers

---

## 🧭 Project Structure

- Follows FSD Architecture

├── app/ # Next.js 15 app router
├── features/game-core # Phaser scenes and helpers
├── shared/ # Zustand stores, API, and config
├── widgets/phaser-game # Phaser container component
└── public/assets # Sprites, maps, and sounds
