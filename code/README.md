# KORAD 로봇 통합 관제 시스템

KORAD 융합 로봇 실증사업의 통합관제 UI와 로컬 개발 API를 위한 초기 프로젝트입니다.

1차 개발의 고정 범위, 역할 분담, 공통 계약과 단계별 품질 게이트는
[KORAD 1차 개발 계획 v1.0](plan/KORAD_Phase1_Development_Plan_v1.0.md)을 기준으로 합니다.

## 기술 구성

- Vue 3, TypeScript, Vite
- Vue Router, Pinia, Element Plus, Lucide
- SCSS, ECharts, Vue Konva
- FastAPI, SQLAlchemy, SQLite

## 실행

프론트엔드:

```powershell
npm run dev
```

로컬 API:

```powershell
cd local-server
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install -r requirements-dev.txt
$env:APP_ENV = 'development'
$env:SEED_PASSWORD = '로컬에서 사용할 개발 비밀번호'
$env:CORS_ORIGINS = 'http://127.0.0.1:5173,http://localhost:5173'
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`requirements-dev.txt`는 실행 의존성인 `requirements.txt`를 포함하고
백엔드 테스트용 `pytest`, `httpx`를 추가로 설치합니다. 실행 환경만
구성할 때는 `python -m pip install -r requirements.txt`를 사용합니다.
`SEED_PASSWORD`는 저장소에 기록하지 않고 로컬 환경변수로만 설정합니다.

개발 서버는 `/api` 요청을 `http://127.0.0.1:8000`으로 전달합니다.

개발 환경 Seed 계정은 모두 `SEED_PASSWORD`에 지정한 비밀번호를 사용합니다.

| ID | 역할 |
| --- | --- |
| `admin` | `DEV_ADMIN` |
| `superadmin` | `SUPER_ADMIN` |
| `systemadmin` | `SYSTEM_ADMIN` |
| `operator` | `CONTROL_OPERATOR` |
| `support` | `FIELD_SUPPORT` |
| `viewer` | `VIEWER` |

`DEV_ADMIN` 계정은 `APP_ENV=development`일 때만 자동 생성되며 운영자
관리 화면에서 배정·수정·삭제할 수 없습니다. 앱 시작 시 Alembic
migration과 버전 기반 Seed가 자동 실행됩니다.

## 검증

```powershell
npm run type-check
npm run build
python -m compileall local-server\app
cd local-server
python -m pytest
```

## 프론트엔드 구조

```text
src/
├─ assets/                스타일·아이콘·이미지
├─ components/            여러 메뉴에서 재사용하는 UI 컴포넌트
│  └─ charts/             여러 화면에서 재사용하는 차트
├─ composables/           여러 화면에서 재사용하는 Vue 로직
├─ constants/             아이콘·색상 등 공통 상수
├─ features/              여러 메뉴가 함께 사용하는 도메인 기능·서비스
├─ http/                  공통 HTTP 클라이언트
├─ layouts/               앱 셸과 내비게이션
├─ pages/                 라우트 화면과 메뉴 전용 코드
├─ router/                라우트 정의와 인증 가드
├─ services/              앱 전역 서비스
├─ stores/                인증·메뉴·내비게이션 상태
├─ types/                 여러 영역에서 사용하는 타입과 외부 모듈 선언
└─ utils/                 Vue에 의존하지 않는 공통 유틸리티
```

구현 화면은 `src/pages/main/{screen}/`에 화면별 독립 폴더로 둡니다. 폴더명은 메뉴 Depth가 아니라
화면의 역할을 기준으로 하므로, 메뉴를 이동하거나 재구성해도 화면 파일을 함께 이동하지 않습니다.
각 화면 폴더에는 `XxxPage.vue`와 해당 화면 전용 `components/`, `service/`를 둡니다.

둘 이상의 메뉴에서 실제로 재사용하는 UI·로직·서비스는 `src/features/{feature}/`에 둡니다.
현재 모니터링, 로그, 시스템 관리 공용 코드는 각각 `features/monitoring`, `features/logging`,
`features/systemManagement`에 배치합니다.
공통 컴포넌트도 가능한 한 해당 `.vue` 파일을 직접 import하여 사용하지 않는 차트·인쇄 기능이 초기 번들에
포함되지 않도록 합니다.

## 공통 UI 기준

- 공통 패널은 `Panel.vue`를 사용합니다.
- 표는 Element Plus `el-table`을 기본으로 사용하며, 기존 `GridTable`은 사용하지 않습니다.
- 목록 화면은 필요에 따라 `TableToolbar`, `Pagination`, `TableRowActions`를 조합합니다.
- `PrintDialog`는 통계·보고 기능이 개발될 때까지 보류하며 1차 화면에서는 사용하지 않습니다.
- 파일 업로드 API 호출은 HTTP 옵션에 `progress: true`를 지정해 `FullscreenProgress`를 표시합니다.

