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

### 3.1 기술 스택

#### 프론트엔드
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS + shadcn/ui
- **상태관리**: Zustand (경량) + TanStack Query (서버 상태)
- **폼/검증**: React Hook Form + Zod
- **모바일**: PWA 우선, 추후 React Native 고려

#### 백엔드
- **런타임**: Node.js (Next.js Route Handlers 또는 별도 API 서버)
- **DB**: PostgreSQL (Supabase 또는 자체 호스팅)
- **ORM**: Prisma
- **인증**: Auth.js (NextAuth) 또는 Supabase Auth
- **파일 스토리지**: S3 호환 (Cloudflare R2 추천 — 비용 효율)
- **검색/추천**: 초기엔 Postgres full-text + pgvector, 규모 커지면 Meilisearch/Algolia

#### AI/ML
- **자연어 문제 파싱**: Claude API (claude-haiku-4-5) — 비용 효율
- **추천 알고리즘**: 초기엔 태그/벡터 유사도, 후반에 협업 필터링
- **어뷰징 탐지**: 이상 패턴 감지 룰 + LLM 보조

#### 인프라
- **호스팅**: Vercel (프론트) + Railway/Fly.io (DB/워커)
- **CDN/미디어**: Cloudflare
- **모니터링**: Sentry + Posthog (행동 분석)

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

### 4.1 포함 기능 ✅
1. **사용자 가입/로그인** (이메일 + 소셜)
2. **방법 업로드** (카드 형식만, 영상은 Phase 2)
3. **피드** (For You 1개 탭, 최신순 + 간단 태그 매칭)
4. **문제 해시태그** 기본 기능
5. **기본 인터랙션**: 저장 / 써봄 / 후기(성공·실패)
6. **검색** (키워드 기반, 자연어는 Phase 2)
7. **방법 요청** (현상금 없이, 기본 템플릿)
8. **프로필**: 내 방법, 실행 이력, 저장
9. **방법 점수** 집계 및 표시

### 4.2 제외 기능 (추후) ❌
- 영상 업로드/처리
- 자연어 AI 검색
- Remix 계보 시각화
- 크리에이터 수익화 (팁, 구독 풀)
- 챌린지/스트릭
- 라이브 코칭
- 브랜드 스폰서십
- 청원 시스템

### 4.3 성공 지표 (MVP KPI)
- **DAU/MAU 비율** ≥ 20%
- **가입 → 첫 방법 업로드** 전환 ≥ 10%
- **방법당 평균 "써봄"** ≥ 2건
- **"써봄" → 후기 작성** ≥ 40%
- **검색 → 요청 전환** ≥ 5%

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
| 콜드 스타트 (초기 콘텐츠 부족) | 높음 | 시드 크리에이터 10명 섭외 + 초기 방법 200건 선제작 |
| 어뷰징 (가짜 써봄/후기) | 높음 | 24h 쿨다운, IP 검증, LLM 이상 탐지 |
| 저품질 콘텐츠 | 중간 | IF-THEN-SO 포맷 강제, AI 품질 스코어링 |
| 법적 책임 (위험 방법) | 중간 | 카테고리별 면책/경고, 의료·법률 방법 별도 검수 |
| AI/미디어 비용 폭증 | 중간 | Haiku 우선 사용, R2 스토리지, 캐싱 전략 |

---

## 7. 디렉토리 구조 (예정)

```
bangbup/
├── apps/
│   └── web/                 # Next.js 앱
│       ├── app/             # App Router
│       ├── components/
│       ├── lib/
│       └── public/
├── packages/
│   ├── db/                  # Prisma 스키마
│   ├── ui/                  # 공용 UI 컴포넌트
│   └── shared/              # 타입, 유틸
├── docs/
│   ├── PROJECT_DESIGN.md    # 이 문서
│   ├── API.md
│   └── SCHEMA.md
└── README.md
```

---

## 8. 다음 단계

1. ✅ 이 설계 문서 확정
2. 🔜 프로젝트 초기 세팅 (Next.js + Prisma + Auth)
3. 🔜 DB 스키마 마이그레이션
4. 🔜 방법 CRUD + 피드 구현
5. 🔜 인터랙션 + 점수 시스템
6. 🔜 검색 + 요청 기능
7. 🔜 베타 오픈

---

**작성일**: 2026-04-14
**버전**: 0.1 (초안)
