# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.5.0 / MR050**  
기준일: **2026-08-21 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 정상 작동을 확인한 immutable Known-Good 롤백 기준판이다.** v0.5.0은 v0.4.4 안정 core renderer를 유지하고 기존 기능을 삭제하지 않은 채 사이클 해석만 additive enhancement로 보강한다.

## 0. 현재 기준
- 배포: **v0.5.0 / MR050**
- 안정 진입: `public/reports/stable-v050.html`
- core renderer: `public/assets/app-v44.js`
- v45~v49 기존 enhancement는 유지
- v50: `public/assets/app-v50-enhance.js` + `public/assets/app-v50.css`
- live/latest/index 모두 v0.5.0으로 연결
- immutable rollback: `public/reports/stable-v042-baseline.html`

## 1. 절대 원칙
1. 매시간 시장 자동화는 시장 JSON만 갱신. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
5. 로딩 완료 뒤 `#loadWrap` 전체 높이 0. 빈 칸 남기지 않음.
6. micro build mark 유지: 현재 `MR050`, 롤백 `MR042`.
7. desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료 선언 금지.
8. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보/검증 + 사용자에게 파일 제공.
9. `3x 사지마`, `매수 금지` 같은 명령조 위험문구 금지. 조건/이유 중심 중립 표현 사용.
10. 시장 전체 Phase를 모든 자산에 강제로 적용하지 않는다.

## 2. v0.5.0 사이클 핵심 계약
사용자 의도는 **과거 장세를 실제 모습 그대로 고정하고, 최근 하락까지 포함한 현재 경로를 그 위에 맞춰 현재 위치를 보는 것**이다.

### 절대 하지 말 것
- 제목을 `상승-폭락-상승-폭락`처럼 기계적으로 나열하지 않는다.
- 현재 17일짜리 반등만 떼어 `상승장`이라고 부르지 않는다.
- 과거 장세를 0~100 축으로 늘이거나 줄여 현재에 맞추지 않는다.
- 최근 급락/조정을 현재 문맥에서 잘라내지 않는다.

### v0.5.0 방식
- 메인 제목은 **`시장 파동 비교`**처럼 자연스럽게 쓴다.
- 과거 비교 단위는 실제 큰 파동 4개로 구성된 하나의 역사 장세 창이다.
- 내부 구조는 `1차 상승 → 하락/조정 → 재상승 → 다음 하락/조정`이지만 제목에 이 순서를 그대로 쓰지 않는다.
- 각 과거 장세는 **실제 거래일 + 실제 누적 등락 경로** 그대로 고정한다.
- 여러 과거 장세를 **한 그래프에 서로 다른 색으로 겹친다.**
- 초록 굵은 선은 현재 실제 경로이며, **현재선만** 시간축/진폭을 조절해 가장 닮은 과거 위치에 맞춘다.
- 현재 경로는 최근 완료된 하락 구간을 반드시 포함한다.
- 현재와 날짜가 겹치는 과거 템플릿은 비교 후보에서 제외한다.
- 각 과거 선에는 현재가 대응하는 위치에 점을 찍는다.
- 가장 닮은 과거 기준으로 `1차 상승 초/중반`, `첫 고점 접근`, `첫 하락`, `첫 저점 접근`, `재상승 초/중반`, `두 번째 고점 접근`, `다음 하락`, `다음 저점 접근`처럼 해석한다.
- 이는 역사적 형태 비교이며 미래 고점/저점 날짜 예측이 아니다.

### 현재 QQQ 데이터 해석
`wave-cycles.json` 최신 생성값 기준:
- 현재 문맥 시작: **2026-03-30**
- 2026-03-30 → 2026-06-02: +33.65%
- 최근 의미 있는 하락: **2026-06-02 → 2026-07-29, 40거래일, -11.22%**
- 2026-07-29 → 2026-08-20: **17거래일, +7.44% 반등**
- 따라서 UI는 현재를 단순 `상승장`으로 단정하지 않고 **`최근 급락성 조정 이후 반등·재상승`**으로 설명한다.
- `폭락`은 보통 더 큰 낙폭에 쓰고, -10%대는 UI에서 `급락성 조정`으로 구분한다.

