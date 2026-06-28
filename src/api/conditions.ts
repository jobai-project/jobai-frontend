import { apiClient } from './axios';

// 조건 생성 요청 (POST /conditions)
export interface CreateConditionRequest {
  keywords: string[];
  locations: string[];
  jobTypes: string[];
  experience: string[]; // 단일값 배열 래핑 — BE 협의 (spec §9.3)
  scoreThreshold: number; // 0~100
  notifyEmail: boolean;
  slackWebhook: string | null;
  discordWebhook: string | null;
  isActive: boolean;
}

// 조건 생성 응답 (BE 스펙 확정 시 조정)
export interface ConditionResponse extends CreateConditionRequest {
  id: string;
}

// 백엔드가 없을 때를 기본값으로 둔다. 실제 서버를 붙이려면
// .env.local 에 VITE_USE_MOCK=false 와 VITE_API_BASE_URL 를 설정한다.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const createCondition = async (
  body: CreateConditionRequest,
): Promise<ConditionResponse> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { id: `mock-condition-${Date.now()}`, ...body };
  }

  // baseURL 이 이미 `/api`(또는 .env 의 서버 루트)를 포함하므로 경로 중복을
  // 피하기 위해 `/conditions` 만 사용한다. VITE_API_BASE_URL 은 `/conditions`
  // 를 서빙하는 루트(예: http://localhost:8080/api)를 가리켜야 한다. (spec §9.1)
  const { data } = await apiClient.post<ConditionResponse>('/conditions', body);
  return data;
};
