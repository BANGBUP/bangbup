# 방법닷컴 (bangbup.com)

> 모든 문제를 해결하는 방법을 공유하고 실천하는 SNS형 노하우 플랫폼

설계 문서: [docs/PROJECT_DESIGN.md](./docs/PROJECT_DESIGN.md)

## 기술 스택
- **Next.js 15** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Prisma** + **Supabase** (Postgres / Auth / Storage)
- **Zustand** + **TanStack Query**
- **Zod** + **React Hook Form**

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (Supabase 프로젝트 생성 후)
cp .env.example .env.local
# .env.local 에 DATABASE_URL, SUPABASE 키 입력

# Prisma 스키마 적용
npx prisma generate
npx prisma db push

# 개발 서버
npm run dev
```

## 디렉토리 구조
```
src/
├── app/             # Next.js App Router
├── components/      # UI 컴포넌트
└── lib/
    ├── prisma.ts    # Prisma 클라이언트
    ├── supabase/    # Supabase 클라이언트 (client/server)
    └── utils.ts     # 공용 유틸 + 방법 점수 계산
prisma/
└── schema.prisma    # DB 스키마
docs/
└── PROJECT_DESIGN.md
```

## 배포
- **호스팅**: Vercel
- **DB**: Supabase
- **스토리지/CDN**: Supabase Storage + Cloudflare (Phase 2)

## MVP 체크리스트 (Phase 1)
- [x] 프로젝트 세팅
- [x] Prisma 스키마
- [ ] Supabase Auth 연결
- [ ] 방법 CRUD
- [ ] 피드 (최신순)
- [ ] 문제 해시태그
- [ ] 인터랙션 (저장/써봄/후기)
- [ ] 검색
- [ ] 방법 요청
- [ ] 프로필
