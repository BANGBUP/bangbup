# 방법닷컴 (bangbup.com) 프로젝트 설계 문서

> "조회수가 아닌, 변화의 수로 보상합니다"
> 모든 문제를 해결하는 방법을 공유하고 실천하는 SNS형 노하우 플랫폼

---

## 1. 프로젝트 개요

### 1.1 비전
- **도메인**: bangbup.com (방법)
- **한 줄 정의**: 문제 해결 "방법"을 SNS 피드로 소비하고, 실천하고, 보상받는 플랫폼
- **차별점**:
  - 기존 Q&A(네이버 지식iN, Quora) → 텍스트 위주, 1회성 소비
  - 기존 SNS(인스타/틱톡) → 보여주기 중심, 실효성 검증 불가
  - **방법닷컴** → 짧은 카드/영상 + 실행 인증 + 성공률 기반 신뢰도

### 1.2 핵심 가치 제안
| 사용자 유형 | 얻는 가치 |
|-------------|-----------|
| 탐색자(Seeker) | 내 문제에 맞는 검증된 방법을 빠르게 발견 |
| 실천자(Doer) | 실행 이력이 프로필에 쌓여 성장 기록됨 |
| 제작자(Creator) | 실제 도움 준 만큼 리워드 획득 |

### 1.3 핵심 용어
- **방법(Method)**: 문제 해결의 한 단위. 15초 안에 소비 가능한 카드/영상.
- **문제(Problem)**: 방법이 해결하는 대상. 해시태그 형태.
- **써봄(Tried)**: 방법을 실제 실행했다는 기록.
- **후기(Result)**: 성공/실패/변형 3택 + 한줄평.
- **Remix**: 기존 방법을 내 상황에 맞게 변형해서 재업로드.
- **방법사(Method Master)**: 일정 기준을 넘긴 검증된 크리에이터.
- **방법 점수(Method Score)**: 조회/저장/써봄/성공/Remix 가중합 지표.

---

## 2. 핵심 기능 설계

### 2.1 콘텐츠 구조

#### 방법 카드 (Method Card)
```
{
  id: string
  title: string (최대 40자)
  problemTags: string[] (해시태그 형태 문제 연결)
  format: 'card' | 'video' | 'image'
  content: {
    situation: string  // IF: 상황
    action: string     // THEN: 행동
    result: string     // SO: 기대 결과
    media?: url        // 영상/이미지
  }
  meta: {
    difficulty: 1-5
    cost: 'free' | 'low' | 'mid' | 'high'
    duration: string   // "5분" "21일"
  }
  stats: {
    views, saves, tried, success, fail, remixes
  }
  author: userId
  parentMethodId?: string  // Remix 원본
  createdAt, updatedAt
}
```

#### 문제 (Problem)
```
{
  id: string
  title: string
  category: string
  methodCount: number
  requestCount: number
  followers: number
}
```

#### 요청 (Request)
```
{
  id: string
  requesterId: userId
  situation, problem, tried, constraints, desired: string
  bounty: number       // 현상금 (옵션)
  upvotes: number
  status: 'open' | 'answered' | 'resolved'
  answerMethodIds: string[]
}
```

### 2.2 주요 화면 및 플로우

#### A. 피드 (홈)
- **For You**: AI 추천 방법 무한 스크롤 (세로 스와이프)
- **팔로잉**: 내가 팔로우한 방법사의 최신 방법
- **문제별**: 해시태그 탭으로 특정 문제 주제만

#### B. 검색
- 자연어 문제 입력 → AI 파싱 → 매칭
- 필터: 난이도/비용/시간/내 조건
- 결과 없을 시 → **"방법 요청하기"** CTA

#### C. 방법 요청
- 템플릿 기반 입력 (상황/문제/시도/제약/희망)
- 현상금 설정 (옵션)
- 공개 후 SOS 카드로 피드 노출

#### D. 방법 업로드
- 15초 제한 영상 또는 IF-THEN-SO 카드 작성
- 관련 문제 해시태그 연결 (자동 제안)
- 원본 방법 Remix인 경우 링크 자동 연결

#### E. 프로필
- 내가 만든 방법 / 내가 실천한 방법(실행 이력) / 저장한 방법
- 방법사 등급, 배지, 누적 임팩트(써봄·성공 통계)

#### F. 크리에이터 대시보드
- 방법 점수 추이
- 수익 현황 (구독자 풀 분배, 팁, 프리미엄 판매)
- "도움 기회" 피드: 답변 없는 요청 목록

