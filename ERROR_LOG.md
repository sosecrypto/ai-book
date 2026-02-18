# Error Log

프로젝트에서 발생한 에러와 해결 방법을 기록합니다.

형식: `## [날짜] 에러 제목` → 증상 / 원인 / 해결

---

## [2026-02-18] useStreamingGeneration data.error 접근 오류

**증상**: streaming 응답에서 error 필드가 data 안에 있는데 data?.error로 접근하지 않아 런타임 에러 발생

**원인**: data 객체가 null일 수 있는 상황에서 optional chaining 누락

**해결**: `data.error` → `data?.error`로 수정 (`src/hooks/useStreamingGeneration.ts`)
