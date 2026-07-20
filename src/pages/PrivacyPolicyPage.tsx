import type { ReactNode } from 'react';

// 개인정보 처리방침 — 독립 전체화면(사이드바 없음). Figma 1405:16287.
// 배경 좌하향 그라데이션 + 중앙 960px 컨테이너.

// 조항 블록 — 소제목 + 본문.
function Clause({ no, title, children }: { no: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[18px] font-semibold leading-[1.5] tracking-[-0.36px] text-gray-900">
        {no}. {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

// 목록(ul) — 본문 톤 유지.
function List({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}

const TH = 'border border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900';
const TD = 'border border-gray-200 px-4 py-3 align-top';

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          'linear-gradient(-24.6deg, #DDDDFB 0.86%, #FFFFFF 56.4%)',
      }}
    >
      <div className="mx-auto max-w-[960px] px-6 py-16 text-[16px] font-normal leading-[1.5] tracking-[-0.32px] text-gray-800">
        {/* 제목 + 도입 */}
        <h1 className="mb-6 text-[28px] font-bold tracking-[-0.56px] text-gray-900">
          JobA! 개인정보 처리방침
        </h1>
        <p className="mb-2">
          JobA!(이하 &lsquo;회사&rsquo;)는 정보주체의 자유와 권리 보호를 위해 「개인정보
          보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고
          안전하게 관리하고 있습니다. 본 개인정보 처리방침을 통해 회사가 어떠한 정보를
          수집·이용하며, 개인정보 보호를 위해 어떠한 조치를 취하고 있는지 알려드립니다.
        </p>
        <p className="mb-10 text-gray-600">
          시행일자: {/* TODO: 시행일자 확정 필요 (2026년 O월 O일) */}
        </p>

        <div className="flex flex-col gap-10">
          <Clause no={1} title="수집하는 개인정보 항목 및 수집 방법">
            <p className="font-medium text-gray-900">가. 수집 항목</p>
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr>
                  <th className={TH}>구분</th>
                  <th className={TH}>수집 항목</th>
                  <th className={TH}>수집 시점</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={TD}>필수</td>
                  <td className={TD}>
                    Google 계정 이메일, 이름, 프로필 사진(google_id 포함)
                  </td>
                  <td className={TD}>회원가입(Google OAuth 로그인)</td>
                </tr>
                <tr>
                  <td className={TD}>선택</td>
                  <td className={TD}>이력서 파일(PDF), 이력서 내 기재 정보 일체</td>
                  <td className={TD}>이력서 업로드 시</td>
                </tr>
                <tr>
                  <td className={TD}>선택</td>
                  <td className={TD}>알림 수신용 이메일, Slack/Discord 웹훅 URL</td>
                  <td className={TD}>조건 설정 시</td>
                </tr>
                <tr>
                  <td className={TD}>선택</td>
                  <td className={TD}>희망 직무·지역·경력·점수 임계값 등 조건 정보</td>
                  <td className={TD}>조건 설정 시</td>
                </tr>
                <tr>
                  <td className={TD}>선택</td>
                  <td className={TD}>자기소개서 텍스트</td>
                  <td className={TD}>자소서 작성 시</td>
                </tr>
                <tr>
                  <td className={TD}>자동 수집</td>
                  <td className={TD}>
                    접속 로그, 쿠키(로그인 유지용 Refresh Token), 서비스 이용 기록
                  </td>
                  <td className={TD}>서비스 이용 시</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 font-medium text-gray-900">나. 수집 방법</p>
            <List
              items={[
                'Google OAuth를 통한 소셜 로그인 과정에서 수집',
                '서비스 이용 중 이용자가 직접 입력·업로드',
                '서비스 이용 과정에서 자동으로 생성·수집',
              ]}
            />
          </Clause>

          <Clause no={2} title="개인정보의 수집 및 이용 목적">
            <ol className="flex list-decimal flex-col gap-1 pl-5">
              <li>회원 식별 및 가입·이용 관리</li>
              <li>이력서 기반 채용 공고 매칭 및 맞춤 추천 제공</li>
              <li>알림(이메일·Slack·Discord) 발송 등 서비스 제공</li>
              <li>서비스 이용 통계·분석 및 품질 개선</li>
            </ol>
          </Clause>

          <Clause no={3} title="개인정보의 보유 및 이용 기간">
            <List
              items={[
                '회원 탈퇴 시 지체 없이 파기(관계 법령에 따라 보존이 필요한 경우 제외)',
                '이력서 등 이용자가 업로드한 파일은 삭제 요청 또는 탈퇴 시 파기',
                '관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관',
              ]}
            />
          </Clause>

          <Clause no={4} title="개인정보의 제3자 제공">
            <p>
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 아래의
              경우는 예외로 합니다.
            </p>
            <List
              items={[
                '이용자가 사전에 동의한 경우',
                '법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
              ]}
            />
          </Clause>

          <Clause no={5} title="개인정보 처리 위탁">
            <p>
              회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 외부에
              위탁하고 있습니다.
            </p>
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr>
                  <th className={TH}>수탁업체</th>
                  <th className={TH}>위탁 업무 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={TD}>Amazon Web Services (AWS S3)</td>
                  <td className={TD}>이력서 파일 저장</td>
                </tr>
                <tr>
                  <td className={TD}>SendGrid</td>
                  <td className={TD}>이메일 알림 발송</td>
                </tr>
                <tr>
                  <td className={TD}>Google</td>
                  <td className={TD}>로그인 인증(OAuth2)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-600">
              ※ 향후 위탁 업체가 추가·변경될 경우 본 방침을 통해 고지합니다.
            </p>
          </Clause>

          <Clause no={6} title="정보주체의 권리·의무 및 행사 방법">
            <p>정보주체는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <List
              items={[
                '개인정보 열람 요구',
                '오류 등이 있을 경우 정정·삭제 요구',
                '개인정보 처리 정지 요구',
              ]}
            />
            <p>
              권리 행사는 서비스 내 설정 또는 개인정보 보호책임자에게 이메일로 요청할 수
              있으며, 회사는 지체 없이 조치합니다.
            </p>
          </Clause>

          <Clause no={7} title="개인정보의 안전성 확보 조치">
            <List
              items={[
                '개인정보 접근 권한 최소화 및 접근 통제',
                '전송 구간 암호화(HTTPS) 및 인증 토큰 보호',
                '개인정보 취급 인력 최소화 및 보안 교육 시행',
              ]}
            />
          </Clause>

          <Clause no={8} title="쿠키의 설치·운영 및 거부">
            <p>
              회사는 로그인 상태 유지를 위해 쿠키(Refresh Token 등)를 사용합니다. 이용자는
              브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 등 일부
              서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </Clause>

          <Clause no={9} title="개인정보 보호책임자">
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 관련 불만 처리 및 피해
              구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <List
              items={[
                '담당자: ', // TODO: 보호책임자 이름 기재
                '이메일: contact@joba.im',
              ]}
            />
          </Clause>

          <Clause no={10} title="고지의 의무">
            <p>
              본 개인정보 처리방침의 내용 추가, 삭제 및 수정이 있을 경우 시행 전 서비스
              공지사항을 통해 고지합니다.
            </p>
          </Clause>
        </div>

        {/* TODO: 게시 전 초안 문구 제거 */}
        <p className="mt-12 text-[14px] text-gray-500">
          본 문서는 초안이며, 실제 게시 전 담당자 확인 및 최신 수집 항목 반영이 필요합니다.
        </p>
      </div>
    </div>
  );
}