### 2.3 SNS 인터랙션
| 액션 | 버튼 | 의미 |
|------|------|------|
| 탐색 | 스와이프 | 피드 넘김 |
| 관심 | 🔖 저장 | 서랍에 보관 + 리마인더 |
| 실행 | ✅ 써봄 | 실제 시도 선언 |
| 검증 | 🎉/😞/🔁 후기 | 성공/실패/변형 |
| 확산 | 🔁 Remix | 내 버전으로 재창작 |
| 지원 | 💰 팁 | 감사의 소액 후원 |

### 2.4 리워드 시스템

#### 방법 점수 가중치
| 지표 | 가중치 |
|------|--------|
| 조회 | 1x |
| 저장 | 5x |
| 써봄 | 20x |
| 성공 후기 | 50x |
| Remix됨 | 30x |

#### 크리에이터 등급
| 등급 | 점수 기준 | 주요 혜택 |
|------|-----------|-----------|
| Bronze | 1K+ | 배지, 수익 배분 시작 |
| Silver | 10K+ | 월정액 풀 분배, 인증마크 |
| Gold | 100K+ | 스폰서십, 프리미엄 판매 |
| Diamond | 1M+ | 앰배서더, 미디어 콜라보 |

#### 수익화 채널 (로드맵)
1. **Phase 1**: 팁 기능
2. **Phase 2**: 프리미엄 구독 + 구독자 풀 분배
3. **Phase 3**: 프리미엄 방법집 판매
4. **Phase 4**: 브랜드 스폰서십 마켓플레이스

---

## 3. 기술 아키텍처

### 3.1 기술 스택 (MVP 확정본)

#### 프론트엔드
- **프레임워크**: Next.js 16 (App Router, Turbopack) — React 19
- **언어**: TypeScript
- **스타일**: Tailwind CSS v4 + shadcn/ui + Base UI
- **상태관리**: TanStack Query (서버 상태 중심, Zustand 현재 미사용)
- **폼/검증**: React Hook Form + Zod
- **에디터**: TipTap (마크다운 양식 대신 WYSIWYG)
- **모바일**: PWA 우선, 추후 React Native 고려

#### 백엔드
- **런타임**: Next.js Route Handlers (단일 Next.js 앱)
- **DB**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **인증**: Supabase Auth (Google, Kakao 소셜 로그인)
- **파일 스토리지**: Supabase Storage (Phase 1) — 규모 커지면 Cloudflare R2 이관 검토
- **검색/추천**: 초기엔 Postgres full-text + 태그 매칭, 규모 커지면 pgvector/Meilisearch

#### AI/ML (Phase 2+)
- **자연어 문제 파싱**: Claude API (claude-haiku-4-5) — 비용 효율
- **추천 알고리즘**: 초기엔 태그/벡터 유사도, 후반에 협업 필터링
- **어뷰징 탐지**: 이상 패턴 감지 룰 + LLM 보조

#### 인프라
- **호스팅**: Vercel (Next.js 프론트 + API, Hobby 플랜)
- **DB/Auth/Storage**: Supabase (Free tier)
- **Cron**: Vercel Cron — Hobby 플랜 제한으로 **1일 1회** Supabase keep-alive (`0 0 * * *`)
- **도메인**: `bangbup.com` (custom), `bangbup.vercel.app`
- **CDN/미디어**: Supabase Storage 기본 CDN (Phase 2에 Cloudflare 도입 검토)
- **모니터링**: Phase 2에서 Sentry + Posthog 도입 예정

### 3.2 데이터 모델 (핵심 테이블)

```
users            (id, handle, name, avatar, tier, methodScore, ...)
methods          (id, authorId, title, situation, action, result, ...)
problems         (id, title, category, slug)
method_problems  (methodId, problemId)  -- N:M
interactions     (userId, methodId, type: view/save/tried/success/fail/remix, createdAt)
requests         (id, requesterId, problem, bounty, status, ...)
request_answers  (requestId, methodId, chosen: boolean)
follows          (followerId, followeeId)
tips             (fromUserId, toUserId, methodId, amount)
revenue_shares   (userId, period, amount, source)
```

### 3.3 보안/개인정보
- 요청 익명 옵션 (고백 모드)
- 개인정보 최소 수집 (이메일 + 핸들)
- 미디어 업로드 시 자동 메타데이터 제거
- CSP, CSRF, Rate Limiting 필수 적용
- 방법 내용 신고/검토 파이프라인

---

## 4. MVP 스코프 (Phase 1)

### 4.1 구현 완료 ✅
1. **사용자 가입/로그인** — Supabase Auth (Google, Kakao / Kakao는 이메일 수집 불가라 이메일 없이 진행)
2. **방법 업로드** — IF/THEN/SO 카드 + 이미지 드래그앤드롭 + TipTap 마크다운 에디터
3. **방법 수정/삭제** (본인 글)
4. **피드** — 최신순 + 태그 매칭
5. **문제 해시태그** + **컨텍스트 태그** (자기 상황 부가정보)
6. **인터랙션** — 저장 / 써봄 / 성공·실패 / 유용함 / 구식(Outdated)
   - 써봄–성공/실패 종속관계 처리 (써봄 철회 시 후기 동시 철회)
