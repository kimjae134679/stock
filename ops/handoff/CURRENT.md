# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.4.4 / MR044**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 정상 작동을 확인한 immutable Known-Good 롤백 기준판이다.** v0.4.4는 그 단일-renderer 원칙을 유지하면서 고봉밥 정리와 역사 상승·하락 사이클 시각화를 추가한 현재 배포판이다.

## 0. 기준판
- 현재 배포: **v0.4.4 / MR044**
- 현재 진입: `public/reports/stable-v044.html`
- renderer: `public/assets/app-v44.js`
- CSS: `app-v42.css` + `app-v43.css` + `app-v44.css`
- live: `public/app-live.html` → `stable-v044.html`
- latest: `public/reports/latest.html` → `stable-v044.html`
- **immutable rollback:** `public/reports/stable-v042-baseline.html`

## 1. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화하지 않는다.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 복원하지 않는다.
5. 로딩 100% 뒤 `#loadWrap` 전체가 높이 0으로 사라져 빈 칸을 남기지 않는다.
6. micro build mark 유지: 현재 `MR044`, 롤백 `MR042`.
7. UI 변경은 desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료로 판단하지 않는다.
8. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보/검증 + 사용자에게 직접 파일 제공.
9. 과거처럼 full-recovery/evaluation/layout/integrity/flow-guard를 안정 진입점에 겹쳐 올리지 않는다.
10. section 위치를 transform/translate로 보정해 빈 공간을 숨기지 않는다.

## 2. 단일 renderer 구조
`app-v44.js` 한 파일이 핵심 DOM 생성과 interaction을 소유한다.
- latest/intraday 핵심 데이터 로드
- 전체 17개 섹션 렌더
- quicknav
- fold/unfold
- ticker/theme click
- modal + scroll lock
- Android Back bridge
- universe tabs
- lazy TradingView
- optional phase/cycle/returns 보강
- progress / 구조 검증

v0.4.2 Known-Good의 핵심 원칙인 **DOM 생성 주체와 interaction 주체 동일**을 유지한다.

