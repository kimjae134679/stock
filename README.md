# Market Radar

개인용 미국 주식/ETF 시장 대시보드 프로젝트.

## 보안 구조

- `stock` 저장소는 **Private 유지**.
- 실제 개인 보유비중은 GitHub에 저장하지 않고 앱의 `localStorage`에만 저장.
- PAT/API Secret/계정정보는 APK·웹·JSON에 넣지 않음.
- 무료 GitHub Pages를 쓰려면 별도의 **공개용 미러 저장소**를 만들어 비민감 파일만 배포하는 방식을 사용.

## 폴더 구조

```text
stock/                         # PRIVATE 원본 저장소
├─ app/                        # 앱/웹 소스가 커지면 이쪽으로 정리
├─ public/                     # 비민감 대시보드 빌드/샘플 데이터
│  ├─ index.html
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  └─ data/
│     ├─ latest.json           # 항상 최신 1개
│     └─ archive/
│        └─ YYYY/MM/           # 날짜 자료는 연/월 단위로 분리
├─ private/                    # 절대 공개 미러로 복사하지 않음
│  ├─ handoff/
│  │  ├─ current.json          # 최신 인수인계 1개
│  │  └─ archive/YYYY/MM/      # 필요할 때만 역사 스냅샷
│  └─ daily/YYYY/MM/           # 날짜별 전체 HTML 원본
├─ docs/                       # 구조/운영 문서
├─ .github/workflows/          # 자동 빌드
├─ capacitor.config.json
└─ package.json
```

## 파일이 많아지지 않게 하는 규칙

1. 루트에는 실행에 필요한 핵심 파일만 둔다.
2. 최신 데이터는 항상 `latest.json`, 최신 인수인계는 항상 `current.json` 한 개만 사용한다.
3. 날짜별 기록은 `YYYY/MM/`로 분리한다. 예: `archive/2026/08/2026-08-19.json`.
4. 매일 APK를 저장소에 커밋하지 않는다. APK는 GitHub Actions Artifact/Release로만 관리한다.
5. 앱 버전은 파일복사본을 여러 개 만드는 대신 Git tag/Release(`v0.1.0`, `v0.2.0`...)로 관리한다.
6. 공개 미러에는 시장 데이터/UI만 복사하고 `private/`, 실제 보유비중, 계정정보는 절대 복사하지 않는다.

## 자동화 흐름

1. ChatGPT가 매일 시장을 분석한다.
2. Private `stock`에 최신/아카이브/인수인계를 정리한다.
3. 별도 공개 미러 저장소에는 **비민감 `latest.json` + 대시보드 UI만** 갱신한다.
4. 폰 앱은 공개 미러의 `latest.json`만 읽어 자동 갱신한다.
5. 내 실제 포트폴리오는 폰 내부에서만 목표비중과 비교한다.

자세한 운영 규칙은 `docs/REPOSITORY_STRUCTURE.md` 참고.
