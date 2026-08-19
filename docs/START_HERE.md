# START HERE — Market Radar

현재 기준 버전: **v0.3.0**

## 가장 먼저 볼 것

- 실제 화면: https://kimjae134679.github.io/stock/
- 최신 HTML 직접 보기: https://kimjae134679.github.io/stock/reports/latest.html
- 운영 인수인계: `ops/handoff/CURRENT.md`
- 기계용 인수인계: `ops/handoff/current.json`

## 현재 실제 구조

GitHub Pages는 현재 **커밋된 `public/` 폴더를 그대로 배포**한다. 예전 문서처럼 static-report builder를 다시 실행하는 구조가 아니다.

```text
public/
  index.html                    앱/웹 진입점
  reports/latest.html           실제 최신 대시보드 HTML
  assets/report.css             기본 UI
  assets/mobile-fixes.css       모바일 safe-area/가로밀림 방지
  assets/ui-v30.css             v0.3.0 필수 동적 UI/대형 차트 스타일
  assets/ui-v30.js              기간버튼 제거/차트 일봉 기본/동적 UI 보강
  assets/full-recovery-v22.js   전체 대시보드 렌더링
  assets/evaluation-v26.js      상태/사이클 평가
  assets/layout-v28.js          우상향/전체추적/모달
  assets/returns-v29.js         우상향 1·2·3·5년 수익률
  assets/phase-status-v29.js    독립 Phase 보드
  data/latest.json              최신 전체 데이터
  data/live/intraday.json       오늘 시간 포인트
  data/live/phase-status.json   시장/테마 독립 Phase
  data/archive/YYYY/MM/         날짜별 최종 데이터
```

## 시간별 자동화

매시간 자동화는 **데이터 JSON만 갱신**한다. HTML/JS/CSS는 자동화가 덮어쓰지 않는다.

- `latest.json`
- `live/intraday.json`
- `live/phase-status.json`
- 당일 archive JSON

좌측 상단은 JSON의 `updated_at`을 읽어 `2026.08.19 22시 업데이트` 같은 형식으로 표시한다.

## UI 절대규칙

- PC/모바일 정보량 동일
- 버튼이 브라우저 기본 흰색 네모로 보이면 회귀 버그
- 큰 섹션은 접기/펼치기
- 클릭 가능한 종목/테마/ETF는 무반응 금지
- 상세 모달은 배경 스크롤 잠금
- 모달 열린 상태 뒤로가기 = 모달 닫기
- 실제 차트는 모바일에서도 크게 표시
- 자체 `1시간/일봉/주봉/월봉` 전환 버튼은 제거 상태 유지
- 실제 차트는 기본 일봉
- 전체추적은 `테마별 / 전부 모아보기`
- 우상향 후보는 테마별 + 순위별 + 주봉 차트 + 1/2/3/5년 누적수익률

## 파일 증가 규칙

- `03시.json`, `04시.html` 같은 시간별 복사본 금지
- 오늘 변화는 `live/intraday.json` 한 파일에 누적
- 날짜별 archive는 하루 JSON 1개
- APK/AAB를 저장소에 직접 커밋하지 않음

## Public 저장소 주의

실제 사용자 보유량/보유비중/계정정보/토큰/비밀번호/OTP/private key를 저장하지 않는다.
