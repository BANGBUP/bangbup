import { prisma } from '../src/lib/prisma'
import { createMethod } from '../src/lib/methods'
import type { MethodInput } from '../src/lib/validators'

type Seed = Omit<MethodInput, 'parentId'> & { category: string }

const seeds: Seed[] = [
  // ─ 미용
  {
    category: '미용',
    title: '다크서클 아침 10초 대처',
    situation: '잠 못 잔 다음 날 눈 밑이 푸르게 부어오름',
    action: '차가운 티백을 눈에 90초 얹고, 그다음 손가락으로 눈밑 뼈를 따라 안→밖으로 10회 두드린다',
    result: '순환이 돌아 푸른기가 옅어지고 부기가 빠진다',
    difficulty: 1,
    cost: 'FREE',
    duration: '3분',
    problems: ['다크서클', '부기', '아침루틴'],
    contexts: ['2024년', '수면부족'],
  },
  // ─ 음식
  {
    category: '음식',
    title: '계란 삶기 실패 없는 공식',
    situation: '매번 덜 익거나 과하게 삶아 껍질이 붙어버림',
    action: '냉장고에서 꺼낸 계란을 찬물에 담가 끓인 뒤 끓기 시작하면 불을 끄고 뚜껑을 덮고 9분(반숙 6분)',
    result: '노른자 정확한 익힘, 껍질이 스르륵 벗겨짐',
    difficulty: 1,
    cost: 'FREE',
    duration: '10분',
    problems: ['요리기초', '계란'],
    contexts: ['가정식'],
  },
  // ─ IT
  {
    category: 'IT',
    title: 'Mac 느려졌을 때 초기 진단',
    situation: '맥북이 갑자기 느려지고 팬이 시끄러워짐',
    action: '활성 상태 보기(Activity Monitor) → CPU 탭 → %CPU 내림차순 → 상위 프로세스 "WindowServer, kernel_task" 외에 과점유 앱 강제 종료',
    result: '원인 앱을 10초 안에 찾아내고 즉시 정상화됨',
    difficulty: 2,
    cost: 'FREE',
    duration: '2분',
    problems: ['맥 느림', '퍼포먼스'],
    contexts: ['macOS Sonoma', 'macOS Sequoia'],
  },
  // ─ 고장 (스마트폰)
  {
    category: '고장',
    title: '아이폰 충전 안 될 때 먼저 해볼 것',
    situation: '케이블 꽂았는데 충전 안 되고 간헐적으로 인식됨',
    action: '전원 끄고 이쑤시개/면봉으로 충전 포트 안쪽 먼지(보풀) 제거 → 면봉에 소량 알코올 → 재시도',
    result: '80% 확률로 수리 안 가고 바로 복구됨 (케이블 먼저 의심하기 전에)',
    difficulty: 2,
    cost: 'FREE',
    duration: '5분',
    problems: ['충전안됨', '아이폰고장'],
    contexts: ['iPhone 15', 'iPhone 14', 'iPhone 13'],
  },
  // ─ 수리
  {
    category: '수리',
    title: '세탁기 문이 안 열릴 때',
    situation: '세탁 끝났는데 도어락이 풀리지 않음',
    action: '전원 뽑고 3분 대기 → 급수 호스 잠그고 배수 필터(하단 커버) 열어 물 완전히 빼기 → 다시 전원 → 잠금 해제됨',
    result: '서비스 부르지 않고 즉시 해결. 이물질/과수위 감지 오류 대부분 해결',
    difficulty: 2,
    cost: 'FREE',
    duration: '15분',
    problems: ['세탁기고장', '가전수리'],
    contexts: ['드럼세탁기', 'LG', '삼성'],
  },
  // ─ 노하우 (생활)
  {
    category: '노하우',
    title: '택배 박스 버리기 귀찮을 때',
    situation: '박스에 붙은 테이프 뜯는 게 지저분하고 시간 오래 걸림',
    action: '박스 커터로 테이프 자르지 말고, 커터를 눕혀 테이프와 박스 사이에 넣고 테이프만 쓱 밀어냄. 그대로 접어서 묶기',
    result: '30초 안에 박스 하나 정리 가능. 손톱 안 다침',
    difficulty: 1,
    cost: 'FREE',
    duration: '30초',
    problems: ['정리정돈', '생활꿀팁'],
    contexts: [],
  },
  // ─ 명상
  {
    category: '명상',
    title: '불안할 때 4-7-8 호흡법',
    situation: '발표/면접 직전 심장이 뛰고 호흡이 얕아짐',
    action: '코로 4초 들이마시기 → 7초 멈춤 → 입으로 8초 내쉬기. 이걸 4세트',
    result: '부교감신경 활성화로 심박수 즉시 하강. 머릿속이 다시 맑아짐',
    difficulty: 1,
    cost: 'FREE',
    duration: '2분',
    problems: ['불안', '긴장완화', '호흡법'],
    contexts: ['Dr. Andrew Weil'],
  },
  // ─ 심리치료
  {
    category: '심리치료',
    title: '잡생각 꼬리무는 밤, 종이 한 장 방법',
    situation: '새벽 2시에 걱정이 끝없이 이어져 잠 못 듦',
    action: '머리맡에 종이와 펜 → 떠오르는 걱정을 순서대로 단어만 적기 (문장 X) → 뒷면에 "내일 10시 다시 생각해보기" 쓰고 엎어두기',
    result: '뇌가 "기록됐으니 놔줘도 돼" 로 인식 → 평균 15분 내 잠듦',
    difficulty: 1,
    cost: 'FREE',
    duration: '5분',
    problems: ['불면', '걱정반복', '잡생각'],
    contexts: ['CBT-I 기반'],
  },
  // ─ 해몽
  {
    category: '해몽',
    title: '이가 빠지는 꿈 해석',
    situation: '이빨이 우수수 빠지는 꿈을 꾼 뒤 찜찜함',
    action: '전통적으로는 "가까운 사람의 구설/건강 주의" 신호. 현대 해석은 "통제력 상실/변화 공포" — 최근 어떤 변화가 있었는지 한 줄 적어보고 그 변화에 대한 내 감정에 집중',
    result: '미신적 공포가 줄고, 내가 진짜 무엇을 불안해하는지 자각하게 됨',
    difficulty: 1,
    cost: 'FREE',
    duration: '3분',
    problems: ['해몽', '불안한꿈'],
    contexts: ['Freud/Jung 해석'],
  },
  // ─ IT/노하우 (추가)
  {
    category: '노하우',
    title: '유튜브 영상 특정 구간만 다시 보기',
    situation: '긴 영상에서 놓친 부분을 되감기 힘듦',
    action: '영상 위에서 숫자키 1~9 누르면 영상 10%~90% 지점으로 점프, `J` 10초 뒤로, `L` 10초 앞으로, `,/.` 은 프레임 단위',
    result: '키보드만으로 정확하게 원하는 구간 탐색. 강의/튜토리얼 2배 빠르게 소화',
    difficulty: 1,
    cost: 'FREE',
    duration: '즉시',
    problems: ['유튜브', '학습효율'],
    contexts: ['PC 브라우저'],
  },
]

async function main() {
  // 가장 최근 생성된 유저 = 유저 본인 (단일 유저 세팅)
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  if (!user) {
    throw new Error('등록된 유저가 없습니다. 먼저 /login 으로 가입해주세요.')
  }
  console.log(`Seeding for user: @${user.handle} (${user.email})`)

  for (const s of seeds) {
    const { category: _category, ...input } = s
    void _category
    const created = await createMethod(user.id, input)
    console.log(` + [${s.category}] ${created.title}`)
  }

  console.log(`\n✅ ${seeds.length}개 방법 생성 완료.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
