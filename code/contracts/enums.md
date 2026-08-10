# KORAD 로봇 통합 관제시스템 - 상태값 및 Enum 정의

본 문서는 프론트엔드와 백엔드가 공유하는 시스템 핵심 상태값(Enum) 정의 문서입니다.

## 1. 사용자 등급 (UserLevel)

| 코드 | 명칭 | 설명 |
| --- | --- | --- |
| `SUPER_ADMIN` | 수퍼 관리자 | 시스템 전체 기관, 사이트, 최상위 설정 접근 권한 |
| `ADMIN` | 관리자 | 소속 기관 및 하위 기관 사용자, 지도, 미션, 코드, 알림 관리 권한 |
| `OPERATOR` | 관제 운영자 | 통합관제, 수동/자동 제어 명령 실행, 스케줄 관리, 이력 조회 권한 |
| `GENERAL_USER` | 일반 사용자 / 수신자 | 시스템 로그인 불가, 긴급 SMS 알림 수신 대상 또는 식별 그룹 |

---

## 2. 로봇 분류 (RobotType)

| 코드 | 명칭 | 대상 로봇 |
| --- | --- | --- |
| `FORKLIFT` | 무인지게차 | 무인지게차 1대 (실내 팰릿 상차 및 이송) |
| `AMR` | 저상형 AMR | 저상형 AMR 2대 (팰릿 연속 교대 운반) |
| `INDUSTRIAL_ARM` | 산업용 로봇 | 산업용 정밀 로봇 1대 (처분용기 드럼 장입) |
| `ECCENTRIC_ROBOT` | 편심 자율주행 로봇 | 편심 자율주행 로봇 1대 (시설물 중간 험지 감시) |
| `QUADRUPED_ROBOT` | 4족 보행 로봇 | 4족 보행 로봇 1대 (외곽 경계 및 복합 험지 감시) |
| `OUTDOOR_ROBOT` | 실외 자율주행 로봇 | 실외 자율주행 로봇 1대 (보행로 및 차도 감시) |

---

## 3. 통신 및 운영 상태 (CommunicationStatus & RobotStatus)

### 3.1 통신 상태 (CommunicationStatus)
- `ONLINE`: 정상 통신 수신 중 (주기 내 Heartbeat 수신)
- `STALE`: 통신 지연 발생 (주기 초과, 1차 주의 경보)
- `OFFLINE`: 통신 두절 (연결 끊김, 관제 경보 팝업 발생)

### 3.2 로봇 주행/작업 상태 (RobotStatus)
- `IDLE`: 운용 대기 중
- `RUNNING`: 임무/제어 명령 수행 중
- `CHARGING`: 충전 중
- `PAUSED`: 일시정지
- `STOPPED`: 안전 정지 (Safe Stop)
- `EMERGENCY`: 비상정지 (E-Stop)
- `ERROR`: 장비 고장 / 센서 오류

---

## 4. 미션 및 스케줄 상태 (MissionStatus)

- `READY`: 미션 대기
- `RUNNING`: 미션 수행 중
- `COMPLETED`: 정상 완료
- `FAILED`: 수행 실패 (오류 중단)
- `CANCELED`: 운영자 취소
