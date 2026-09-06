# ChungYack Live Shell — Latest Handoff

최종 갱신: 2026-09-07 02:11 KST

## 1. 절대 기준

- 실제 설치/배포 기준은 **원격 HTML 셸**이다.
- 실제 라이브 파일의 canonical write target은 `kimjae134679/stock/chungyack-apk/public/**`다.
- `kimjae134679/ChungYack`는 규칙·상태 원장 참고용이며 그 저장소의 `public/**`를 라이브 출력으로 취급하지 않는다.
- 일반 HTML/CSS/JS/공고 데이터 변경으로 APK를 다시 빌드하지 않는다.
- APK 재빌드는 원격 URL, 패키지, 네이티브 브리지 등 셸 자체가 바뀌는 경우에만 한다.

## 2. 개인 사용자 상태 보존

다음 상태는 localStorage를 오프라인 폴백으로 유지하면서 Supabase 개인 사용자 상태와 동기화한다.

- 저장
- 숨김
- 보기
- 필터
- 신청 추적
- 삭제/복원

공개 `app.json`은 항상 `trackingSeed: []`를 유지한다. 개인 신청완료·결과·예비순번·서류·계약·입주 상태를 공개 JSON에 넣지 않는다. 공고 `id`는 개인 기록 연결키이므로 같은 공고에서 임의 변경하지 않는다.

## 3. 2026-09-04 수정한 문제

기존 매시간 자동화가 `kimjae134679/ChungYack/public/**`만 갱신하고 실제 라이브 `kimjae134679/stock/chungyack-apk/public/**`는 갱신하지 않아 두 저장소 데이터가 갈라져 있었다.

2026-09-04 00:33 KST에 실제 라이브 다음 파일을 최신화했다.

- `public/data/hourly-report.json`
- `public/data/current-opportunities.json`
- `public/data/app.json`

`current-opportunities.json`은 9월 1일 상태에서 벗어나 9월 4일 공식 검증 후보를 반영했다. 왕십리역 라봄성동, 아차산역 백악관타워, 천호역 천호한강청년주택, 등촌역 아르체움 등촌, 동묘앞역 청계로벤하임, 개봉역 세이지움 개봉, 신논현역 List 강남 등 새 후보를 추천 카드 원장에 반영했다.

개봉역 세이지움 개봉의 접수 마감은 기존 원장의 `9월 8일 23:00`이 아니라 서울시 공식 공고 기준 **9월 8일 17:00**으로 수정했다.

## 4. 매시간 자동화

- 규칙/상태는 `kimjae134679/ChungYack`에서 먼저 읽는다.
- 실제 데이터 쓰기/커밋은 `kimjae134679/stock/chungyack-apk/public/data/**`로 한다.
- `hourly-report.json`, `current-opportunities.json`, `app.json`을 서로 모순 없게 함께 관리한다.
- 자동화가 UI/CSS/JS를 재설계하지 않는다.
- 일반 데이터 갱신으로 APK를 재빌드하지 않는다.
- 공개 시간별 보고에는 개인 `이미 신청한 공고` 그룹을 만들지 않는다.

## 5. 현재 활성 공고 축

- 오늘/내일: 왕십리역 라봄성동, 아차산역 백악관타워, LH 경기북부 든든전세 발표 일정
- 2~3일: LH 경기남부 청년 매입임대, 안성 기숙사형, 천호한강, 아르체움 등촌, 청계로벤하임, 세이지움 개봉, List 강남
- 4~7일: SH 2026년 2차 행복주택
- 이후: 세이지움 태릉입구, 파인(FINE)주택, 금천구 청년 맞춤형주택(보류), SH 2차 장기미임대

확정 패스/제외 규칙을 계속 우선한다. 신혼전용은 청년 신청 불가 시 제외한다.

## 6. 다음 공고 작업

1. SH 2026년 2차 행복주택 공식 공급표에서 청년 공급행 전체 추출
2. 청년 공급 단지별 공급/예비 수, 정확주소, 보증금/월세, 강남·판교 접근성 비교
3. LH 경기남부 26년 3차 청년 매입임대 XLSX를 실제 주택 단위로 전개 — 성남·용인 우선
4. SH 2026년 2차 장기미임대 매입임대 개별 주소·면적·임대조건 전개

## 7. 최신 배포/로드 원칙

