# ChungYack Live Shell — Latest Handoff

최종 갱신: 2026-09-08 17:08 KST

## 1. 절대 기준

- 실제 설치/배포 기준은 **원격 HTML 셸**이다.
- 실제 라이브 파일의 canonical write target은 `kimjae134679/stock/chungyack-apk/public/**`다.
- `kimjae134679/ChungYack`는 규칙·상태 원장 참고용이며 그 저장소의 `public/**`를 라이브 출력으로 취급하지 않는다.
- 일반 HTML/CSS/JS/공고 데이터 변경으로 APK를 다시 빌드하지 않는다.
- APK 재빌드는 원격 URL, 패키지, 네이티브 브리지 등 셸 자체가 바뀌는 경우에만 한다.

## 2. 개인 사용자 상태 보존

다음 상태는 localStorage를 오프라인 폴백으로 유지하면서 Supabase 개인 사용자 상태와 동기화한다.

- 찜(내부 호환 키는 saved 유지)
- 숨김
- 보기
- 필터
- 신청(내부 호환 키/함수는 tracking 유지)
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
- 공개 시간별 보고에는 개인 신청 목록을 노출하지 않는다.
- 신청한 공고와 찜한 공고는 공고 재검증 우선순위로 취급한다.

## 5. 현재 활성 공고 축

- 오늘/내일: 왕십리역 라봄성동, 아차산역 백악관타워 등 결과/서류 일정 + 청년안심주택 접수 공고
- 2~3일: LH 경기남부 청년 매입임대, 기숙사형, 청년안심주택 예정/접수
- 4~7일: SH 행복주택 등
- 이후: 파인주택, 금천구 청년 맞춤형주택(보류), SH 장기미임대 등

확정 패스/제외 규칙을 계속 우선한다. 신혼전용은 청년 신청 불가 시 제외한다.

## 6. 다음 공고 작업

1. SH 2026년 2차 행복주택 공식 공급표에서 청년 공급행 전체 추출
2. 청년 공급 단지별 공급/예비 수, 정확주소, 보증금/월세, 강남·판교 접근성 비교
3. LH 경기남부 26년 3차 청년 매입임대 XLSX를 실제 주택 단위로 전개 — 성남·용인 우선
4. SH 2026년 2차 장기미임대 매입임대 개별 주소·면적·임대조건 전개

## 7. 최신 배포/로드 원칙

`public/index.html`은 기존 Supabase sync layer를 직접 로드한다.

최신 UI는 `app-v88-sync-config.js -> app-v90-favorites.js -> app-v91-labels.js -> app-v93-compact.js` 흐름으로 늦게 덮어씌운다. `app-v91-labels.js`에는 Android WebView 프리즈를 만들었던 MutationObserver를 다시 넣지 않는다.

현재 최신 사용자 표시 버전은 `0.9.3-live`, 서비스워커 캐시는 `chungyack-live-v0.9.3-r1`이다.

## 8. UI 상태 호환성

- `chungyack.opportunity.saved.v1`
- `chungyack.opportunity.hidden.v1`
- `chungyack.opportunity.view.v1`
- `chungyack.application.category.v1`
- 기존 필터/tracking/삭제복원 localStorage

화면 용어는 `찜`, `신청`을 쓰되 기존 저장 키와 공고 `id`는 바꾸지 않는다.

## 9. Supabase 개인 동기화 — 완료

프로젝트 ref는 `mgnjwkpmxjepdgincyxo`. 앱에는 public publishable key만 포함한다. secret/service-role/database password는 GitHub/APK에 넣지 않는다.

DB:

- `public.chungyack_client_state`
- `public.chungyack_assistant_state`
- migration: `supabase/migrations/20260907_private_sync.sql`
- RLS enabled
- client는 `auth.uid() = user_id`인 자기 row만 CRUD 가능
- assistant state는 앱에서 자기 row select만 가능하고 insert/update는 불가

Auth는 anonymous sign-in을 사용하며 앱은 로그인 UI 없이 자동 세션을 만든다.

실제 E2E smoke에서 own-row CRUD, foreign-row 차단, assistant-state app write 차단이 검증됐다.

