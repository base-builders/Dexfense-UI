import { GameClient } from "./_components/game-client";

export default function Home() {
  return (
    <main>
      <div className="mt-20 mx-auto h-screen flex flex-col items-center">
        <GameClient />
      </div>
    </main>
  );
}