```ts
await fetchApi().post('/api/maps', {
    payload: { body: formData },
    progress: true,
})
```

## 아이콘

일반 UI 아이콘은 `@lucide/vue`에서 필요한 아이콘만 named import합니다. 전체 아이콘을 wildcard import하지
않습니다. 메뉴처럼 문자열 키로 아이콘을 선택해야 할 때는 `src/constants/appIcons.ts`에 필요한 아이콘만
등록하고 `AppIcon`을 사용합니다. Lucide에 없는 KORAD 전용 아이콘만 `src/assets/icons`의 SVG를 사용합니다.

## 현재 메뉴

- 대시보드
- 로봇 모니터링
- 작업 관리
- 이벤트 관리
- 지도 관리
- 로봇 관리
- 로그 관리
- 시스템 관리

통계 및 보고, 별도 로봇 현황, 시스템 운영 로그는 1차 메뉴에서 제외합니다.
역할별 메뉴·라우트·API 권한은 PPT 6·7번 슬라이드의 권한표와
`plan/contracts/KORAD_Phase1_Common_Contracts_v1.0.md`를 기준으로 적용합니다.

## 구현 현황

G5 통합·인수 단계까지 구현되어 1차 범위의 로그인과 25개 업무 화면이 실제 페이지에 연결됩니다.

- 로그인, 대시보드
- 통합·작업·감시 로봇 모니터링
- 작업 현황, 미션 관리, 스케줄 관리
- 이벤트 현황·이력·설정·유형·알림 관리
- 맵·건물 구역·지도 구역 연결·지도 로봇 연결 관리
- 로봇 모델·등록 관리
- 로봇·이벤트 기술 원본 로그
- 메뉴·권한·운영자·기관·코드 관리

샘플 지도는 `public/sample_map/map.png`를 사용하며, 지도 메타데이터의
`width`, `height`, `resolution`, `origin_x`, `origin_y` 키와 meter 단위 로봇 좌표를 유지합니다.
권한과 활성 메뉴는 DB 설정을 로그인 시 불러오며, 서버 API도 같은 DB 권한을 즉시 집행합니다.

- WebSocket의 실제 로봇 스냅샷과 변경 로봇 DELTA를 작업·감시 모니터링에 반영합니다.
- 수동제어는 모니터링 화면의 모달에서 `MOVE_TO`, `SET_MODE`, `START_MISSION`,
  `SAFE_STOP` 명령을 전송하며, 명령 적용·거부 전이를 기술 로그로 추적합니다.
- 연계 미션은 서로 다른 유형의 로봇 2대 이상을 순서와 역할별로 구성하고
  `ACCEPTED → RUNNING → COMPLETED | FAILED` 실행 상태를 명시적으로 관리합니다.
- 미션 실행의 이벤트·알림과 현장 지원용 기술 원본 로그를 상호 추적할 수 있습니다.
- 26개 화면과 6개 역할의 메뉴·라우트·API 권한을 인수 테스트로 검증합니다.
- 맵 이미지는 PNG·JPEG·WebP 형식으로 최대 10MB까지 업로드할 수 있으며,
  업로드 중 `FullscreenProgress`가 진행률을 표시합니다.
- WebSocket 재연결과 sequence 누락 시 REST snapshot 재동기화를 수행합니다.

역할별 인수 결과와 검증 근거는
`plan/KORAD_Phase1_Acceptance_Checklist_v1.0.md`에서 확인할 수 있습니다.

## 로컬 백엔드

```text
local-server/app/domains/
├─ auth/
├─ events/
├─ logs/
├─ map/
├─ missions/
├─ monitoring/
├─ robot/
├─ robot_dashboard/
├─ schedules/
├─ system_admin/
└─ tasks/
```

로컬 API는 화면 개발과 통합 검증을 위한 구현입니다. 현재 로봇·지도·작업·미션·이벤트 데이터는
버전 기반 개발 Seed로 제공됩니다. 실제 로봇 통신, 영상, 이벤트 수집 및 외부 시스템 연계는
인터페이스 확정 후 연결해야 합니다.

## Docker 배포

최초 실행 전 예시 파일을 복사하고 `SEED_PASSWORD`를 설정합니다.

```powershell
Copy-Item .env.example .env
# .env의 SEED_PASSWORD를 안전한 값으로 수정
docker compose --env-file .env -f compose.deploy.yaml up -d
```

`.env`는 Git에서 제외되며, `.env.example`에는 실제 비밀번호를 기록하지 않습니다.
애플리케이션은 `.env` 파일을 직접 읽지 않고 Docker Compose 또는 실행 셸이 전달한
환경변수를 `os.getenv()`로 읽습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-docker-linux.ps1
```

상세 내용은 `deploy/README.md`를 참고합니다.
