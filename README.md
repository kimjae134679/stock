# Market Radar

개인용 미국 주식/ETF 시장 대시보드 프로젝트.

## 구조

- `public/` : GitHub Pages/PWA/APK가 읽는 **비민감 공개용 UI·시장데이터**
- `public/data/latest.json` : 앱이 항상 읽는 최신 시장 분석
- `public/data/archive/` : 날짜별 공개용 시장 스냅샷
- `private/` : 전체 인수인계·내부 분석용. **Pages에 배포하지 않음**
- `.github/workflows/pages.yml` : `public/`만 GitHub Pages로 자동 배포
- `.github/workflows/android.yml` : UI 변경 시 Android APK 자동 빌드

## 보안 원칙

1. 저장소는 Private 유지.
2. GitHub Pages로 공개되는 것은 `public/` 폴더뿐.
3. 실제 개인 보유비중은 앱의 기기 로컬 저장소(localStorage)에만 저장하고 GitHub에 업로드하지 않음.
4. GitHub 토큰/PAT/API Secret을 APK나 `public/`에 넣지 않음.
5. `private/`의 인수인계·내부 분석 데이터는 Pages 배포 대상에서 제외.

## 사용 흐름

1. ChatGPT 일일 자동화가 시장을 분석한다.
2. `public/data/latest.json`과 `public/data/archive/YYYY-MM-DD.json`을 갱신한다.
3. GitHub Pages가 자동 재배포된다.
4. PWA/APK는 `latest.json`을 읽어 최신 화면을 보여준다.
5. 앱 업데이트가 필요한 UI 변경 때만 APK를 다시 빌드한다. 매일 APK를 재설치할 필요는 없다.
