# 🐕 댕스패치 (Dang-spatch)

> 유기견을 발견했을 때, 3번의 탭으로 신고 완료

---

## 🚀 앱 바로 실행

### 👉 [댕스패치 열기 — lgw7126.github.io/Claude-DangsPatch-app](https://lgw7126.github.io/Claude-DangsPatch-app/)

> **GitHub Pages 활성화 필요**: 저장소 Settings → Pages → Source를 **gh-pages 브랜치**로 설정해 주세요.

---

## 📌 제작 사유

길을 걷다 유기견을 발견했을 때, **어디에 신고해야 할지 몰라 당황**하는 경우가 많습니다.  
보호소 전화번호를 검색하고, 당근마켓에 글을 쓰는 동안 개는 사라지거나 다칠 수 있습니다.

**댕스패치는 그 혼란스러운 순간을 3단계로 단순화합니다.**

1. 앱을 열면 → 내 위치와 가까운 보호소가 자동으로 뜬다
2. 버튼 하나로 → 보호소에 전화 연결
3. 버튼 하나로 → 당근마켓 동네생활에 도움 요청 글 자동 완성

---

## 🌟 주요 기능

| 기능 | 설명 |
|------|------|
| 📍 현재 위치 자동 파악 | GPS로 내 위치를 도로명 주소로 즉시 변환 |
| 🏥 가까운 보호소 탐색 | 반경 내 동물보호소 3곳 목록 + 거리 표시 |
| 📞 전화 즉시 연결 | 버튼 클릭 → 모바일 다이얼 앱으로 바로 연결 |
| 🥕 당근마켓 3초 컷 | 글 자동 생성 → 클립보드 복사 → 당근마켓 실행 |

---

## 📱 사용 방법

```
1. 앱을 열면 위치 권한을 요청합니다 → [허용]을 눌러주세요.

2. 상단에 현재 도로명 주소가 표시됩니다.

3. 가장 가까운 동물보호소 목록이 자동으로 나타납니다.
   → [전화하기] 버튼을 눌러 즉시 신고하세요.

4. 화면 하단의 [내용 복사하고 당근마켓 열기]를 누르면
   글 템플릿이 클립보드에 복사되고 당근마켓 앱이 열립니다.
   → 붙여넣기만 하면 동네 생활 글 완성!
```

---

## ⚙️ 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/lgw7126/Claude-DangsPatch-app.git
cd Claude-DangsPatch-app
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 API 키를 입력합니다:

```env
# 카카오 Developers (developers.kakao.com) → REST API 키
VITE_KAKAO_REST_API_KEY=여기에_카카오_REST_API_키_입력

# 공공데이터포털 (data.go.kr) → "동물보호센터 정보 서비스" 신청 후 발급
VITE_PUBLIC_DATA_API_KEY=여기에_공공데이터_API_키_입력
```

> API 키 없이도 샘플 데이터로 앱 기능을 확인할 수 있습니다.

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 🔑 API 키 발급 가이드

### 카카오 REST API 키 (주소 변환용)
1. [developers.kakao.com](https://developers.kakao.com) 로그인
2. 내 애플리케이션 → 앱 추가
3. 앱 키 → **REST API 키** 복사

### 공공데이터포털 API 키 (보호소 정보용)
1. [data.go.kr](https://www.data.go.kr) 로그인
2. `동물보호센터 정보 서비스` 검색 → 활용 신청
3. 마이페이지 → **인증키** 복사

---

## 🛠 기술 스택

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (모바일 퍼스트)
- **APIs**: 카카오 Reverse Geocoding, 공공데이터포털 동물보호센터, Web Geolocation
- **배포**: GitHub Pages

---

## 📂 프로젝트 구조

```
src/
├── App.jsx                  # 메인 앱, 상태 관리
├── components/
│   ├── Header.jsx           # 앱 헤더
│   ├── LocationCard.jsx     # 현재 위치 표시
│   ├── ShelterList.jsx      # 보호소 목록
│   └── DaanggnPanel.jsx     # 당근마켓 연동
└── services/
    ├── geolocation.js       # 브라우저 GPS
    ├── kakaoApi.js          # 카카오 역지오코딩
    └── shelterApi.js        # 보호소 API + 거리 계산
```

---

*댕스패치는 유기견 구조를 돕기 위한 비영리 오픈소스 프로젝트입니다.*
