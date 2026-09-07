# ChungYack v0.9.0 — 찜 우선 UI 인수인계

갱신: 2026-09-07 KST

## 사용자 확정 UX

- 하단 `일정` 탭은 사용자 화면에서 제거하고 같은 내부 page key(`schedule`)를 `♥ 찜` 탭으로 재사용한다.
- 사용자 노출 용어 `저장`은 `찜`으로 통일한다.
- 기존 데이터 키 `chungyack.opportunity.saved.v1`은 호환성 때문에 변경하지 않는다. 표시 용어만 `찜`이다.
- 찜/추적/숨김/필터/신청 기록은 기존 localStorage + Supabase 동기화를 그대로 유지한다.
- 공고 목록 우선순위는 `추적중/신청함 > 찜 > 나머지`다. 같은 우선순위 안에서는 기존 순서를 유지한다.
- 찜하면서 숨긴 공고도 찜 탭에서 제거하지 않고 `숨김` 배지를 붙여 표시한다.
- 찜/추적 상태를 큰 문장형 버튼으로 표시하지 않는다. 하트, 체크/플러스, 공고, 숨김 아이콘과 짧은 라벨을 사용한다.
- 홈의 빠른 액션도 같은 소형 아이콘 규칙을 사용한다.

## 구현 파일

- `public/assets/app-v90-favorites.js`
- `public/assets/app-v90-favorites.css`
- `public/assets/app-v88-sync-config.js`에서 v0.9.0 overlay를 동적 로드한다.
- 서비스워커 cache: `chungyack-live-v0.9.0-r1`

## 배포 검증

GitHub Pages `Deploy Market Radar and ChungYack Pages` run `34077559807` SUCCESS.

## 공고 탐색 우선 규칙

향후 공고 탐색/갱신 시 Supabase 개인 상태의 `추적중/신청완료` 공고와 `찜` 공고를 먼저 재검증한다. 특히 접수 마감, 결과 발표, 서류 제출, 계약 일정 변동을 우선 확인한다.

개인 찜/추적 원문이나 사용자 개인 상태를 공개 GitHub 데이터 파일에 기록하지 않는다. 공개 공고 데이터와 개인 상태는 계속 분리한다.
