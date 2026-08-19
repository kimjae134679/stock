# Automation Architecture — v0.3.0

## Hourly market automation

자동화 지원 최대 빈도인 **매시간** 실행한다.

갱신 대상:

- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- `public/data/archive/YYYY/MM/YYYY-MM-DD.json` (같은 날 최신 상태)

매 실행마다 `updated_at`을 실제 완료 KST로 기록한다. 좌측 상단은 이 값을 읽어 `YYYY.MM.DD H시 업데이트` 형식으로 보여준다.

## 가장 중요한 경계

**시간별 시장 자동화는 HTML/JS/CSS를 수정하지 않는다.**

현재 Pages는 `.github/workflows/pages.yml`에서 커밋된 `public/` 폴더를 그대로 배포한다. 데이터 JSON이 바뀌면 Pages 재배포는 일어나지만 UI 파일 내용은 바뀌지 않는다.

UI 변경은 사용자가 명시적으로 요청했을 때 별도 버전 릴리스로 수행한다.

## Phase 자동화

시장 전체 하나로 퉁치지 않고 최소 다음을 독립 평가한다.

- 미국 전체시장
- Nasdaq/성장주
- 반도체
- AI 네트워크·광통신
- AI 소프트웨어·클라우드
- AI 전력·데이터센터
- 레버리지
- 주요 테마/종목

각 상태에 `그래서 지금은?` 행동 코멘트를 기록한다. 구조성장/품질형 자산은 억지로 사이클에 넣지 않는다.

## Alert

평소 데이터 갱신은 조용히 수행하고, 주요 지수/테마/종목 급변, 금리·유가·거시 충격, Phase 전환 등 의미 있는 변화가 있을 때만 사용자에게 짧게 알린다.

## APK

시장 데이터 갱신만으로 APK를 다시 빌드할 필요는 없다. UI/index/assets/manifest/Capacitor/VERSION 등 앱 구성 변경 때만 Android 빌드를 수행한다.

## Archive retention

- 시간별 별도 HTML/JSON 복사본 금지
- 당일 시간 변화는 `live/intraday.json` 한 파일
- 날짜별 최종 데이터는 `archive/YYYY/MM/YYYY-MM-DD.json`
- 인수인계 최신본은 `ops/handoff/CURRENT.md`와 `ops/handoff/current.json`

## Public repository warning

개인 자산정보, 계정정보, 비밀키, PAT/API secret, 비밀번호, OTP/private key를 GitHub에 저장하지 않는다.
