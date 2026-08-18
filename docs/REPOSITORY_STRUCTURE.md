# Repository Structure & Versioning

## 목표

파일이 매일 쌓여도 루트가 지저분해지지 않고, 최신 데이터와 과거 기록을 빠르게 찾을 수 있게 관리한다.

## Private 원본 저장소 (`kimjae134679/stock`)

```text
stock/
├─ public/
│  ├─ index.html
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  └─ data/
│     ├─ latest.json
│     └─ archive/
│        └─ 2026/
│           └─ 08/
│              ├─ 2026-08-19.json
│              ├─ 2026-08-20.json
│              └─ ...
├─ private/
│  ├─ handoff/
│  │  ├─ current.json
│  │  └─ archive/
│  │     └─ 2026/08/
│  └─ daily/
│     └─ 2026/08/
│        ├─ US_Market_Daily_2026-08-19.html
│        └─ ...
├─ docs/
├─ .github/workflows/
├─ capacitor.config.json
└─ package.json
```

### latest/current 원칙

- 앱이 읽는 최신 시장 데이터: `public/data/latest.json`
- 내부 인수인계 최신본: `private/handoff/current.json`
- 매일 새 파일을 루트에 만들지 않는다.

### 날짜별 보관 원칙

- JSON: `public/data/archive/YYYY/MM/YYYY-MM-DD.json`
- HTML: `private/daily/YYYY/MM/US_Market_Daily_YYYY-MM-DD.html`
- 인수인계 스냅샷이 정말 필요할 때만 `private/handoff/archive/YYYY/MM/` 사용.

## 공개 미러 저장소

무료 GitHub Pages가 필요하면 별도 Public 저장소(권장 이름: `stock-view`)를 사용한다.

공개 미러에는 아래만 허용:

```text
stock-view/
├─ index.html
├─ manifest.webmanifest
├─ sw.js
└─ data/
   ├─ latest.json
   └─ archive/YYYY/MM/YYYY-MM-DD.json
```

절대 공개 미러에 넣지 않는 것:

- `private/`
- 개인 실제 보유 비중
- 이메일/계정정보
- GitHub PAT/API 키/Secret
- 숨은 인수인계 원문

## APK 버전 관리

APK 파일을 매 버전 폴더에 커밋하지 않는다.

- 소스 버전: Git tag `v0.1.0`, `v0.1.1`, `v0.2.0`
- 설치 파일: GitHub Actions Artifact 또는 Release Asset
- 매일 시장 데이터 변경만으로는 APK 버전을 올리지 않음
- UI/기능이 바뀔 때만 앱 버전 증가

예시:

```text
v0.1.0  최초 모바일 대시보드
v0.1.1  모바일 UI 수정
v0.2.0  Push 알림/히스토리 기능 추가
```

## 사용자가 해야 하는 조작 최소화

초기 1회:
1. 공개 미러 저장소 `stock-view` 생성.
2. GitHub App이 그 저장소에도 접근 가능하도록 선택(필요한 경우).
3. Pages를 `stock-view`에서 1회 활성화.
4. APK 1회 설치.

이후:
- 일일 데이터 갱신: 자동
- 과거 기록 보관: 자동
- 앱 최신 데이터 로드: 자동
- APK 재설치: UI/앱 자체가 바뀔 때만
