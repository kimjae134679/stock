# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.0**  
기준일: **2026-08-19 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 가장 중요한 한 문장

**시장 자동화는 데이터 JSON만 갱신하고, UI 파일을 덮어쓰지 않는다. UI 변경은 사람이 명시적으로 요청했을 때만 `public/reports/latest.html` + `public/assets/`를 수정한다.**

이 규칙을 어기면 과거에 발생했던 `Hero 카드 하나만 남음`, `버튼 기본 흰색`, `차트 축소`, `기능 증발` 회귀가 다시 발생할 수 있다.

---

## 1. 현재 실제 배포 구조

현재 GitHub Pages는 **정적 빌더를 다시 실행하지 않는다.** `.github/workflows/pages.yml`이 커밋된 `public/` 폴더를 그대로 Pages artifact로 올린다.

- 실제 최신 화면: `public/reports/latest.html`
- 앱 진입점: `public/index.html` → `reports/latest.html?v=<version>`으로 이동
- 기본 CSS: `public/assets/report.css`
- 모바일 안전영역/가로밀림 방지: `public/assets/mobile-fixes.css`
- 전체 렌더링: `public/assets/full-recovery-v22.js`
- 평가 보강: `public/assets/evaluation-v26.js`
- 우상향/전체추적/모달 동작: `public/assets/layout-v28.js`
- 우상향 1/2/3/5년 수익률: `public/assets/returns-v29.js`
- 독립 Phase 보드: `public/assets/phase-status-v29.js`
- **v0.3.0 UI 고정 CSS: `public/assets/ui-v30.css`**
- **v0.3.0 UI 고정 JS: `public/assets/ui-v30.js`**

`interval-fix-v27.js`는 파일이 남아 있어도 **latest.html에서 로드하지 않는다.** 사용자 요청에 따라 일봉/주봉/월봉 수동 전환 버튼은 제거했다.

---

## 2. 데이터 source of truth

- `public/data/latest.json`: 전체 최신 시장/테마/종목/ETF/평가 데이터
- `public/data/live/intraday.json`: 당일 시간별 포인트
- `public/data/live/phase-status.json`: 시장/테마 독립 Phase + `그래서 지금은?` 행동
- `public/data/archive/YYYY/MM/YYYY-MM-DD.json`: 날짜별 최종 스냅샷

미확인 가격은 추정하지 않는다. 미국 정규장이 새로 열리지 않았으면 검증된 직전 종가를 유지한다.

---

## 3. 매시간 자동화 규칙

자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

- 최고 빈도: 매시간
- 시장 데이터/Phase/평가 JSON만 갱신
- `updated_at`을 실제 완료 KST로 기록
- 좌측 상단은 `YYYY.MM.DD H시 업데이트` 형식으로 표시
- 주요 경보/Phase 변화가 있을 때만 채팅 알림
- **HTML/JS/CSS를 매시간 자동으로 재작성하지 않는다**
- 데이터 커밋 때문에 Pages는 재배포될 수 있지만 UI 코드 자체는 그대로 유지

---

## 4. 절대 보존해야 하는 UI/기능

1. 시장 Hero + 점수
2. 시장/테마 독립 Phase 보드
3. 테마 흐름
4. `지금 위치에서 무엇을 할지` 행동 코멘트
5. 시간별 매수타이밍 + QQQ 가격 그래프
6. 실제 TradingView 차트
7. 종목/ETF 검색·상세
8. 유명·초대형 핵심주
9. 안정적·꾸준한 우상향 후보
   - 테마별 묶음
   - 순위별 묶음
   - 각 후보 주봉 차트 상시 표시
   - 1/2/3/5년 누적 주가 수익률
10. 전체추적 유니버스
   - `테마별`
   - `전부 모아보기`
11. 숨은 테마
12. ETF
13. 비중
14. 리서치/기관/원문
15. 검증/Replay
16. 거시
17. 각 큰 섹션 접기/펼치기
18. 종목/테마/ETF 클릭 시 상세 모달
19. 모달 열린 상태에서 배경 스크롤 금지
20. 모달 열린 상태의 브라우저/Android 뒤로가기 = 앱 종료가 아니라 모달 닫기

---

## 5. v0.3.0에서 고친 모바일 회귀

