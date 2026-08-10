# KORAD 로봇 통합 관제시스템 - 백엔드 연동 계약 및 인계 문서

## 1. 개요

본 문서는 KORAD 로봇 통합 관제시스템 프론트엔드와 백엔드 API 연동을 위한 계약 가이드입니다.
프론트엔드는 계약 우선(Contract-First) 구조로 개발되며, 개발 환경에서는 `VITE_API_MODE=mock`, 실제 연동 시 `VITE_API_MODE=server`로 전환합니다.

## 2. API 모드 전환 원칙

```text
화면 컴포넌트
  -> 메뉴별 API 함수 (*.api.ts)
    -> VITE_API_MODE=mock   : *.mock.ts & 메모리 상태 사용
    -> VITE_API_MODE=server : Axios HTTP 클라이언트 (*.mapper.ts 통해 서버 DTO 변환)
```

컴포넌트 소스코드는 `VITE_API_MODE`를 직접 판단하지 않으며, API 함수 시그니처와 요청·응답 TypeScript 타입을 동일하게 유지합니다.

## 3. 핵심 백엔드 협업 확정 항목

1. **공통 응답 포맷**:
   ```json
   {
     "success": true,
     "data": { ... },
     "error": null,
     "timestamp": "2026-08-10T12:00:00Z"
   }
   ```
2. **오류 응답 포맷**:
   ```json
   {
     "success": false,
     "data": null,
     "error": {
       "code": "AUTH_EXPIRED",
       "message": "인증 토큰이 만료되었습니다.",
       "details": []
     },
     "timestamp": "2026-08-10T12:00:00Z"
   }
   ```
3. **위험 명령 안전 검증**:
   - 비상정지(E-Stop), Safe Stop, 로봇/기관 삭제, 비밀번호 변경 명령 요청 시 사용자 비밀번호 재확인(`confirmPassword`) 파라미터 수신 및 백엔드 재검증 수행.
