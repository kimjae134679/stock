# ChungYack Radar APK build mirror

이 폴더는 `kimjae134679/ChungYack`의 Android APK를 GitHub Actions에서 빌드하기 위한 **공개·비개인정보 미러**다.

- 공개 가능한 SH 공고/주소/임대조건/경쟁률 참고 데이터만 포함한다.
- `public/data/app.json`의 `trackingSeed`는 반드시 빈 배열이다.
- 사용자가 앱에서 추가·수정하는 추적 정보는 Android WebView의 로컬 저장소에만 저장한다.
- 29/39/46/49/59㎡를 강제 제외하지 않고 필터로 직접 켜고 끈다.
- 추적 수정, 상태 변경, 제거/되돌리기, JSON 백업/복원을 지원한다.
- `data-parts/*.csv`는 빌드 때 `public/data/sh-2026.csv`로 결합되며 총 79행이어야 한다.

공개 저장소에 개인 신청자 이름, 생년월일, 개인 순위/예비번호 등 개인 추적 데이터를 넣지 않는다.
