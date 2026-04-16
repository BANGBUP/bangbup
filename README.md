# 방법닷컴 (bangbup.com)

> 모든 문제를 해결하는 방법을 공유하고 실천하는 SNS형 노하우 플랫폼

- 프로덕션: https://bangbup.com · https://bangbup.vercel.app
- 설계 문서: [docs/PROJECT_DESIGN.md](./docs/PROJECT_DESIGN.md)

## 기술 스택
- **Next.js 16** (App Router, Turbopack, React 19) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** + **Base UI**
- **Prisma** + **Supabase** (Postgres / Auth / Storage)
- **TanStack Query** · **React Hook Form** + **Zod**
- **TipTap** (마크다운 에디터)

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
cp .env.example .env.local
# DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
# SUPABASE_SECRET_KEY 등 입력

# Prisma 스키마 적용
npx prisma generate
npx prisma db push

# (선택) 시드 데이터 삽입
npx tsx prisma/seed.ts

# 개발 서버
npm run dev
```

## 디렉토리 구조
```
src/
├── app/                  # Next.js App Router
│   ├── api/              # Route Handlers
│   │   ├── methods/      # CRUD, interactions, outdated
│   │   ├── contexts/     # 컨텍스트 태그
│   │   ├── requests/     # 방법 요청
│   │   ├── search/       # 검색
│   │   ├── upload/       # 이미지 업로드
│   │   └── cron/         # Supabase keep-alive
│   ├── m/[id]/           # 방법 상세 / edit / remix
│   ├── feed, search, new, requests, login, [handle]
│   └── auth/             # OAuth 콜백 / 로그아웃
├── components/           # UI (method-card, rich-editor, image-dropzone …)
└── lib/
    ├── prisma.ts · supabase/   # 클라이언트
    ├── methods.ts · interactions.ts · auth.ts
    ├── validators.ts          # Zod 스키마
    └── utils.ts               # 방법 점수 계산 등
prisma/
├── schema.prisma
└── seed.ts, seed-batch2.ts
docs/
└── PROJECT_DESIGN.md
vercel.json                # Supabase keep-alive cron (1일 1회, Hobby 플랜)
```

## 배포
- **호스팅**: Vercel (GitHub 연동 auto-deploy)
- **DB/Auth/Storage**: Supabase
- **Cron**: Vercel Cron (Hobby 플랜 제한으로 1일 1회, `0 0 * * *`)
- **도메인**: `bangbup.com` (custom), `bangbup.vercel.app` (기본)

## MVP 체크리스트 (Phase 1)
- [x] 프로젝트 세팅
- [x] Prisma 스키마
- [x] Supabase Auth (Google, Kakao 소셜 로그인 — Kakao는 이메일 없이)
- [x] 방법 CRUD (작성/수정/삭제)
- [x] 피드 (최신순)
- [x] 문제 해시태그 + 컨텍스트 태그
- [x] 인터랙션 (저장 / 써봄 / 성공·실패 / 유용함 / 구식)
- [x] 검색
- [x] 방법 요청
- [x] 프로필 (`/[handle]`)
- [x] Remix (포크)
- [x] 이미지 업로드 (드래그앤드롭, Supabase Storage)
- [x] 마크다운 에디터 (TipTap)
- [x] 관련 방법 추천 (상세 하단)

## 다음 단계 (Phase 2 후보)
- 영상 업로드
- 자연어 AI 검색
- 팁/수익화
- 챌린지/스트릭
- 푸시 알림
