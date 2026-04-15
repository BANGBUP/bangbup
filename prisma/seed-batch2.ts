import { prisma } from '../src/lib/prisma'
import { createMethod } from '../src/lib/methods'
import type { MethodInput } from '../src/lib/validators'

type Seed = Omit<MethodInput, 'parentId'> & { category: string }

const seeds: Seed[] = [
  // ─ AI / ChatGPT
  {
    category: 'AI',
    title: 'ChatGPT 답변이 두루뭉술할 때',
    situation: '원하는 수준의 답변이 안 나오고 일반론만 돌아옴',
    action: '"이 주제 전문가라면 놓치지 않을 디테일 5가지를 먼저 나열해줘"를 먼저 프롬프트로. 그 뒤 그중 가장 중요한 하나만 깊게 요구',
    result: '메타 관점을 먼저 유도해 답변 해상도가 체감 2~3배 상승',
    difficulty: 2,
    cost: 'FREE',
    duration: '1분',
    problems: ['프롬프트', 'AI활용', '업무효율'],
    contexts: ['ChatGPT', 'Claude', '2025년'],
  },
  {
    category: 'AI',
    title: '긴 PDF 요약을 정확하게 시키는 법',
    situation: 'PDF 올려서 요약시키면 중요한 부분이 누락됨',
    action: '"1) 목차를 먼저 추출 2) 섹션별로 핵심 주장과 근거를 분리 3) 서로 충돌하는 주장이 있는지 체크" 3단계로 쪼개서 요구',
    result: '단일 요약 대비 핵심 보존율 대폭 상승, 논리 결함까지 발견',
    difficulty: 2,
    cost: 'FREE',
    duration: '5분',
    problems: ['문서요약', 'AI활용'],
    contexts: ['ChatGPT', 'Claude', 'NotebookLM'],
  },

  // ─ 건강/운동
  {
    category: '건강',
    title: '아침에 바로 일어나지 못할 때',
    situation: '알람 끄고 다시 잠드는 루프에 빠짐',
    action: '알람을 침대에서 3걸음 떨어진 곳에 두고, 끄면 곧장 커튼을 연다(햇빛 노출). 그 상태로 물 한 잔 마시고 3분 서 있기',
    result: '햇빛+기립+수분이 멜라토닌을 즉시 차단 → 재수면 확률 급감',
    difficulty: 1,
    cost: 'FREE',
    duration: '5분',
    problems: ['기상', '아침루틴', '수면'],
    contexts: ['Huberman Lab'],
  },
  {
    category: '건강',
    title: '러닝 초보 무릎 안 아프게',
    situation: '달리기 시작한 지 2주차에 무릎이 욱신거림',
    action: '페이스를 "대화 가능한 속도"로 낮추고, 주 3회 각 20~30분만. 전후에 엉덩이 근력(글루트 브릿지 15회×3세트) 필수',
    result: 'IT밴드/무릎 통증 대부분 예방. 폼이 자연스럽게 교정됨',
    difficulty: 2,
    cost: 'FREE',
    duration: '주 3회',
    problems: ['러닝', '무릎통증', '초보자'],
    contexts: ['러닝 입문'],
  },
  {
    category: '운동',
    title: '스쿼트 무릎이 안으로 모아질 때',
    situation: '앉을 때 무릎이 안쪽으로 무너짐(knee valgus)',
    action: '발바닥 세 지점(엄지, 새끼, 뒤꿈치)을 바닥에 "박는다"는 느낌으로 누르고, 무릎이 새끼발가락 방향을 향하게 밀어낸다',
    result: '고유수용감각 활성화로 무릎 정렬이 즉시 교정',
    difficulty: 2,
    cost: 'FREE',
    duration: '즉시',
    problems: ['스쿼트', '무릎', '자세'],
    contexts: ['헬스 초중급'],
  },

  // ─ 수면/루틴
  {
    category: '수면',
    title: '커피를 못 끊겠는데 잠은 자고 싶을 때',
    situation: '오후 커피가 밤잠을 방해하는 느낌',
    action: '기상 후 90분 이후에 첫 커피, 마지막 커피는 자기 10시간 전까지. 중독 줄이려면 "2일 커피 → 1일 차" 로테이션',
    result: '수면 질 개선을 즉시 체감. 카페인 내성도 리셋',
    difficulty: 2,
    cost: 'LOW',
    duration: '즉시 적용',
    problems: ['카페인', '수면질', '커피'],
    contexts: ['Huberman Lab'],
  },

  // ─ 피부/미용
  {
    category: '미용',
    title: '여드름 올라올 기미 보일 때',
    situation: '밤에 뾰루지가 올라오려고 붉어지기 시작',
    action: '얼음으로 5분 찜질 → 2.5% 벤조일퍼옥사이드 소량 점찍기 → 하이드로콜로이드 패치 붙이고 자기',
    result: '다음날 아침 크기 절반, 2일 안에 수그러드는 경우 80%',
    difficulty: 1,
    cost: 'LOW',
    duration: '10분',
    problems: ['여드름', '뾰루지', '피부응급'],
    contexts: ['성인 여드름', '2024년 피부과 가이드'],
  },

  // ─ 부동산/재테크
  {
    category: '재테크',
    title: '첫 주식 계좌, 뭐부터 사야 할지 모를 때',
    situation: '투자 공부는 했는데 막상 매수 버튼이 안 눌림',
    action: 'S&P500 ETF(SPY/VOO) 또는 KODEX200 을 월급의 5~10% 자동매수 설정. 개별종목은 총자산의 10% 한도 내에서만',
    result: '분석 마비 탈출. 시장 평균을 따라가며 시간을 아군으로',
    difficulty: 2,
    cost: 'MID',
    duration: '월정기',
    problems: ['재테크', '주식초보', 'ETF'],
    contexts: ['2024년', '미국 ETF'],
  },
  {
    category: '재테크',
    title: '연말정산 환급 더 받는 기초',
    situation: '연말정산 때 뭘 빠뜨렸나 매번 찜찜함',
    action: '연금저축펀드 400만원 × 13.2~16.5% 세액공제 + IRP 300만원 추가. 신용카드는 총급여 25% 초과분부터 체크카드 비중 높이기',
    result: '평균 50~90만원 환급 증가. 노후자금도 동시에 쌓임',
    difficulty: 3,
    cost: 'HIGH',
    duration: '연 1회',
    problems: ['연말정산', '세금', '절세'],
    contexts: ['한국', '직장인'],
  },

  // ─ 육아/가족
  {
    category: '육아',
    title: '아이 스크린타임 싸움 줄이기',
    situation: '영상 끄자고 할 때마다 울고 떼씀',
    action: '"5분 남았어" 예고 → 타이머 소리로 끝내되, 끝난 직후 즉시 "다음 놀이"를 제안(책, 블록 등 전환 대상 준비)',
    result: '뇌가 박탈감 대신 전환으로 인식 → 저항 급감',
    difficulty: 2,
    cost: 'FREE',
    duration: '매회',
    problems: ['육아', '유튜브', '스크린타임'],
    contexts: ['3~7세'],
  },

  // ─ 반려동물
  {
    category: '반려동물',
    title: '고양이 물을 잘 안 마실 때',
    situation: '사료통 옆 물그릇을 거의 안 먹음',
    action: '흐르는 물(분수대)로 바꾸거나, 사료와 "멀리 떨어진 곳"에 놓기. 물그릇은 넓고 얕은 것으로',
    result: '야생 본능 충족 → 음수량 평균 1.5~2배 증가, 비뇨기 질환 예방',
    difficulty: 1,
    cost: 'LOW',
    duration: '영구',
    problems: ['고양이', '음수량', '반려동물케어'],
    contexts: ['집고양이'],
  },
  {
    category: '반려동물',
    title: '강아지 산책에서 줄 잡아당길 때',
    situation: '산책하는 내내 줄을 앞으로 당겨 힘듦',
    action: '잡아당기는 순간 즉시 멈춘다 → 강아지가 돌아보거나 줄이 느슨해지면 다시 걷는다. 이걸 한 산책에 30회 이상 반복',
    result: '2주 내 "줄 당기면 진도 못 나감" 학습. 방향 전환도 수월',
    difficulty: 2,
    cost: 'FREE',
    duration: '2주',
    problems: ['강아지', '산책', '행동교정'],
    contexts: ['모든 견종'],
  },

  // ─ 자동차
  {
    category: '자동차',
    title: '겨울 자동차 시동 안 걸릴 때',
    situation: '영하 10도 이하에서 크랭킹은 되는데 시동이 안 걸림',
    action: '라이트 10초 켜서 배터리를 "깨운" 뒤 5~10초 대기 → 키온 상태로 3초 대기 후 시동. 안 되면 1분 간격 3회',
    result: '저온으로 낮아진 화학반응을 활성화. 방전 의심 전에 시도',
    difficulty: 2,
    cost: 'FREE',
    duration: '3분',
    problems: ['자동차', '겨울', '배터리'],
    contexts: ['한겨울', '영하권'],
  },

  // ─ 여행
  {
    category: '여행',
    title: '비행기 시차 적응 빠르게',
    situation: '장거리 여행 후 첫 3일 내내 피곤하고 새벽에 깸',
    action: '도착지 기준으로 기내에서 미리 수면 시간 당기기 + 첫날 햇빛 30분 + 첫 끼니는 도착지 아침/점심 시간에 맞춰 먹기',
    result: '시차 적응 기간 5~7일 → 2~3일로 단축',
    difficulty: 2,
    cost: 'FREE',
    duration: '3일',
    problems: ['시차', '여행', '해외'],
    contexts: ['장거리 비행'],
  },

  // ─ IT / 기기
  {
    category: 'IT',
    title: 'MacBook 배터리 수명 지키기',
    situation: '2년쯤 쓰면 최대용량 85% 아래로 급락함',
    action: '설정 → 배터리 → "배터리 최적 충전" 켜기 + 외부 전원 연결 상태로 오래 쓸 때는 80% 충전 제한(macOS 14+)',
    result: '2년 후 최대용량 90%+ 유지. 교체 주기 지연',
    difficulty: 1,
    cost: 'FREE',
    duration: '1분 설정',
    problems: ['MacBook', '배터리', '수명'],
    contexts: ['macOS Sonoma', 'macOS Sequoia', 'M1/M2/M3'],
  },
  {
    category: 'IT',
    title: 'iPhone 사진 용량이 꽉 찼을 때',
    situation: '저장 공간 가득 차 업데이트/촬영 불가',
    action: '사진 앱 → 앨범 → "최근 삭제됨" 완전 비우기 → 설정 → 사진 → "iPhone 저장공간 최적화" 켜기',
    result: '원본은 iCloud 에 안전, 기기에는 최적화 버전만 → 수 GB 즉시 확보',
    difficulty: 1,
    cost: 'FREE',
    duration: '3분',
    problems: ['아이폰저장공간', '사진정리'],
    contexts: ['iOS 17+', 'iPhone'],
  },
  {
    category: 'IT',
    title: '윈도우 업데이트 후 느려진 PC',
    situation: 'Windows 11 업데이트 후 부팅/앱 실행이 느려짐',
    action: '설정 → 시스템 → 문제해결사 → Windows Update → 실행. 그래도 느리면 powercfg /energy 로 에너지 리포트 생성',
    result: '업데이트 누락 모듈/드라이버 자동 보정, 80% 케이스 즉시 복구',
    difficulty: 3,
    cost: 'FREE',
    duration: '15분',
    problems: ['윈도우느림', 'Windows Update'],
    contexts: ['Windows 11'],
  },

  // ─ 공부/학습
  {
    category: '학습',
    title: '외국어 말하기가 안 늘 때',
    situation: 'Duolingo는 매일 하는데 실제로 말은 못 함',
    action: '매일 5분 "혼잣말 녹음" → 내 목소리로 어제 한 일 설명 → 재생하며 어색한 부분 표시. 그 부분만 ChatGPT로 교정',
    result: '산출(output) 훈련으로 전환되어 진짜 회화 근력이 붙음',
    difficulty: 2,
    cost: 'FREE',
    duration: '매일 10분',
    problems: ['영어', '언어학습', '말하기'],
    contexts: ['영어 중급', 'ChatGPT 활용'],
  },
  {
    category: '학습',
    title: '시험 직전 집중 안 될 때',
    situation: '시험 전날 밤 책만 펴면 딴생각',
    action: '25분 타이머 맞추고, "이 시간엔 이 한 챕터만" 약속. 타이머 울리면 5분 쉼, 그때 딴생각 몰아서 걱정. 4세트 후 30분 긴 휴식',
    result: '포모도로 효과로 인지부하 분산 + 집중-걱정 시간 분리',
    difficulty: 1,
    cost: 'FREE',
    duration: '2시간',
    problems: ['집중력', '시험공부', '포모도로'],
    contexts: ['수험생'],
  },

  // ─ 직장/커뮤니케이션
  {
    category: '직장',
    title: '애매한 요청 메일 대응법',
    situation: '상사 메일이 모호해서 뭘 해야 할지 모름',
    action: '"제가 이해한 바로는 A를 하는 것이 맞을까요, 아니면 B일까요? B라면 기한 전에 ○○ 정보가 필요합니다." 식으로 옵션 제시',
    result: '반문 대신 "선택지 제공" → 상사 결정 부담 감소 & 빠른 답변',
    difficulty: 2,
    cost: 'FREE',
    duration: '3분',
    problems: ['커뮤니케이션', '이메일', '직장'],
    contexts: ['업무 이메일'],
  },
  {
    category: '직장',
    title: '발표 직전 목소리 떨릴 때',
    situation: '발표 직전 심장 뛰고 목이 잠김',
    action: '입에 물을 머금고 15초 → 삼키며 "긴 한숨" 내쉬기. 이걸 3번. 손 닦고 찬물로 얼굴 측면(Vagus 신경 자극)',
    result: '미주신경 반사로 심박 즉시 하강. 목 건조도 동시 해결',
    difficulty: 1,
    cost: 'FREE',
    duration: '2분',
    problems: ['발표', '긴장', '떨림'],
    contexts: ['회의/면접'],
  },

  // ─ 집안일/인테리어
  {
    category: '생활',
    title: '곰팡이 슨 실리콘 되살리기',
    situation: '욕실 실리콘이 검게 변했는데 교체는 번거로움',
    action: '키친타월을 실리콘 위에 깔고 락스 원액을 적셔 2~4시간 두기. 이후 칫솔로 가볍게 문지르고 물로 헹굼',
    result: '교체 없이 새것처럼. 재발 방지하려면 샤워 후 환기 필수',
    difficulty: 2,
    cost: 'LOW',
    duration: '4시간',
    problems: ['곰팡이', '욕실청소', '생활꿀팁'],
    contexts: ['주방/욕실'],
  },
  {
    category: '생활',
    title: '공간이 답답할 때 10분 정리',
    situation: '방이 지저분해서 뭐부터 해야 할지 모름',
    action: '가방 하나를 들고 바닥에 있는 것만 10분 동안 "제자리 or 버릴 것"으로 분류. 완벽히 하지 말고 10분에 멈춤',
    result: '0→1 효과로 다시 시작 가능. 바닥만 정리되어도 체감 50%↑',
    difficulty: 1,
    cost: 'FREE',
    duration: '10분',
    problems: ['정리', '청소', '미니멀'],
    contexts: [],
  },

  // ─ 심리/관계
  {
    category: '심리',
    title: '친구의 하소연이 부담스러울 때',
    situation: '공감은 하고 싶은데 에너지가 바닥남',
    action: '"지금 조언이 필요해, 아니면 그냥 들어주는 게 필요해?"를 먼저 묻기. 내 에너지 한계를 정하고 시간을 미리 말하기',
    result: '경계가 명확해지며 관계 유지와 자기보호가 양립',
    difficulty: 2,
    cost: 'FREE',
    duration: '즉시',
    problems: ['인간관계', '공감피로', '경계'],
    contexts: ['친밀한 관계'],
  },
  {
    category: '심리',
    title: '거절을 못 하는 성격일 때',
    situation: '부탁 받으면 반사적으로 "네"가 나감',
    action: '"확인해보고 답 드릴게요"로 시간 버는 기본 문장 암기. 24시간 내 거절 메시지는 템플릿화("일정이 이미 차서 이번엔 어렵겠어요")',
    result: '즉답 반사 차단 → 내 일정/에너지 보호. 관계는 오히려 건강해짐',
    difficulty: 2,
    cost: 'FREE',
    duration: '즉시',
    problems: ['거절', '인간관계', '과부하'],
    contexts: [],
  },
]

async function main() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } })
  if (!user) throw new Error('유저 없음')
  console.log(`Seeding batch 2 for @${user.handle}`)

  for (const s of seeds) {
    const { category: _c, ...input } = s
    void _c
    const created = await createMethod(user.id, input)
    console.log(` + [${s.category}] ${created.title}`)
  }
  console.log(`\n✅ ${seeds.length}개 추가 완료.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
