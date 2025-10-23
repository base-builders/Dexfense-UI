import { useRef, useLayoutEffect, useEffect, useState } from "react";
import {
  Preloader,
  MainMenu,
  TypedRegistry,
  PoolList,
} from "@/features/game-core";
import Phaser, { AUTO, Game } from "phaser";
import { EventBus } from "@/features/game-core/lib/event-bus";
import Image from "next/image";
import { LoginModal } from "@/widgets";
import { useModalStore } from "@/shared";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 900,
  height: 580,
  backgroundColor: "#028af8",
  scene: [Preloader, MainMenu, PoolList],
  physics: {
    default: "arcade",
    arcade: {
      debug: false, // ✅ 물리 디버그 모드
    },
  },
  fps: {
    target: 60, // ✅ 프레임 제한 추가
    forceSetTimeOut: true, // ✅ 안정적 프레임 유지용 설정
  },
};

const bootGame = (parent: HTMLElement) => {
  const gameConfig: Phaser.Types.Core.GameConfig = {
    ...config,
    parent,
    callbacks: {
      preBoot: (game) => {
        window.phaserGame = game;
      },
    },
  };
  const game = new Phaser.Game(gameConfig);
  (game as any).typedRegistry = new TypedRegistry(game.registry);
  return game;
};

export const PhaserGame = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const [isPhaserLoading, setIsPhaserLoading] = useState(true);
  const { showLoginModal, setShowLoginModal } = useModalStore();
  useLayoutEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const container = containerRef.current;

    gameRef.current = bootGame(container);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    setIsPhaserLoading(true);
    EventBus.on("assets-loaded", () => {
      console.log("Assets have been loaded!");
      setIsPhaserLoading(false);
    });

    return () => {
      EventBus.removeAllListeners("assets-loaded");
      setIsPhaserLoading(false);
    };
  }, []);

  return (
    <>
      {isPhaserLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
          <Image
            src="/assets/loader.gif"
            alt="Loading..."
            width={100}
            height={100}
          />
        </div>
      )}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
      <div
        ref={containerRef}
        id="game-container"
        className="w-[900px] h-[580px] rounded-sm border-3 border-gray-200 overflow-hidden"
      />
    </>
  );
};