## 3. 데이터
### 기존 swing
- builder: `scripts/build-cycle-history.mjs`
- output: `public/data/cycle-history.json`
- assets: 92

### 기존 full-cycle
- builder: `scripts/build-cycle-full.mjs`
- output: `public/data/cycle-full.json`
- assets: 13

### v0.5.0 multi-leg wave
- builder: `scripts/build-wave-cycles.mjs`
- overlap filter: `scripts/filter-wave-history.mjs`
- output: `public/data/wave-cycles.json`
- assets: 13
- QQQ historical fixed templates: 최신 검증 기준 22개
- 현재와 겹치는 템플릿 제거
- 전체 cycle payload 최신 검증 기준 약 5.28MB
- `.github/workflows/cycle-history.yml`이 생성/검증/배포
- 매시간 시장 자동화는 이 파일을 절대 덮어쓰지 않는다.

## 4. 렌더 구조
`app-v44.js`가 핵심 DOM/interaction 소유권을 유지한다.
- 17개 섹션
- quicknav/fold/modal/Android Back/tabs
- lazy TradingView
- progress/구조검증

사이클 enhancement 순서:
`v45 → v46 → v47 → v48 → v49 → v50`

v50은 메인 사이클 영역에서 v49를 삭제하지 않고 `이전 단일 사이클 매칭/상세 비교 보기` details 아래로 접는다.

core `app-v44.js`가 capture 단계에서 `closest('[data-ticker]')`를 ticker 클릭으로 처리하므로 그래프 내부 비-ticker 버튼에 `data-ticker` 속성을 사용하지 않는다.

## 5. 필수 17개 섹션
`themes, action, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

## 6. UI/문구 규칙
- Hero: 시장 핵심 평가 / 지금 할 일 / 피할 것 / 5개 score.
- 고봉밥 텍스트 금지. 같은 원인·숫자 반복 금지.
- `70` 같은 숫자 단독 표기 금지. `/100 + 말뜻` 병기.
- Macro raw JSON 금지.
- 위험관리는 레버리지 자체를 일괄 금지하지 않고 기초지수/변동성/추세 조건을 설명.
- 사이클에서 `상승장`이라는 표현은 **최근 한 번의 상승 swing만으로 사용하지 않는다.** 최근 하락 문맥과 더 큰 추세를 함께 본다.

## 7. Browser QA — v0.5.0
Workflow: `.github/workflows/dashboard-qa-v50.yml`  
Script: `scripts/qa-dashboard-v50.mjs`

필수 검사:
- desktop 1440×1000 / mobile 390×844
- v0.5.0 / MR050
- load gap 0
- 과거 고정 장세 3개 이상을 **한 그래프에 겹쳐 표시**
- 초록 현재선 1개
- 각 역사선의 현재 대응점
- 최근 하락 + 그 뒤 반등 문구
- 현재를 새 장기 상승장으로 단정하지 않는 문구
- 3/4/5개 비교 전환
- 이전 v49 상세 보존
- modal v50
- blank panel 없음
- document overflow 없음

Playwright `waitForFunction`은 `page.waitForFunction(fn, null, {timeout})`처럼 options를 세 번째 인자로 전달한다.

## 8. Android
Workflow: `.github/workflows/android.yml`
- stable-v050 + v50 assets + `wave-cycles.json` 포함
- v0.4.2 rollback baseline 포함
- native Back/exit confirmation 유지
- persistent debug signing key 유지

Android Back 계약:
- modal open → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 `종료`만 exit

## 9. 매시간 자동화
Automation ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

수정 금지:
- HTML/JS/CSS/VERSION
- `cycle-history.json`
- `cycle-full.json`
- `wave-cycles.json`
- `compounder-returns.json`
- `stable-v042-baseline.html`

## 10. 회귀 절차
1. v50 문제면 v50 격리 → v49 확인.
2. v49 문제면 v48 확인.
3. 이후 v47 → v46 → v45 → v44 순서.
4. core 문제면 v0.4.2 immutable baseline과 비교.
5. 실제 desktop/mobile Browser QA.
6. cycle 변경 시 `과거선 고정 / 한 그래프 겹침 / 최근 하락 포함 / current-only fit / exact date / 문구` 검사.
7. Android 변경 시 최신 커밋 포함 APK를 직접 확보하고 SHA256 검증.
