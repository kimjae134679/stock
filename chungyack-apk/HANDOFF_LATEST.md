# ChungYack Live Shell — Latest Handoff

최종 갱신: 2026-09-07 01:43 KST

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

## 7. 최신 배포 검증

2026-09-07 01:43 KST 기준 `public/index.html`에서 v0.8.8 Supabase sync layer를 실제 로드하도록 수정했고 `public/sw.js` cache를 `chungyack-live-v0.8.8-r2`로 올렸다.

GitHub Pages `Deploy Market Radar and ChungYack Pages` run `34046323896`가 **SUCCESS**로 완료되었다.

## 8. UI 상태 호환성

- `chungyack.opportunity.saved.v1`
- `chungyack.opportunity.hidden.v1`
- `chungyack.opportunity.view.v1`
- 기존 필터/추적/삭제복원 localStorage

위 키와 기존 공고 `id`를 유지하므로 클라우드 동기화 도입 전 로컬 기록을 유지한다.

## 9. Supabase 개인 동기화 — 2026-09-07 완료

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
- 앱은 Supabase anonymous auth 세션을 기기에 유지한다.

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

남은 사항: ChatGPT/관리자 측에서 `chungyack_assistant_state`를 직접 쓰려면 별도의 신뢰된 Supabase 관리자 연결(예: Supabase plugin/MCP/service-side integration)이 필요하다. APK의 개인 상태 클라우드 동기화 자체는 연결 완료 상태다.
