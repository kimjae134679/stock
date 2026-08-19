# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.5**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 시장 데이터 자동화와 UI 개발을 섞지 않는다.

## 0. 절대 원칙

1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION을 수정하지 않는다.
2. 안정화한다고 기존 기능을 삭제하거나 Hero 하나짜리로 단순화하지 않는다.
3. 현재 VERSION보다 낮은 버전이 사용자 화면에 보이면 정상본이 아니다.
4. APK는 Actions 성공 + Artifact 실제 존재 + APK 직접 확보 전에는 완료라고 말하지 않는다.
5. 모바일/PC 정보량은 동일하다.
6. 작동하지 않는 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
7. 로딩 문구만 띄우고 무한 대기시키지 않는다. **실제 진행 단계와 실패 지점을 사용자에게 보여준다.**

## 1. 현재 진입 구조

- 기본 진입: `public/index.html`
- 최신 호환 주소: `public/reports/latest.html` → `stable-v035.html`로 이동
- **현재 안정 진입: `public/reports/stable-v035.html`**
- 렌더러: `public/assets/full-recovery-v22.js`
- 평가: `public/assets/evaluation-v26.js`
- 전체추적/우상향/모달: `public/assets/layout-v28.js`
- 우상향 1Y/2Y/3Y/5Y 수익률: `public/assets/returns-v29.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI: `public/assets/ui-v30.css`, `public/assets/ui-v30.js`
- 역사 주기: `public/assets/cycle-history-v34.js`
- **v0.3.5 완료검사/네이티브 Back 브리지: `public/assets/app-runtime-v35.js`**

## 2. v0.3.5 실제 로드 진행률 — 고정 요구

사용자가 `로딩 중` 화면에서 실제로 진행 중인지 알 수 없다고 지적했다. v0.3.5부터 안정 페이지 자체에 진행바를 내장한다.

표시 예:
- `00.001%`
- `05.000%`
- `43.000%`
- `98.500%`
- `100.000%`

중요: **시간 경과에 따라 가짜로 숫자를 올리지 않는다. 실제 이벤트가 끝날 때만 증가한다.**

현재 단계 가중치:
1. HTML 셸 준비
2. 기존 service worker / CacheStorage / last-good 캐시 제거
3. `latest.json` preflight 성공
4. `intraday.json` preflight 성공
5. `phase-status.json` 확인(선택)
6. `cycle-history.json` 확인(선택)
7. `full-recovery-v22.js` 실제 script `onload`
8. 메인 렌더러가 실제 DOM에 최소 8개 주요 섹션을 생성했는지 대기/확인
9. evaluation/layout/returns/phase/ui/cycle-history 런타임을 순차 로드
10. `app-runtime-v35.js`가 섹션 수 + 페이지 높이 검증
11. 성공 시 `100.000%` + `정상 · v0.3.5 전체 대시보드 로드 완료`

실패하면 진행률을 멈추고 빨간 bar + 정확한 실패 단계/파일/HTTP 오류를 표시한다. 검은 화면이나 무한 `로딩 중`을 정상으로 취급하지 않는다.

## 3. v0.3.4~v0.3.5 캐시/배포 회귀 대응

실제 사용자 화면에서 저장소보다 낮은 v0.3.0 셸이 다시 나타나거나 완전 빈 화면이 나온 적이 있다.

현재 대응:
- 새 파일명 `stable-v035.html` 사용.
- `index.html`은 모든 기존 service worker를 unregister하고 CacheStorage와 `mr:last-good*`를 지운 뒤 `stable-v035.html?fresh=<timestamp>`로 이동.
- 안정 페이지는 service worker를 새로 등록하지 않는다.
- `latest.html`은 안정 파일로 이동하는 호환 진입점만 담당.
- JS는 안정 페이지의 인라인 로더가 **순차적으로** 로드하고 각각 실제 `onload/onerror`를 진행률에 반영.
- 메인 렌더가 10초 내 최소 8개 섹션을 만들지 못하면 실패로 표시하고 자동 무한 reload하지 않는다.
- `public/sw.js`는 레거시 cache killer일 뿐이며 데이터를 캐시하지 않는다.

## 4. 역사적 상승/하락 주기 분석 — 필수 기능

데이터: `public/data/cycle-history.json`  
생성기: `scripts/build-cycle-history.mjs`  
Workflow: `.github/workflows/cycle-history.yml`

목표:
- QQQ 및 가능한 추적 종목/ETF의 최대 가용 일별 이력을 분석.
- 과거 상승/하락 구간을 시작일/종료일/거래일/달력일/등락률로 최근순 저장.
- 현재 `상승 N거래일차` 또는 `하락 N거래일차` 표시.
- 같은 방향의 과거 평균/중앙값 기간 표시.
- 기간 진행도 / 변화폭 진행도 / 종합 진행도 표시.
- `상승 초반/중반/후반·고점 접근/평균기간 초과 연장상승`, 하락 대응 문구 표시.
- 이력 전체를 상세 모달에서 날짜순 확인.

현재 기본 ZigZag reversal threshold:
- 일반 ETF 약 8%
- 일반주 약 12%
- 3x 레버리지 약 18%

이는 미래 종료일 예측값이 아니라 역사 비교 기준이다.

Phase proxy:
- 미국 전체시장 → SPY
- Nasdaq/성장주 → QQQ
- 반도체 → SMH
- 네트워크·광통신 → ANET
- 소프트웨어·클라우드 → IGV
- 전력·데이터센터 → GRID
- 레버리지 → TQQQ

## 5. 절대 삭제 금지 기능

- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase
- 각 상태의 `그래서 지금은?`
- 시간별 매수타이밍 + QQQ 가격
- 큰 실제 TradingView 차트
- 종목/ETF 상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보: 테마별 + 순위별 + 주봉 + 1/2/3/5년 누적수익률
- 전체추적: `테마별 / 전부 모아보기`
- 숨은테마
- ETF/비중/리서치/기관/원문/검증/Replay/거시
- 접기/펼치기
- 모달 배경 스크롤 잠금
- 상세 모달 Android Back → 모달 닫기
- 루트 Android Back → `앱을 종료하시겠습니까?`
- 역사 주기 현재 일차/평균/진행률/과거 이력
- **v0.3.5 실제 로드 퍼센트 + 진행바 + 실패 지점 표시**

## 6. 매시간 자동화

자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 갱신:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive

`cycle-history.json`은 별도 일 단위 GitHub Action이 계산. 시간별 자동화가 덮어쓰지 않는다.

데이터 갱신 시 HTML/JS/CSS/VERSION을 수정하지 않는다. 좌측 상단은 실제 `updated_at`을 `YYYY.MM.DD H시 업데이트`로 표시.

## 7. QA 합격 기준

- 직접 진입: `reports/stable-v035.html`
- 화면 버전 `v0.3.5`
- 로드 패널이 즉시 `00.001%` 근처에서 표시
- 실제 단계가 완료될 때만 퍼센트 상승
- 핵심 데이터/스크립트 실패 시 정확한 실패 지점 표시
- 정상 시 `100.000%`
- 최종 상태 `정상 · v0.3.5 전체 대시보드 로드 완료`
- Hero 하나로 끝나지 않고 최소 8개 주요 섹션 렌더
- 구버전 v0.3.0 등으로 되돌아가지 않음
- 버튼 기본 흰색/겹침 없음
- 실제 차트 크게 유지
- 자체 기간변경 버튼 없음
- 종목 상세에 역사 주기 데이터 표시(데이터 존재 시)
- Android Back 계약 유지

## 8. 배포/APK

Pages: `.github/workflows/pages.yml`은 committed `public/`을 직접 배포.

Android: `.github/workflows/android.yml`은 `stable-v035.html`, `app-runtime-v35.js` 존재와 로딩 진행률 문구를 검증하고 Capacitor sync + 네이티브 Back 패치 후 APK를 빌드한다.

APK 완료 정의: Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 파일 직접 제공.
