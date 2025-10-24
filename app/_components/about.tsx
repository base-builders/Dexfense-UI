"use client";
import { DAF } from "@/features";
import Image from "next/image";
export const About = () => {
  return (
    <div className="w-[906px] mt-5 flex flex-col font-quantico gap-4 justify-between px-4 text-white text-xl">
      <section className="bg-black/60 rounded-xl p-6 mb-2 shadow">
        <p>
          <span className="text-3xl font-bold text-green-300">D</span>
          exfense is not a typical reward-based GameFi; it allows players to
          experience arbitrage intuitively and internalize the core DeFi
          principle of <span className="text-green-400">risk is reward</span>.
          Based on gameplay outcomes, users encounter differentiated swap
          conditions, thereby naturally learning the mechanics of DeFi.
        </p>
      </section>

      <div className="flex flex-col gap-10">
        <article className="bg-white/10 rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-green-200 mb-2 flex items-center gap-2">
            🎮 Game Mechanics
          </h2>
          <div className="flex flex-col gap-2">
            <div>
              <span className="badge badge-purple mr-2">Genre</span>
              Roguelike wave defense
            </div>
            <div>
              <span className="badge badge-pink mr-2">Entry</span>
              Token deposit (LP or meme tokens) to begin gameplay
            </div>
            <div>
              <span className="badge badge-green mr-2">Goal</span>
              Survive and eliminate as many enemies as possible to maximize swap
              reward multipliers
            </div>
          </div>
        </article>
        <article className="bg-white/10 rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-green-200 mb-2 flex items-center gap-2">
            🌊 Wave & Upgrade System
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>25 waves with progressively increasing difficulty</li>
            <li>Every 5 waves, choose 1 of 3 random power-ups</li>
            <li>
              Power-ups impact attributes like element type, area, attack speed,
              critical hit rate, and duration
            </li>
            <li>Strategic selections stack to determine final performance</li>
          </ul>
        </article>
        <article className="bg-white/10 rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-green-200 mb-2 flex items-center gap-2">
            🏰 Main System
          </h2>
          <div className="flex flex-wrap gap-6">
            {/* Castle */}
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/fortress.png"
                alt="fortress"
                width={100}
                height={160}
              />
              <div>
                <h3 className="text-xl font-semibold">Castle</h3>
                <p>
                  The structure the player must defend. Starts with 100HP and
                  takes damage from enemies. Game over when HP reaches 0.
                </p>
              </div>
            </div>
            {/* Arrow Launcher */}
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/token1.png"
                alt="token1"
                width={60}
                height={60}
              />
              <div>
                <h3 className="text-xl font-semibold">
                  ETH - Player Arrow Launcher
                </h3>
                <p>Automatically fires arrows from the top of the castle.</p>
              </div>
            </div>
            {/* Enemy Units */}
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/token2.png"
                alt="token2"
                width={60}
                height={60}
              />
              <div>
                <h3 className="text-xl font-semibold">Tether - Enemy Units</h3>
              </div>
            </div>
          </div>
        </article>

        <article className="bg-white/10 rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-green-200 mb-2 flex items-center gap-2">
            👾 Enemy Types
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* 각 적 유닛 카드 */}
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/basic-still.png"
                alt="basic"
                width={36}
                height={80}
              />
              <div>
                <h3 className="text-xl">Infantry unit</h3>
                <p>Standard enemy unit.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/dealer-still.png"
                alt="dealer"
                width={56}
                height={90}
              />
              <div>
                <h3 className="text-xl">Cavalry</h3>
                <p>Fast and high-damage unit.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/healer-still.png"
                alt="healer"
                width={42}
                height={47}
              />
              <div>
                <h3 className="text-xl">Fairy</h3>
                <p>Restores 1% HP to nearby allies every 0.5 seconds.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/tanker-still.png"
                alt="tanker"
                width={80}
                height={92}
              />
              <div>
                <h3 className="text-xl">Shieldbearer</h3>
                <p>High HP, slow-moving unit.</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/boss-still.png"
                alt="boss"
                width={133}
                height={198}
              />
              <div>
                <h3 className="text-xl">War Elephant Champion</h3>
                <p>Large unit with powerful special effects.</p>
              </div>
            </div>
          </div>
        </article>
        <article className="bg-white/10 rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-green-200 mb-2 flex items-center gap-2">
            🔥❄️☠️⚡ Elemental Combinations
          </h2>
          <p>Players can infuse arrows with elemental combinations.</p>
          <pre className="bg-black/70 rounded p-3 text-base font-mono text-green-200 overflow-x-auto">
            Total Damage = (Base + Flat) × (1 + Percentage Increase) × (Crit ?
            2.5 : 1) × Amplifier
          </pre>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Damage is calculated separately for each element, then summed:
              Physical + Poison + Fire + Ice + Lightning
            </li>
            <li>Poison damage does not apply critical hits.</li>
          </ul>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex gap-3 items-center">
              <Image src="/assets/fire.png" alt="fire" width={55} height={55} />
              <span>Fire</span>
            </div>
            <div className="flex gap-3 items-center">
              <Image src="/assets/ice.png" alt="ice" width={50} height={50} />
              <span>Ice</span>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/poison.png"
                alt="poison"
                width={50}
                height={50}
              />
              <span>Poison</span>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/lightning.png"
                alt="lightning"
                width={36}
                height={54}
              />
              <span>Lightning</span>
            </div>
            <div className="flex gap-3 items-center">
              <Image
                src="/assets/physbreak.png"
                alt="physbreak"
                width={58}
                height={58}
              />
              <span>Physical Attack</span>
            </div>
          </div>
        </article>
        <article className="bg-white/10 rounded-xl p-6 shadow flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-green-200 mb-2 flex items-center gap-2">
            💰 Reward Formula
          </h2>
          <pre className="bg-black/70 rounded p-3 text-base font-mono text-green-200">
            Reward = Pool exchange rate × (Kills / Benchmark value)
          </pre>
          <ul className="list-disc list-inside space-y-1">
            <li>Benchmarks vary by difficulty and wave count</li>
          </ul>
        </article>
        <DAF />
        <article>
          See{" "}
          <a
            href="https://dexfense-protocol.gitbook.io/dexfense/0.fensepedia"
            target="_blank"
            className="underline"
          >
            Fensepedia
          </a>{" "}
          for more details.
        </article>
      </div>
    </div>
  );
};