### 버튼이 흰색 네모로 깨지던 문제

원인: v0.2.9에서 v0.2.8의 필수 동적 UI 스타일 일부가 `latest.html`에서 빠졌고, 동적으로 생성되는 `.fold-btn`, `.ticker-chip`, 전체추적/대표주 버튼이 브라우저 기본 버튼 스타일로 노출됨.

해결: 필수 동적 스타일을 `ui-v30.css`로 독립시켜 HTML 인라인 스타일 유실과 관계없이 항상 로드.

### 실제 차트가 너무 작던 문제

해결: `big-tv`, QQQ 실제차트, 우상향 주봉 차트를 PC/모바일 모두 크게 고정. 모바일 실제 종목 차트는 대략 화면 높이의 58~62% 수준까지 사용하고, QQQ 큰 실제차트도 최소 480~540px 이상 확보.

### 일봉/주봉/월봉 버튼 무반응

사용자 결정: **버튼 자체 삭제.**

- 자체 `1시간 / 일봉 / 주봉 / 월봉` 버튼은 표시하지 않음
- 실제 차트는 기본 **일봉**으로 열림
- TradingView iframe 자체 인터페이스는 외부 위젯 영역이므로 그대로 둠

---

## 6. 모바일 QA 합격 기준

아래 중 하나라도 깨지면 배포 성공으로 보지 않는다.

- 접기/펼치기 버튼이 흰색 기본 HTML 버튼으로 보이지 않음
- 대표주 버튼이 서로 겹치거나 텍스트가 버튼 밖으로 넘치지 않음
- 우상향 카드가 화면 폭 안에 들어옴
- 실제 차트가 작은 썸네일 수준으로 축소되지 않음
- 상세 모달의 `닫기`가 안전영역에 가리지 않음
- 모달을 끝까지 스크롤해도 뒤 페이지가 움직이지 않음
- 뒤로가기 한 번으로 모달만 닫힘
- 자체 기간변경 버튼(`1시간/일봉/주봉/월봉`)이 존재하지 않음
- 페이지 전체가 좌우로 밀리지 않음
- PC와 모바일의 정보량은 동일

---

## 7. Phase 판정 규칙

시장 전체 하나로 모든 테마를 묶지 않는다.

최소 독립 평가:
- 미국 전체시장
- Nasdaq/성장주
- 반도체
- AI 네트워크·광통신
- AI 소프트웨어·클라우드
- AI 전력·데이터센터
- 레버리지
- 주요 테마/주요 종목

단계:
`🔥 극단저점/투매 → 🟢 저점후보 → 🟢 바닥형성/확인 → 🟡 저점에서 상승중 → 🟡 중간상승 → 🟠 고점근처/조정 → 🔴 과열/분배 → 🔴 추세붕괴/급락`, 필요 시 `⚪ 횡보/불명확`.

모든 평가에는 **`그래서 지금은?`** 행동을 붙인다. 사이클형이 아닌 구조성장/품질주는 억지로 사이클에 넣지 말고 `현재 상태 평가`로 표시한다.

---

## 8. 버전/배포 규칙

- UI 기능 변경 시 `VERSION`, `public/index.html`, `public/reports/latest.html` 버전을 함께 맞춘다.
- CSS/JS 캐시 키도 같은 배포 번호로 변경한다.
- `.github/workflows/pages.yml`에서 필수 파일 존재와 JS 문법을 검증한다.
- 사용하지 않는 구형 파일이 저장소에 남아 있어도 **latest.html에서 로드하지 않으면 영향 없음**.
- 수정 후 사용자가 볼 주소를 항상 함께 제공한다:
  - `https://kimjae134679.github.io/stock/`
  - `https://kimjae134679.github.io/stock/reports/latest.html?v=<version>`

---

## 9. 하지 말아야 할 것

- 안정화 목적으로 기능을 통째로 삭제
- 시장 자동화가 HTML/JS/CSS를 재생성/덮어쓰기
- 모바일에서 정보량을 줄임
- 클릭 가능한 항목을 무반응으로 둠
- 작동하지 않는 버튼을 UI에 남김
- 데이터가 없는데 숫자를 추정
- Public 저장소에 사용자 실제 보유수량/계정/비밀키 저장
