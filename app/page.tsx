import { About } from "./_components/about";
import { GameClient } from "./_components/game-client";
export default function Home() {
  return (
    <main>
      <div className="mt-20 mx-auto h-screen flex flex-col items-center">
        <div className="absolute z-0">
          <GameClient />
        </div>
        <div className="relative mt-[700px] flex flex-col items-center">
          <About />
        </div>
      </div>
    </main>
  );
}