## 3. 필수 17개 섹션
`themes, action, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

## 4. 고봉밥 / 중복 방지
정보를 삭제하지 않고 첫 화면을 스캔 가능하게 만든다.
- Hero: `시장 핵심 평가`, `지금 할 일`, `피할 것`, 5개 score.
- 유사 장세는 details 아래.
- 독립 Phase는 Hero 요약을 반복하지 않는다.
- 행동 가이드는 현재 구간만 강조하고 나머지 7개 규칙은 details.
- 종목판은 phase/action badge 중심, 긴 note는 modal.
- 숨은테마는 `핵심 / 위험` 분리.
- 리서치는 기관/신뢰/근거/행동 구분.
- Macro object는 raw JSON 문자열 대신 key/value UI.
- 사용자에게 의미 없는 `렌더링 완료` 문구 금지.

자동화가 생성하는 UI 직접 노출 문장은 짧게 유지하고 상세 근거는 `changes`, `research`, `data_status`, `reference_sources`에 보존한다.

## 5. 역사 상승·하락 사이클 시각화 — v0.4.4
사용자 요구: 과거 상승장/폭락장이 **몇 거래일 지속됐고 몇 % 움직였는지**, 현재가 **몇 거래일차·몇 %인지**, 과거 대비 어디쯤인지 숫자와 그래프로 보여준다.

### 데이터
- builder: `scripts/build-cycle-history.mjs`
- output: `public/data/cycle-history.json`
- workflow: `.github/workflows/cycle-history.yml`
- source 우선순위: Yahoo Finance query1 → query2 → Stooq fallback
- 가능한 전체 일별 adjusted-close history 사용.
- ZigZag 반전 기준:
  - 일반 ETF 약 8%
  - 일반 종목 약 12%
  - TQQQ/SOXL 3x 약 18%
- 이는 미래 예측이 아니라 과거 구간을 동일 규칙으로 나누기 위한 설명용 기준이다.

### 보존 데이터
모든 확정 swing에 대해 다음 metadata를 보존한다.
- 상승/하락 방향
- 시작일/종료일
- 거래일/달력일
- 전체 등락률

통계:
- 평균/중앙값 거래일
- p25/p75 거래일
- 평균/중앙값 등락폭
- p25/p75 등락폭
- 현재 N거래일차
- 기간 진행도 / 변화폭 진행도 / 종합 진행도
- 상승/하락 초반·중반·후반·평균기간 초과 위치

### 그래프
`app-v44.js`가 데이터에서 SVG를 직접 그린다. 외부 chart iframe에 의존하지 않는다.
- X축: 시작 후 거래일
- Y축: 시작점 대비 누적 등락률 %
- 현재 경로: 밝은 선
- 대표 과거 같은 방향 swing: 회색 다중선
- 과거 중앙 기간/등락폭: 점선 기준
- 현재 위치 점 표시
- 기간/등락폭을 나란히 비교하는 bar rows 제공
- QQQ/SPY/SMH/SOXX/SOXL/TQQQ 등과 테마 proxy를 지원
- ticker/theme 상세 modal에도 동일 cycle chart 제공
- 과거 swing 날짜/거래일/등락률 표는 details 아래 보존

Theme proxy:
- index → QQQ
- compute → SMH
- network → ANET
- software → IGV
- power → GRID
- aggressive → SOXL
- defense → SHLD

## 6. cycle payload 성능 규칙
초기 v0.4.4 검토에서 모든 swing에 path를 중복 저장해 payload가 약 **45MB**까지 커지는 문제를 발견했다. 모바일에 부적합하므로 즉시 수정했다.

현재 규칙:
- 모든 swing의 날짜/기간/등락률 metadata는 **전부 보존**.
- 그래프용 path는 `current` + 최대 8개 largest declines + 최대 8개 largest rallies만 보존.
- path는 최대 60포인트 샘플.
- JSON minify.
- workflow에서 **8MB 초과 시 실패**.

현재 검증값:
- assets: **92**
- errors: **0**
- cycle-history payload: **3,054,462 bytes (~3.05MB)**
- cycle build run: **32333739866**, success.

## 7. 현재 Browser QA
Workflow: `.github/workflows/dashboard-qa-v44.yml`  
Script: `scripts/qa-dashboard-v44.mjs`

최신 성공 run: **32333966715**
- desktop/mobile
- load-collapse
- compact-hero
- action-compact
- cycle-trajectory
- cycle-days-pct
- cycle-extreme-paths
- cycle-payload-size
- cycle-modal
- fold-toggle
- blank-panel
- overflow

QA는 cycle payload 8MB 이하, QQQ current path, historical decline/rally visual path, swing metadata까지 검증한다.

## 8. Android / APK
Android workflow는 v0.4.4 standalone assets와 compact cycle payload를 검증한 뒤 빌드한다.

최신 compact-payload 포함 Android run: **32333998658**, success.  
Artifact ID: **9394014652**  
Artifact: `MarketRadar-v0.4.4-debug-apk`

검증된 APK 내부 필수 파일:
- `assets/public/reports/stable-v044.html`
- `assets/public/reports/stable-v042-baseline.html`
- `assets/public/assets/app-v44.js`
- `assets/public/assets/app-v44.css`
- `assets/public/data/cycle-history.json` = 3,054,462 bytes
- `assets/public/app-live.html`
- `assets/public/index.html`

APK SHA-256: `1b36ad432147bd8b57cd906a3fb47e163ff086b2181e324f4b0909c7e679ef77`

## 9. Android Back 계약
- modal open → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 `종료`만 exit

## 10. 데이터 자동화
Automation ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

매시간 자동화 수정 금지:
- HTML/JS/CSS/VERSION
- `cycle-history.json`
- `compounder-returns.json`
- `stable-v042-baseline.html`
- handoff UI 구조

## 11. 회귀 절차
새 UI에서 렌더가 깨지면 복구 스크립트를 추가하지 않는다.
1. `stable-v042-baseline.html` / `app-v42.js` / `app-v42.css`와 비교.
2. 최근 변경점만 격리.
3. desktop/mobile QA 통과.
4. cycle 기능 변경 시 path/metadata/payload-size QA도 통과.
5. Android 변경 시 APK 직접 확보 후 내부 assets와 SHA까지 검증.
