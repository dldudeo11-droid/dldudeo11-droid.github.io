# 대구 비르투오조 챔버 — 홈페이지

Daegu Virtuoso Chamber 공식 홈페이지 (정적 사이트, 서버 불필요).

## 여는 법
`index.html` 을 더블클릭하면 브라우저에서 바로 열립니다. (인터넷 연결 시 폰트가 가장 예쁘게 표시됩니다.)

## 주요 기능
- **테마 3종** (우측 상단 동그라미 토글): 리파인드(아이보리) · 느와르(다크) · 미니멀(화이트)
- **8개 언어** (우측 상단 드롭다운): 한국어 · English · Deutsch · Français · Español · 中文 · 日本語 · ไทย
- 선택한 테마·언어는 자동 저장되어 페이지를 이동해도 유지됩니다.
- 단원 카드를 클릭하면 개별 프로필 페이지로 이동합니다.

## 페이지
| 파일 | 내용 |
|------|------|
| `index.html` | 홈 (히어로·소개·단원 미리보기·연혁·함께한 연주자) |
| `about.html` | 단체 소개 · 함께한 연주자 · 문의 |
| `members.html` | 단원 전체 (파트별) + 객원 수석 |
| `member.html?id=...` | 단원 개별 프로필 |
| `history.html` | 연혁 (2020–2026) |

## 폴더 구조
```
website/
├── index.html, about.html, members.html, member.html, history.html
├── css/style.css           ← 디자인(테마 3종)
├── js/
│   ├── data.js             ← 단원·연혁 구조, 연락처 이메일
│   ├── i18n-bundle.js      ← 8개 언어 텍스트(자동 생성)
│   └── app.js              ← 렌더링·테마/언어 전환
├── i18n/                   ← 언어별 원본 JSON (ko/en/de/fr/es/zh/ja/th)
├── images/members/         ← 단원 사진 (id.jpg)
├── images/stage/           ← 단체·공연 사진
└── assets/                 ← 로고(투명 PNG 흑/백), 파비콘, 마크
```

## 자주 하는 수정
- **단원 사진 교체**: `images/members/<id>.jpg` 파일을 같은 이름으로 덮어쓰기 (권장 비율 4:5)
- **약력·텍스트 수정**: `i18n/ko.json` 등에서 수정 후, 아래 명령으로 번들 재생성
  ```bash
  python3 - <<'PY'
  import json,glob,os
  os.chdir('website')
  b={}
  for f in glob.glob('i18n/*.json'):
      b[os.path.basename(f)[:-5]]=json.load(open(f,encoding='utf-8'))
  open('js/i18n-bundle.js','w',encoding='utf-8').write('window.DVC_I18N='+json.dumps(b,ensure_ascii=False)+';')
  PY
  ```
- **연락처 이메일**: `js/data.js` 의 `contact.email`
- **단원 추가/순서**: `js/data.js` 의 `members` 배열 + `i18n/*.json` 의 `memberBios`

## 배포
Netlify / GitHub Pages / 호스팅에 `website/` 폴더 통째로 업로드하면 됩니다.

> 참고: 단원 사진/연혁/약력은 제공해 주신 자료(프로필 HWP·단체소개·연혁 이미지) 기준으로 작성되었습니다.
