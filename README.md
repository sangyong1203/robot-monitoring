# KORAD 로봇 통합 관제시스템

KORAD 경주 중저준위 방사성폐기물 처분시설에서 운영하는 이기종 로봇 6종 7대를 통합 관제하기 위한 프론트엔드 프로젝트입니다.

이 저장소에서는 Vue 기반 관리·관제 UI와 Mock 데이터를 개발합니다. 백엔드 서버, DB, 실제 로봇 제어, 실제 SMS 발송, Private LTE 인프라는 별도 담당자가 구현합니다.

## 현재 상태

- 요구사항 분석 및 프론트엔드 개발 기획 완료
- Vue 프로젝트 생성 전
- 실제 백엔드 API 미확정
- Mock API와 예시 JSON을 기준으로 UI 개발 예정

## 폴더 구성

```text
KORAD통합관제시스템/
  README.md
  docs/    요구사항 원문과 개발 기획서
  code/    프론트엔드 개발 코드
```

주요 문서는 다음과 같습니다.

- [프론트엔드 개발 기획서](docs/KORAD_통합관제시스템_개발기획서.md)
- [요구사항 정리본](docs/KORAD%20로봇%20통합%20관제시스템%20요구사항%20정리본.docx)
- [과업지시서](docs/과업지시서_KORAD%20로봇통합관제시스템%20개발_트리거테크_260807_v08.pdf)

## 개발 범위

프론트엔드 개발 범위는 다음과 같습니다.

- 로그인과 권한별 메뉴 및 화면 제어
- 기관, 사용자, 지역, 구역, 지도, 목적지 관리
- 로봇 모델과 운영 로봇 관리
- 지도 기반 통합 관제와 로봇 상태 모니터링
- 수동 제어와 자동 제어 요청 UI
- Activity, Task, Mission, Schedule 관리
- 운영·이벤트 코드와 알림 관리
- 관제 화면 팝업과 SMS 발송 요청 UI
- 로봇 운영 이력, 알림·이벤트, Mission 결과, 배터리·상태 통계
- 비상정지, Safe Stop, 통신 두절, 장애 대응 UI
- 백엔드 전달용 OpenAPI, 데이터 스키마, 예시 JSON

제어, SMS, 파일 저장, 인증·인가 등 실제 처리는 Mock으로 재현하며, 실제 API가 제공되면 API 함수와 데이터 매퍼를 교체합니다.

## 프론트엔드 구조

KORAD는 메뉴 중심 관리·관제 시스템이므로 Menu-based Architecture를 사용합니다.

```text
code/frontend/
  src/
    pages/
      auth/
      main/
      admin/
    components/
    composables/
    http/
    services/
    types/
    constants/
    mappers/
    stores/
    router/
    layouts/
    assets/
  contracts/
    openapi.yaml
    schemas/
    examples/
    enums.md
    backend-handoff.md
```

메뉴에서만 사용하는 UI와 로직은 해당 메뉴 폴더에 둡니다.

```text
{menu}/
  {Menu}Page.vue
  components/
  composables/
  service/
    {menu}.api.ts
    {menu}.types.ts
    {menu}.mapper.ts
    {menu}.mock.ts
    {menu}.mock.json
```

모든 폴더를 미리 만들지 않고 실제 메뉴 개발 시 필요한 구조만 추가합니다. 여러 메뉴에서 재사용되는 코드만 공통 폴더로 이동합니다.

## API와 Mock 원칙

화면 컴포넌트는 Mock JSON이나 HTTP 클라이언트를 직접 사용하지 않습니다. 메뉴별 `*.api.ts` 함수만 호출합니다.

```text
화면 컴포넌트
  -> 메뉴 API 함수
    -> Mock 모드: Mock JSON과 메모리 상태
    -> Server 모드: 실제 백엔드 API
  -> 데이터 매퍼
  -> 화면 모델
```

개발 환경은 다음 API 모드를 전제로 합니다.

- `VITE_API_MODE=mock`: Mock JSON과 시뮬레이션 사용
- `VITE_API_MODE=server`: 실제 백엔드 API 사용

Mock과 실제 API는 같은 함수 시그니처와 요청·응답 타입을 유지해야 합니다. 백엔드 응답과 화면 데이터 형태가 다를 때만 매퍼를 사용합니다.

## Mock 시나리오

주요 화면은 다음 상태를 확인할 수 있어야 합니다.

- 정상 데이터
- 빈 결과
- 로딩 지연
- 요청 실패
- 권한 없음
- 로봇 통신 두절과 재연결
- 로봇 위치, 배터리, 운행 상태 변화
- Mission 진행, 완료, 실패, 취소
- 침입, 화재, 낙상, 센서 이상 이벤트
- 비상정지와 Safe Stop 요청 결과
- SMS 발송 요청 성공과 실패

정적 JSON은 초기 상태로 사용하고, 등록·수정·삭제·제어 요청은 프론트엔드 메모리 상태를 변경하여 화면에 반영합니다.

## 백엔드 협업 계약

`code/frontend/contracts/`는 프론트엔드와 백엔드가 공유하는 계약입니다.

- API 경로와 요청 방식
- 요청·응답 타입과 필수값
- 오류 응답 형식
- enum과 상태 전이
- 검색, 정렬, 페이지 처리 방식
- 날짜, 시간대, 좌표와 센서 단위
- 실시간 이벤트 메시지 형식
- API별 요청·응답 예시 JSON

화면 개발과 함께 계약 문서를 갱신하여 백엔드 담당자가 Mock JSON과 스키마를 기준으로 API를 구현할 수 있게 합니다.

## 개발 시작 전 확인

Vue 프로젝트를 생성하거나 기존 프로젝트를 가져온 후 다음 항목을 먼저 확인합니다.

- 프로젝트 `README.md`와 로컬 개발 규칙
- Vue, Vite, TypeScript 버전
- UI 컴포넌트 라이브러리
- 라우터와 상태 관리 방식
- HTTP 클라이언트 사용 방식
- 코드 검사, 타입 검사, 빌드 명령

설치와 실행 명령은 실제 Vue 프로젝트와 `package.json`이 생성된 후 이 문서에 추가합니다. 확인되지 않은 라이브러리나 명령은 미리 가정하지 않습니다.

## 개발 원칙

- 화면보다 먼저 메뉴별 API 함수와 요청·응답 타입을 정의합니다.
- 컴포넌트에서 Mock 여부를 판단하지 않습니다.
- 로딩, 빈 결과, 오류, 권한 없음, 통신 두절 상태를 구현합니다.
- 위험 명령에는 확인 팝업과 비밀번호 재확인 UI를 제공합니다.
- 프론트엔드 권한 제어를 실제 보안 경계로 간주하지 않습니다.
- 새 라이브러리 도입과 프로젝트 구조 변경은 사전 확인 후 진행합니다.
- 실제 프로젝트의 기존 구조와 스타일을 우선합니다.

