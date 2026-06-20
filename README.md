# MoneyLog

개인용 유튜브·애드센스 자산 통합 관리 시스템

## 기술 스택

- **Next.js** (App Router) + TypeScript
- **MongoDB** + Mongoose
- **NextAuth.js** — Credentials 인증, JWT 세션
- **mongoose-field-encryption** — 민감 필드 자동 암·복호화
- **Zustand** — 글로벌 블러 상태
- **Tailwind CSS** — Sentinels Slate 디자인 토큰
- **dnd-kit**, **html2canvas**, **jspdf** — UI/보내기 (탭 구현 시 사용)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env.example`을 복사해 `.env.local`을 만듭니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|------|------|
| `MONGODB_URI` | MongoDB Atlas 연결 문자열 |
| `NEXTAUTH_URL` | 앱 URL (로컬: `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | NextAuth 시크릿 (32자 이상 권장) |
| `FIELD_ENCRYPTION_KEY` | 필드 암호화 키 |

### 3. 개발 서버

```bash
npm run dev
```

브라우저에서 [http://localhost:3000/setup](http://localhost:3000/setup) 으로 최초 마스터 비밀번호를 설정합니다.

## 프로젝트 구조

```
src/
├── app/              # App Router 페이지·API
├── components/       # 레이아웃·UI 컴포넌트
├── lib/              # DB, 인증, 암호화 유틸
├── models/           # Mongoose 스키마
└── stores/           # Zustand 스토어
```

## 다음 단계 (PRD 기준)

1. 탭 1 — 유튜브 계정 CRUD + dnd-kit 순서 저장 API
2. 탭 2 — 애드센스·휴대폰 + 유튜브 OTP 해시 연동
3. 탭 3 — 채널 관리 + ObjectId Ref
4. 탭 4 — 수입·지출 + Mongoose pre-save 훅 자동 적재
5. 탭 5 — 대시보드 populate + PDF/Markdown보내기

자세한 요구사항은 [PRD.md](./PRD.md)를 참고하세요.
