# Setup Status — 2026-08-19

## 완료

- [x] 저장소 Public 전환 확인
- [x] 일일 JSON 구조 (`public/data/latest.json`, `archive/YYYY/MM/`)
- [x] 일일 HTML 구조 (`public/reports/latest.html`, `reports/YYYY/MM/`)
- [x] 2026-08-19 첫 archive JSON/HTML 생성
- [x] PWA manifest / service worker
- [x] Android Capacitor 프로젝트 설정
- [x] Android APK GitHub Actions workflow
- [x] GitHub Pages deploy workflow
- [x] 앱 버전 `0.2.0` / VERSION 관리
- [x] 폴더 정리/버전 관리 문서
- [x] Public-safe handoff (`ops/handoff/current.json`)
- [x] 매시간 감시 + 매일 07~08시 HTML/GitHub 갱신 ChatGPT 자동화

## 사용자 1회 조작 필요

- [ ] GitHub `Settings → Pages → Build and deployment → Source → GitHub Actions`

GitHub Pages의 repository setting은 현재 연결된 GitHub 도구가 직접 변경하는 API를 노출하지 않아 저장소 소유자가 한 번 선택해야 한다.

설정 후 `public/**` push가 발생할 때 Pages workflow가 자동 배포한다.

## 앱 다운로드

`Actions → Build Market Radar Android APK → 가장 최근 성공 실행 → Artifacts → MarketRadar-v0.2.0-debug-apk`

매일 시장 데이터는 원격 HTML/JSON으로 갱신되므로 APK를 매일 다시 설치할 필요가 없다.

## 보안

이 저장소는 Public이다. 개인 실제 보유종목/비중과 비밀키는 GitHub에 저장하지 않는다. 앱의 포트폴리오 입력값은 기기 localStorage에만 둔다.
