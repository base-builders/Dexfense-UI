## Getting Started

First, run the development server:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## FSD Architecture

src/
├─ app/
│ ├─ (main)/ # 주요 라우트 (Landing, Game, DAO 등)
│ │ ├─ page.tsx
│ │ └─ layout.tsx
│ ├─ api/ # Next.js Route Handlers (server actions)
│ │ ├─ reward/
│ │ │ ├─ route.ts # /api/reward → 리워드 검증/정산
│ │ └─ user/
│ │ └─ route.ts # /api/user → 지갑 연동, 프로필 등
│ ├─ layout.tsx
│ └─ globals.css
│
├─ shared/ # 전역 재사용 가능 요소 (가장 하위 레벨)
│ ├─ ui/ # 버튼, 모달, 카드 등 shadcn 컴포넌트
│ ├─ config/ # wagmi, RainbowKit 설정 등
│ ├─ lib/ # viem client, utils, constants
│ ├─ types/ # 전역 타입 선언
│ └─ styles/ # tailwind presets, themes
│
├─ entities/ # 핵심 도메인 단위 (user, reward, game 등)
│ ├─ user/
│ │ ├─ model/ # zustand store (useAuthStore 등)
│ │ ├─ lib/ # user 관련 utils, formatters
│ │ ├─ api/ # user API (login, profile 등)
│ │ └─ ui/ # avatar, wallet connect button 등
│ ├─ reward/
│ │ ├─ model/ # reward 상태, refresh 로직
│ │ ├─ lib/ # 보상 계산 함수 (risk curve 등)
│ │ ├─ api/ # /api/reward 연결
│ │ └─ ui/ # reward gauge, toast 등
│ └─ game/
