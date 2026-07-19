<img width="3327" height="957" alt="logo" src="https://github.com/user-attachments/assets/1b037bd2-68c6-4910-af5f-8152f299fcd0" />

# JOBAI-FRONTEND
---
# Front-end 팀원
1. 이지민
2. 김민정
---
## 사용한 기술 스택
- 개발 툴: VS Code
- 사용 언어: TypeScript
- 프레임워크/빌드 도구: React, Vite
- 상태 관리: Zustand, TanStack Query (React Query)
- HTTP 클라이언트: axios
- 스타일링: Tailwind CSS (커스텀 컬러 토큰 기반 디자인 시스템)
- 백엔드 연동: Spring Security 기반 API (쿠키/HttpOnly accessToken 인증)
- 작업물 저장 및 공유: GitHub
---
## 사용한 라이브러리
- TanStack Query: 서버 상태 캐싱/동기화(GET/PATCH/PUT/DELETE 요청 관리)
- Zustand: 인증 상태(authStore), 온보딩 상태(onboardingStore) 등 전역 클라이언트 상태 관리
- axios: API 요청 공통 클라이언트(쿠키 인증, 인터셉터)
- React Router: 페이지 라우팅, 보호 라우트(ProtectedRoute), 온보딩 게이트(OnboardingGate)
- STOMP/SockJS: 실시간 알림(WebSocket) 연동
---
## branch 전략
main branch와 하위 각 팀원별 branch 이용
- main branch: 배포 직전 단계의 브랜치. develop branch에서 개발이 끝나면 사용
- develop branch : main branch의 하위 브랜치로써, 개발 프로세스를 진행하는 브랜치
- 개인 branch : develop branch의 하위 브랜치로, 팀원 개개인이 담당한 기능을 개발하는 브랜치
---
## issue 전략
태그로 구분하며 두가지 종류의 이슈를 다룸
- [Request]: 개선이 필요한 사항에 대한 요청 이슈
- [Error]: 오류가 있는 경우에 대한 이슈
---
## Pull request 전략
태그로 구분하며 개발 및 기능 추가를 다룸
- [Develop]: 개발 완료에 대한 태그
- [Add]: 개선사항에 따른 기능 추가 태그
---
## commit 컨벤션
각 태그를 이용하여 어떤 내용이 변경되었는지를 나타내는 규칙
- [Feat]: 새로운 기능 추가
- [Fix]: 버그 수정
- [Docs]: 문서 수정
- [Design]: UI 수정
- [Rename]: 파일명, 폴더명 변경
- [Remove]: 파일 삭제
---
## 코드 컨벤션
코드 작성하면서 이름을 지정해야 하는 것들에 대한 규칙
- 컴포넌트, 타입, 인터페이스: PascalCase ex) ApplicationStatusTable
- 변수, 함수: camelCase ex) const handleUpdateItem
- 상수: UPPER_CASE ex) const STAGE_COLORS
- 커스텀 훅: use 접두사 + camelCase ex) useApplications, useNotificationSettings
---
## 개발 환경 세팅
- Node.js 버전: v24.14.0
- 패키지 매니저: npm
- 빌드 도구: Vite
- 실행(개발 서버): `npm install` → `npm run dev` (Vite dev server 구동)
- 빌드(프로덕션): `npm run build` (Vite가 정적 파일로 번들링)
