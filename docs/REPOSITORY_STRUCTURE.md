# Repository Structure & Versioning

`kimjae134679/stock`은 **Public** 저장소다. 따라서 공개돼도 되는 시장/운영 정보만 저장한다.

```text
stock/
├─ VERSION
├─ package.json
├─ capacitor.config.json
├─ public/
│  ├─ index.html
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  ├─ data/
│  │  ├─ latest.json
│  │  └─ archive/YYYY/MM/YYYY-MM-DD.json
│  └─ reports/
│     ├─ latest.html
│     └─ YYYY/MM/US_Market_Daily_YYYY-MM-DD.html
├─ ops/
│  ├─ README.md
│  └─ handoff/current.json
├─ docs/
│  ├─ AUTOMATION.md
│  └─ REPOSITORY_STRUCTURE.md
└─ .github/workflows/
   ├─ pages.yml
   └─ android.yml
```

## 파일 증가 규칙

- 최신 시장 JSON은 항상 `public/data/latest.json` 하나.
- 날짜별 JSON/HTML은 `YYYY/MM` 폴더에만 보관.
- 운영 인수인계는 `ops/handoff/current.json` 최신본 하나를 기본으로 사용.
- 루트에 날짜별 파일을 만들지 않음.
- APK/AAB는 repo에 커밋하지 않고 Actions Artifact/Release로 관리.

## 버전

- `VERSION`은 앱/UI 버전.
- 매일 데이터만 바뀌면 앱 버전은 올리지 않음.
- UI/기능이 바뀔 때 `0.2.0 → 0.2.1 → 0.3.0`처럼 변경.
- 향후 Git tag/Release도 같은 버전명을 사용.

## 보안

Public repo이므로 아래는 절대 저장 금지:

- 실제 개인 보유종목/보유비중
- 계정/이메일/전화번호
- PAT/API Key/Secret
- 비밀번호/OTP/private key
- 공개하면 곤란한 개인 인수인계

개인 보유비중은 앱 localStorage에만 저장한다.
