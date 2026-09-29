#!/usr/bin/env python3
import requests,re,json,sys,statistics
from pathlib import Path
from datetime import datetime, timezone, timedelta

URL='https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancInfo.do?aisTpCd=26&ccrCnntSysDsCd=03&mi=1026&panId=2015122300020759&uppAisTpCd=13'
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'public'/'data'/'lh-youth-seoul-2026-3.json'
KST=timezone(timedelta(hours=9))

def norm(s):
    return re.sub(r'\s+','',(s or '').strip()).replace('서울특별시','').replace('서울','')

def main():
    r=requests.get(URL,timeout=30,headers={'User-Agent':'Mozilla/5.0 ChungYack/1.0'})
    r.raise_for_status(); r.encoding='utf-8'; t=r.text
    m=re.search(r"case 'wrtancRRHtyList'\s*:\s*\r?\n\s*list\s*=\s*JSON\.parse\('(.+?)'\);",t,re.S)
    if not m:
        print('LH live application list not found',file=sys.stderr); return 2
    live=json.loads(m.group(1))
    d=json.loads(DATA.read_text(encoding='utf-8'))
    live_by={norm(x.get('dngHsAdr')):x for x in live}
    matched=0
    for c in d.get('complexes',[]):
        hit=live_by.get(norm(c.get('complexName'))) or live_by.get(norm(c.get('complexCode')))
        if not hit:
            cn=norm(c.get('complexName'))
            for ln,x in live_by.items():
                if cn and (cn in ln or ln in cn):
                    hit=x; break
        if not hit:
            for k in ['liveSupplyUnits','selectionQuota','applicantCount','competitionRatio','supplyPressureRatio','liveApplicationUnitName','liveApplicantSource']:
                c.pop(k,None)
            continue
        matched+=1
        supply=int(hit.get('ltrSplRmno') or 0)
        quota=int(hit.get('qupCnt') or 0)
        applicants=int(hit.get('rqsCnt') or 0)
        c.update({
            'liveSupplyUnits':supply,
            'selectionQuota':quota,
            'applicantCount':applicants,
            'competitionRatio':round(applicants/quota,2) if quota else None,
            'supplyPressureRatio':round(applicants/supply,2) if supply else None,
            'liveApplicationUnitName':hit.get('dngHsAdr'),
            'liveApplicantSource':'LH 청약플러스 현재 인터넷 청약신청자 현황'
        })
    cm={norm(c.get('complexName')):c for c in d.get('complexes',[])}
    for u in d.get('units',[]):
        c=cm.get(norm(u.get('groupName')))
        if not c: continue
        for k in ['liveSupplyUnits','selectionQuota','applicantCount','competitionRatio','supplyPressureRatio','liveApplicationUnitName','liveApplicantSource']:
            if k in c: u[k]=c[k]
            else: u.pop(k,None)
    ratios=[c['competitionRatio'] for c in d.get('complexes',[]) if c.get('competitionRatio') is not None]
    applicants=[c['applicantCount'] for c in d.get('complexes',[]) if c.get('applicantCount') is not None]
    supplies=[c['liveSupplyUnits'] for c in d.get('complexes',[]) if c.get('liveSupplyUnits') is not None]
    quotas=[c['selectionQuota'] for c in d.get('complexes',[]) if c.get('selectionQuota') is not None]
    now=datetime.now(KST).isoformat(timespec='seconds')
    d['liveCompetition']={
        'updatedAt':now,'source':URL,'rows':len(live),'matchedComplexes':matched,
        'totalApplicants':sum(applicants),'totalSupplyUnits':sum(supplies),'totalSelectionQuota':sum(quotas),
        'medianCompetitionRatio':round(statistics.median(ratios),2) if ratios else None,
        'minCompetitionRatio':min(ratios) if ratios else None,'maxCompetitionRatio':max(ratios) if ratios else None,
        'note':'신청건수는 LH 청약플러스의 현재 인터넷 청약신청자 현황으로 접수 마감 전 변동 가능. 경쟁률은 신청건수÷모집인원, 공급압력은 신청건수÷공급호수로 계산.'
    }
    DATA.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(json.dumps(d['liveCompetition'],ensure_ascii=False))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
