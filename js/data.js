/* 대구 비르투오조 챔버 — 구조 데이터 (언어 중립) */
window.DVC_DATA = {
  langs: [
    ["ko", "한국어"], ["en", "English"], ["de", "Deutsch"], ["fr", "Français"],
    ["es", "Español"], ["zh", "中文"], ["ja", "日本語"], ["th", "ไทย"]
  ],
  themes: ["editorial", "noir", "minimal"],

  contact: {
    email: "virtuoso_chamber@naver.com",
    instagram: "https://www.instagram.com/dg_v_chamber",
    instagram_handle: "@dg_v_chamber",
    blog: "https://blog.naver.com/dg_virtuoso_chamber",
    blog_handle: "blog.naver.com/dg_virtuoso_chamber"
  },

  // 연주 단원 (사진 보유) — 바이올린(1/2 구분 없음) → 비올라 → 첼로, 각 그룹 내 악장·수석·단원 순
  members: [
    { id: "han-gyeongjin", photo: "images/members/han-gyeongjin.jpg", part: "violin", rank: "concertmaster" },
    { id: "kim-namhoon",   photo: "images/members/kim-namhoon.jpg",   part: "violin", rank: "concertmaster" },
    { id: "lee-kangwon",   photo: "images/members/lee-kangwon.jpg",   part: "violin", rank: "principal" },
    { id: "lee-eunjeong",  photo: "images/members/lee-eunjeong.jpg",  part: "violin", rank: "principal" },
    { id: "kim-sojeong",   photo: "images/members/kim-sojeong.jpg",   part: "violin", rank: "member" },
    { id: "kim-eunji",     photo: "images/members/kim-eunji.jpg",     part: "violin", rank: "member" },
    { id: "baek-nahyun",   photo: "images/members/baek-nahyun.jpg",   part: "violin", rank: "member" },
    { id: "kim-suji",      photo: "images/members/kim-suji.jpg",      part: "violin", rank: "member" },
    { id: "han-hyemin",    photo: "images/members/han-hyemin.jpg",    part: "violin", rank: "member" },
    { id: "bae-eunjin",    photo: "images/members/bae-eunjin.jpg",    part: "viola",  rank: "principal_rep" },
    { id: "park-soyeon",   photo: "images/members/park-soyeon.jpg",   part: "viola",  rank: "member" },
    { id: "lee-jeongmin",  photo: "images/members/lee-jeongmin.jpg",  part: "viola",  rank: "member" },
    { id: "oh-kookhwan",   photo: "images/members/oh-kookhwan.jpg",   part: "cello",  rank: "member" },
    { id: "lee-heesoo",    photo: "images/members/lee-heesoo.jpg",    part: "cello",  rank: "member" }
  ],

  // 객원 수석 (개별 프로필 보유, 사진 없음 → 모노그램)
  guestPrincipals: [
    { id: "kim-minji", photo: null, part: "cello", rank: "guest_principal" }
  ],

  // 함께한 연주자 (텍스트 리스트)
  guests: [
    { id: "yeo-jakyung",  kind: "conductor" },
    { id: "tania-miller", kind: "conductor" },
    { id: "dami-kim",     kind: "violin" },
    { id: "jasmine-choi", kind: "flute" },
    { id: "soyoung-yoon", kind: "violin" },
    { id: "jinsang-lee",  kind: "piano" },
    { id: "jeongwon-kim", kind: "piano" }
  ],

  sectionOrder: ["violin", "viola", "cello"],

  history: [
    { id: "h2020a", year: "2020", date: "2020.10.06" },
    { id: "h2020b", year: "2020", date: "2020.10.07" },
    { id: "h2020c", year: "2020", date: "2020.11.02" },
    { id: "h2020d", year: "2020", date: "2020.12.06" },
    { id: "h2021a", year: "2021", date: "2021.10.23" },
    { id: "h2021b", year: "2021", date: "2021.10.26" },
    { id: "h2021c", year: "2021", date: "2021.10.27" },
    { id: "h2022a", year: "2022", date: "2022.11.12" },
    { id: "h2024a", year: "2024", date: "2024.04.30" },
    { id: "h2024b", year: "2024", date: "2024.11.27" },
    { id: "h2024c", year: "2024", date: "2024.11.28" },
    { id: "h2025a", year: "2025", date: "2025.11.01" },
    { id: "h2026a", year: "2026", date: "2026.02.25" },
    { id: "h2026b", year: "2026", date: "2026.05.03" },
    { id: "h2026c", year: "2026", date: "2026.06.21" },
    { id: "h2026d", year: "2026", date: "2026.06.24" }
  ],

  // 연주 스케치 — 공연 포스터 갤러리 (최신순, 이미지가 캡션을 담고 있음)
  sketches: [
    { id: "s2026e", date: "2026.06.24", image: "images/sketch/2026-06-24-metz.jpg" },
    { id: "s2026d", date: "2026.06.21", image: "images/sketch/2026-06-21-hannover.jpg" },
    { id: "s2026c", date: "2026.05.03", image: "images/sketch/2026-05-03-magic-flute.jpg" },
    { id: "s2026b", date: "2026.02.25", image: "images/sketch/2026-02-25-ensemble-festival.jpg" },
    { id: "s2025a", date: "2025.11.01", image: "images/sketch/2025-11-01-wof-julius-kim.jpg" },
    { id: "s2024c", date: "2024.11.28", image: "images/sketch/2024-11-28-dalbit-lee-jinsang.jpg" },
    { id: "s2024b", date: "2024.11.27", image: "images/sketch/2024-11-27-wof.jpg" },
    { id: "s2024a", date: "2024.04.30", image: "images/sketch/2024-04-30-dch-exclusive.jpg" },
    { id: "s2022a", date: "2022.11.12", image: "images/sketch/2022-11-12-bach-brandenburg.jpg" },
    { id: "s2021c", date: "2021.10.27", image: "images/sketch/2021-10-27-seoul.jpg" },
    { id: "s2021b", date: "2021.10.26", image: "images/sketch/2021-10-26-hwaseong.jpg" },
    { id: "s2021a", date: "2021.10.23", image: "images/sketch/2021-10-23-wos.jpg" },
    { id: "s2020c", date: "2020.11.28", image: "images/sketch/2020-11-28-chamber-festival.jpg" },
    { id: "s2020b", date: "2020.11.02", image: "images/sketch/2020-11-02-dalbit.jpg" },
    { id: "s2020a", date: "2020.10.06", image: "images/sketch/2020-10-06-wos.jpg" }
  ],

  stage: [
    "images/stage/group.jpg",
    "images/stage/perform.jpg",
    "images/stage/stage-dark.jpg",
    "images/stage/hall.jpg"
  ]
};