`public/index.html`은 v0.8.8 Supabase sync layer만 직접 로드한다.

`public/assets/app-v87-tracking.js` 안에 남아 있던 구형 v0.8.8 동적 loader는 제거되어 sync layer가 중복 실행되지 않는다.

복구용 이메일/비밀번호 UI로 추가했던 `app-v89-account.js/css`는 사용자 요구에 따라 제거했다. 서비스워커 cache도 `chungyack-live-v0.8.9-r2`로 갱신해 해당 UI 잔재를 purge한다.

## 8. UI 상태 호환성

- `chungyack.opportunity.saved.v1`
- `chungyack.opportunity.hidden.v1`
- `chungyack.opportunity.view.v1`
- 기존 필터/추적/삭제복원 localStorage

위 키와 기존 공고 `id`를 유지하므로 클라우드 동기화 도입 전 로컬 기록을 유지한다.

## 9. Supabase 개인 동기화 — 완료

프로젝트:

- ref: `mgnjwkpmxjepdgincyxo`
- URL: `https://mgnjwkpmxjepdgincyxo.supabase.co`
- 앱에는 public publishable key만 포함한다. secret/service-role/database password는 GitHub/APK에 넣지 않는다.

DB:

- `public.chungyack_client_state`
- `public.chungyack_assistant_state`
- migration: `supabase/migrations/20260907_private_sync.sql`
- RLS enabled
- client는 `auth.uid() = user_id`인 자기 row만 CRUD 가능
- assistant state는 앱에서 자기 row select만 가능하고 insert/update는 불가

Auth:

- Anonymous Sign-Ins 활성화됨
- 앱은 별도 로그인 UI 없이 Supabase anonymous auth 세션을 자동 생성/유지한다.

라이브 파일:

- `public/assets/app-v88-sync-config.js`
- `public/assets/app-v88-sync.js`
- `public/assets/app-v88-sync.css`
- `public/index.html`에서 v88 config/sync 로드
- localStorage는 오프라인 폴백으로 계속 유지

실제 E2E 검증:

GitHub Actions `ChungYack Supabase Smoke Test` run `34046254255` SUCCESS.

검증된 항목:

- anonymous auth: OK
- own client row upsert: OK
- own client row select: OK
- foreign user_id insert blocked by RLS: OK
- foreign row select hidden by RLS: OK
- app write to assistant state blocked: OK
- own assistant state read permitted: OK
- test row cleanup: OK
- `CHUNGYACK_SUPABASE_SMOKE=PASS`

## 10. 관리자/공용 일정 → Supabase → APK 역방향 동기화

GitHub repository secret `SUPABASE_SECRET_KEY`가 등록되었으며 실제 관리자 호출로 검증했다. secret 값은 GitHub Actions에서만 사용하고 로그/코드/APK에는 노출하지 않는다.

워크플로:

- `.github/workflows/chungyack-assistant-sync.yml`
- `tracking-milestones.json`, `current-opportunities.json`, `hourly-report.json` 갱신 시 실행
- 공개 일정 데이터만 읽어 각 활성 client의 `chungyack_assistant_state`에 반영
- 개인 추적 원문을 공개 GitHub 파일/로그에 쓰지 않는다.

실제 검증:

- `SUPABASE_ADMIN_SECRET=OK`
- `active_clients=1`
- `milestones=5`
- 관리자 secret으로 `chungyack_assistant_state` upsert 성공

따라서 현재 실제 경로는 다음과 같다.

`APK 개인 상태 -> Supabase client_state`

`공용 발표/서류/계약 데이터 -> GitHub Actions -> Supabase assistant_state -> APK pull`

## 11. 사용자 경험 원칙 — 2026-09-07 변경

- 이메일 로그인 UI 없음
- 비밀번호 없음
- 복구코드 없음
- 사용자가 계정 설정을 따로 하지 않아도 됨
- APK는 실행 시 자동으로 익명 Supabase 세션을 만들고 동기화
- 현재 기기의 데이터는 localStorage + Supabase 이중 저장

주의: 앱 데이터 삭제/완전한 새 기기에서 **동일한 익명 사용자 ID를 재식별하는 기능은 별도 인증수단 없이 보장할 수 없다**. 사용자에게는 불필요한 로그인/복구 UI를 노출하지 않고, 현재 단일 사용자 자동 동기화 흐름을 유지한다.