7. **구식(Outdated) 신호** — 이유 입력 구조화, 구식 카운트·내용 조회
8. **Remix (포크)** — 기존 방법에서 파생 + 원본 링크 자동 연결, 상세에서 포크 수 표시
9. **검색** (키워드 기반)
10. **방법 요청** (현상금 없이, 기본 템플릿)
11. **프로필** — `/[handle]`: 내 방법, 실행 이력, 저장
12. **방법 점수** 집계 및 표시
13. **관련 방법 추천** — 상세 하단 (최신/연관도)
14. **성능** — 로딩 스켈레톤, API cache 헤더, Supabase keep-alive cron (Hobby 일 1회)
15. **디자인** — 제목 강조 + IF/THEN/SO 섹션 색상 구분

### 4.2 제외 기능 (Phase 2+) ❌
- 영상 업로드/처리
- 자연어 AI 검색 (현재 키워드 검색만)
- Remix 계보 시각화 (포크 링크만 연결, 트리 UI는 미구현)
- 크리에이터 수익화 (팁, 구독 풀)
- 챌린지/스트릭
- 라이브 코칭
- 브랜드 스폰서십
- 청원 시스템
- 내 인터랙션 이력 조회/철회 전용 화면 (써봄 등 철회 자체는 가능)

### 4.3 성공 지표 (MVP KPI)
- **DAU/MAU 비율** ≥ 20%
- **가입 → 첫 방법 업로드** 전환 ≥ 10%
- **방법당 평균 "써봄"** ≥ 2건
- **"써봄" → 후기 작성** ≥ 40%
- **검색 → 요청 전환** ≥ 5%

### 4.4 콘텐츠 포맷 가이드라인 — **"How-to"가 아니라 "Case Study"**

외부 피드백(2026-04-16): *"15초 팁은 틱톡/릴스에 밀린다. 블로그/유튜브로 이탈하지 않게 하려면 정보 밀도가 아니라 **컨텍스트 밀도**로 승부해야 한다."*

**원칙**: 일반론적 방법(❌ "에어컨 냄새 없애는 법")이 아니라 **누가/어떤 상황/어떤 제약/어떻게 성공했는지**를 담은 사례(✅ "10년 된 삼성 무풍 에어컨 냄새를 5천원으로 없앤 성공기")를 권장한다.

| 레이어 | 역할 | 기존 필드 매핑 |
|--------|------|----------------|
| Who | 작성자 상황 (자취 n년 차, 장비, 환경) | 컨텍스트 태그 |
| When | 언제 시도했는지 (제품 세대, 연도 — 노하우의 유효기간) | 본문 `situation` / 구식 신호 |
| What-if | 나와 조건이 다를 때의 한계 | 본문 `situation` + 컨텍스트 태그 |
| How | 실제 시도한 행동 | `action` |
| So-what | 결과 수치·증거 (이미지/영상) | `result` + 미디어 |

**작성 UX 반영 방향**:
- 신규 작성 화면에서 컨텍스트 태그 입력을 **강한 유도**(빈값일 때 힌트·예시 강조)로 전환
- IF/THEN/SO의 IF(상황)에 "언제/어디서/어떤 조건" 프롬프트 추가
- 템플릿 예시(에어컨 케이스 등)를 placeholder로 노출
- Remix 시 "원본과 어떤 조건이 달랐는가"를 기본 질문으로

**왜 이 포맷이 Remix·구식과 맞물리는가**:
- 원본이 구체적일수록 Remix의 "내 상황" 분기가 의미를 가짐 → Remix 계보가 독보적 자산이 된다
- 컨텍스트가 명시되면 "구식(Outdated)" 신호도 *"이 제품 세대부터 안 된다"*처럼 세대/조건을 특정할 수 있어 정확해진다

---

## 5. 개발 로드맵

### Phase 1 — MVP (6~8주)
- Week 1: 프로젝트 세팅, 인증, DB 스키마
- Week 2-3: 방법 CRUD, 피드, 문제 태그
- Week 4: 인터랙션(저장/써봄/후기), 방법 점수
- Week 5: 검색, 요청 기능
- Week 6: 프로필, 기본 UI 다듬기
- Week 7: 테스트, 버그픽스
- Week 8: 베타 오픈

### Phase 2 — 활성화 (4~6주)
- 자연어 AI 검색
- 영상 업로드
- 팁 기능
- 챌린지/스트릭
- 푸시 알림

