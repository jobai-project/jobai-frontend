// src/utils/companyNames.ts

/** 영문 회사 slug → 한글 회사명 매핑 */
export const COMPANY_NAME_MAP: Record<string, string> = {
  kakao: '카카오',
  kakaopay: '카카오페이',
  naver: '네이버',
  coupang: '쿠팡',
  woowahan: '우아한형제들',
  toss: '토스',
  daangn: '당근',
  socar: '쏘카',
  kurly: '컬리',
  zigbang: '직방',
  wrtn: '뤼튼',
  nhn: 'NHN',
  upstage: '업스테이지',
  doodlin: '두들린',
  gccompany: '여기어때',
  ably: '에이블리',
  musinsa: '무신사',      
  bucketplace: '오늘의집', 

};

/**
 * 영문 slug를 한글 회사명으로 변환.
 * 매핑에 없으면 원문 그대로 반환한다.
 * 입력은 항상 소문자 slug로 들어온다는 전제(G1 확인) — 정규화 불필요.
 */
export const getCompanyName = (slug: string): string =>
  COMPANY_NAME_MAP[slug] ?? slug;