## 10. 관리자/공용 일정 → Supabase → APK 역방향 동기화

워크플로 `.github/workflows/chungyack-assistant-sync.yml`이 공개 `tracking-milestones.json`을 각 활성 client의 `chungyack_assistant_state`에 반영한다.

실제 경로:

`APK 개인 상태 -> Supabase client_state`

`공용 발표/서류/계약 데이터 -> GitHub Actions -> Supabase assistant_state -> APK pull`

개인 결과 확인을 붙일 때는 `assistant_state.state.trackingPatch[]`의 기존 id/name 매칭을 사용하고, `verification` 객체를 병합할 수 있다.

권장 verification 예시:

```json
{
  "id": "opportunity-...",
  "status": "서류",
  "verification": {
    "state": "found",
    "stage": "documents",
    "checkedAt": "2026-09-08T17:10:00+09:00",
    "note": "공식 서류심사 대상자 명단에서 확인"
  }
}
```

`state`는 `pending | found | not_found | unavailable`, `stage`는 `screening | documents | final`을 사용한다. `not_found`만으로 탈락 확정하지 말고 최종 명단임이 확인된 경우에만 `final: true`를 붙인다.

## 11. 사용자 경험 원칙

- 이메일 로그인 UI 없음
- 비밀번호 없음
- 복구코드 없음
- 사용자가 계정 설정을 따로 하지 않아도 됨
- APK는 실행 시 자동으로 익명 Supabase 세션을 만들고 동기화
- 현재 기기의 데이터는 localStorage + Supabase 이중 저장

주의: 앱 데이터 삭제/완전한 새 기기에서 동일한 익명 사용자 ID를 재식별하는 기능은 별도 인증수단 없이 보장할 수 없다.

## 12. v0.9.3 UI / 신청 결과 분류 규칙 — 2026-09-08

홈 공고 카드의 긴 문장형 상태 설명을 기본 화면에서 제거한다. 카드에는 제목과 아래 핵심 정보만 짧게 보여준다.

- 상태: 접수중 / 확인 필요 / 서류 / 예정 / 마감
- 접수기간
- 발표일
- 모집세대
- 임대료 요약(확인된 경우만)
- 하단 빠른 액션: 찜 / 신청 / 숨김

긴 자격·계약·주의문구는 상세 화면/공식 공고에서 확인하며 기본 카드에 중복해서 쌓지 않는다.

하단 공고 탭의 돋보기 아이콘은 사용하지 않고 문서형 `▤` 아이콘을 사용한다.

신청 탭은 다음 4개 분류를 표시한다.

- `확인 필요`: 결과/서류심사 대상자 발표시각이 지났는데 아직 개인 결과를 확정하지 않은 신청건
- `진행중`: 신청완료, 서류, 계약, 입주 등 계속 진행하는 건
- `합격·예비`: 당첨/예비 또는 최종 명단 확인된 건
- `탈락`: 공식 최종 결과에서 탈락/부적격/미선정이 확인된 건

공개 milestone의 결과시각이 지나면 별도 수동 상태 변경이 없어도 UI가 `확인 필요`로 분류할 수 있다.

### 개인 명단 조회 규칙

결과/서류심사 대상자 명단이 공식 PDF, 공식 게시글, 운영사 공식 페이지 등에서 공개되면 신청자의 개인 식별정보로 본인 포함 여부를 가능한 범위에서 확인한다. 단:

- 성명/전화번호/생년월일 등 개인 식별값 원문을 공개 GitHub JSON, JS, 로그에 절대 넣지 않는다.
- 공식 명단이 마스킹되어 있어 신뢰성 있게 매칭할 수 있을 때만 `found/not_found`를 기록한다.
- 불완전한 명단, 일부 페이지, 운영사 개별연락 방식이면 `unavailable` 또는 `pending`으로 둔다.
- `not_found`는 최종 공식 명단임이 명확할 때만 `final:true`로 탈락 분류한다.
- 확인 결과는 가능하면 private Supabase `trackingPatch.verification`으로 APK에 반영한다.