### Phase 3 — 수익화 (6~8주)
- 프리미엄 구독
- 구독자 풀 분배
- 프리미엄 방법집
- 방법사 등급 시스템 정식 오픈

### Phase 4 — 확장
- 브랜드 스폰서십
- 청원 시스템
- 라이브 코칭
- 모바일 네이티브 앱

---

## 6. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 콜드 스타트 (초기 콘텐츠 부족) | 높음 | **본인 시드 200건 선제작보다 지인 10명 × 실제 성공 노하우 10건**을 우선 확보 (외부 피드백 2026-04-16). 억지 시드는 Case Study 밀도를 못 채워 오히려 신뢰도를 깎음 |
| 정보 밀도 부족 → 유튜브/블로그 이탈 | 높음 | 15초 요약이 아니라 **Case Study 포맷**(§4.4)으로 차별화. 요약 카드 + 확장 상세(TipTap 본문·이미지·원본 링크) 2단 구조 유지 |
| 초기 표본 부족 시 성공률 왜곡 | 높음 | **최소 표본 임계값** 도입 (예: 써봄 < 10건이면 성공률 퍼센트 대신 "N명이 시도" 문구 노출). 중요 지표일수록 표본 가시화 |
| 사용자 게으름 → 써봄 인증 미달 | 높음 | 베타 단계는 **사회적 증명** 중심(실행자 프로필·배지·Remix 노출). 프리미엄 게이팅/현금 리워드는 수치 검증 후 Phase 3에 도입 (너무 일찍 넣으면 왜곡) |
| 어뷰징 (가짜 써봄/후기) | 높음 | 24h 쿨다운, IP 검증, LLM 이상 탐지 |
| 저품질·"잡탕" 콘텐츠 | 중간 | IF-THEN-SO + 컨텍스트 태그 강제, 초기엔 **카테고리 1~2개로 Niche 시작** (예: 자취/IT 생산성). 실천 즉각성·리스크 낮은 영역 선점 후 확장 |
| 법적 책임 (위험 방법: 의료·금융·약물 등) | 높음 | 해당 카테고리 초기엔 **업로드 자체 차단** 또는 별도 검수 큐. 일반 카테고리도 면책 고지 + 신고 파이프라인. Phase 2에 카테고리별 정책 명문화 |
| 노하우의 유효기간 (과거 방법이 상위 노출) | 중간 | 이미 **구식(Outdated) 신호** 구현됨. Case Study 포맷의 "When"(제품 세대/연도)을 필수화해 자동 감쇠 알고리즘의 근거로 활용 (Phase 2) |
| AI/미디어 비용 폭증 | 중간 | Haiku 우선 사용, Supabase Storage → 필요 시 R2 이관, 캐싱 전략 |

---

## 7. 디렉토리 구조 (실제)

MVP는 monorepo 없이 단일 Next.js 앱으로 시작. 규모 커지면 분할 검토.

```
bangbup/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # Route Handlers (methods, contexts, requests, search, upload, cron)
│   │   ├── m/[id]/          # 방법 상세 / edit / remix
│   │   ├── feed, search, new, requests, login, [handle]
│   │   └── auth/            # OAuth 콜백 / 로그아웃
│   ├── components/          # method-card, rich-editor, image-dropzone, outdated-*, related-methods …
│   └── lib/
│       ├── prisma.ts · supabase/
│       ├── methods.ts · interactions.ts · auth.ts
│       ├── validators.ts    # Zod 스키마
│       └── utils.ts         # 방법 점수 계산 등
├── prisma/
│   ├── schema.prisma
│   └── seed.ts, seed-batch2.ts
├── docs/
│   └── PROJECT_DESIGN.md    # 이 문서
├── vercel.json              # Cron (Supabase keep-alive)
└── README.md
```

---

## 8. 다음 단계

1. ✅ 이 설계 문서 확정
2. ✅ 프로젝트 초기 세팅 (Next.js + Prisma + Supabase Auth)
3. ✅ DB 스키마 마이그레이션
4. ✅ 방법 CRUD + 피드 구현
5. ✅ 인터랙션 + 점수 시스템 (구식·유용함 포함)
6. ✅ 검색 + 요청 기능
7. ✅ Remix, 이미지 업로드, 마크다운 에디터
8. ✅ Vercel 배포 (`bangbup.com`, `bangbup.vercel.app`)
9. 🔜 지인 베타 피드백 수집 → Phase 2 스코프 확정

---

**작성일**: 2026-04-14
**최종 수정**: 2026-04-16
**버전**: 0.3 (MVP 배포 + 외부 피드백 반영: Case Study 포맷·리스크 재평가)
