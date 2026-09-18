#!/usr/bin/env python3
import json, re, sys
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
CURRENT = DATA_DIR / "current-opportunities.json"
HOURLY = DATA_DIR / "hourly-report.json"
APP = DATA_DIR / "app.json"
BASE = "https://soco.seoul.go.kr/youth/bbs/BMSR00015/view.do?boardId={board_id}&menuNo=400008"
KST = timezone(timedelta(hours=9))
NOW = datetime.now(KST)
UA = "Mozilla/5.0 ChungYackRadar/1.0 (+GitHub Actions; official notice freshness check)"

class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        s = re.sub(r"\s+", " ", data or "").strip()
        if s:
            self.parts.append(s)

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def save(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

def fetch_text(board_id):
    req = Request(BASE.format(board_id=board_id), headers={"User-Agent": UA})
    try:
        with urlopen(req, timeout=15) as r:
            raw = r.read().decode("utf-8", "replace")
    except (HTTPError, URLError, TimeoutError):
        return None
    p = TextParser()
    try:
        p.feed(raw)
    except Exception:
        return None
    return "\n".join(p.parts)

def find_line(text, pattern):
    m = re.search(pattern, text, re.I)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""

def parse_notice(board_id, text):
    if not text or "[민간임대]" not in text or "청년안심주택" not in text:
        return None
    title = find_line(text, r"\[민간임대\]\s*([^\n]+?(?:추가|최초)모집공고)")
    if not title:
        return None
    posted = find_line(text, r"공고게시일\s*(20\d{2}-\d{2}-\d{2})")
    if posted:
        try:
            if datetime.strptime(posted, "%Y-%m-%d").date() < (NOW.date() - timedelta(days=7)):
                return None
        except ValueError:
            pass
    region = find_line(text, r"카테고리\s*([^\n]+?구)")
    address = find_line(text, r"주택위치\s*:\s*([^\n]+)")
    units = find_line(text, r"공급호수\s*:\s*([^\n]+)")
    apply_raw = find_line(text, r"청약신청\s*:\s*([^\n]+)")
    apply_date = find_line(text, r"청약신청일\s*(20\d{2}-\d{2}-\d{2})")
    screening = find_line(text, r"서류심사\s*대상자\s*발표\s*:\s*([^\n]+)")

    # Preserve the official schedule text when extraction succeeds.
    # If only the official application date is available, keep that date rather than inventing an end time.
    period = apply_raw or apply_date or "공식 공고 확인"
    title_clean = re.sub(r"\s+", " ", title).strip()
    name = title_clean
    if "청년안심주택" not in name:
        name = name.replace(" 추가모집공고", " 청년안심주택 추가모집").replace(" 최초모집공고", " 청년안심주택 최초모집")
    source = BASE.format(board_id=board_id) + (f"&optn1={posted}" if posted else "")
    return {
        "id": f"youth-soco-board-{board_id}",
        "status": "🔥🔵",
        "agency": "서울시 청년안심주택",
        "category": "공공지원민간임대",
        "region": region or "서울",
        "name": name,
        "period": period,
        "units": units or "공식 공고 공급호수 확인",
        "eligibility": {
            "level": "review",
            "title": "🔥🔵 공식 신규 공고 자동발견",
            "reason": "서울시 청년안심주택 공식 모집공고에서 신규 boardId를 자동 감지했습니다.",
            "check": "공고 PDF의 유형별 청년 신청자격·임대조건 최종 검증"
        },
        "next": (screening + " 서류심사 대상자 발표") if screening and "발표" not in screening else (screening or "공식 일정 확인"),
        "source": source,
        "addresses": [address] if address else [],
        "autoDiscovered": True,
        "sourceBoardId": board_id
    }, apply_date

def source_board_ids(items):
    out = set()
    for item in items:
        if isinstance(item, dict):
            if isinstance(item.get("sourceBoardId"), int):
                out.add(item["sourceBoardId"])
            m = re.search(r"boardId=(\d+)", str(item.get("source", "")))
            if m:
                out.add(int(m.group(1)))
    return out

def group_for(date_text):
    try:
        d = datetime.strptime(date_text, "%Y-%m-%d").date()
    except Exception:
        return "2-3days"
    delta = (d - NOW.date()).days
    if delta <= 1:
        return "today-tomorrow"
    if delta <= 3:
        return "2-3days"
    if delta <= 7:
        return "4-7days"
    return "later"

def main():
    current = load(CURRENT)
    known = source_board_ids(current.get("items", []))
    if not known:
        print("No existing Seoul youth-housing boardId found; refusing blind scan.", file=sys.stderr)
        return 2

    lo = max(1, max(known) - 30)
    hi = max(known) + 40
    found = []
    for board_id in range(lo, hi + 1):
        if board_id in known:
            continue
        text = fetch_text(board_id)
        parsed = parse_notice(board_id, text)
        if parsed:
            item, apply_date = parsed
            found.append((item, apply_date))

    if not found:
        print(f"No missing recent Seoul youth-housing notices in boardId window {lo}..{hi}.")
        return 0

    # Stable order: newest boardId first, preserve existing reviewed records.
    new_items = [x[0] for x in sorted(found, key=lambda z: z[0]["sourceBoardId"], reverse=True)]
    current["items"] = new_items + current.get("items", [])
    current["updatedAt"] = NOW.isoformat(timespec="seconds")
    current["notice"] = f"{NOW:%Y-%m-%d %H:%M} KST 자동감시: 서울시 청년안심주택 공식 boardId 신규 {len(new_items)}건 발견·추가. 자동발견 건은 공식 PDF 세부 검증 후 보강."
    save(CURRENT, current)

    hourly = load(HOURLY)
    groups = {g.get("id"): g for g in hourly.get("groups", [])}
    for item, apply_date in found:
        gid = group_for(apply_date)
        g = groups.get(gid)
        if not g:
            continue
        if any(x.get("name") == item["name"] for x in g.get("items", [])):
            continue
        g.setdefault("items", []).insert(0, {
            "name": item["name"],
            "status": f"🔥🔵 공식 신규공고 자동발견 · {item['period']}",
            "address": item["addresses"][0] if item["addresses"] else ""
        })
    hourly["updatedAt"] = NOW.isoformat(timespec="seconds")
    hourly["status"] = f"{NOW:%Y-%m-%d %H:%M} KST 서울시 청년안심주택 신규공고 자동동기화"
    hourly["notice"] = f"서울시 공식 boardId 감시에서 신규 {len(new_items)}건을 발견해 공개 후보에 추가했습니다. 세부 임대조건은 공식 PDF 재검증 대상입니다."
    save(HOURLY, hourly)

    app = load(APP)
    app["updatedAt"] = NOW.isoformat(timespec="seconds")
    app.setdefault("summary", {})["catalog"] = len(current.get("items", []))
    app["summary"]["note"] = f"{NOW:%Y-%m-%d %H:%M} KST. 서울시 청년안심주택 신규 boardId 자동감시 반영. 새 공고는 누락 방지를 위해 먼저 후보로 추가한 뒤 공식 PDF로 세부 검증."
    save(APP, app)

    print("Added boardIds:", ", ".join(str(x[0]["sourceBoardId"]) for x in found))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
