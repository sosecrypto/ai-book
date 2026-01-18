# AI Book

AI 기반 책 집필 서비스

## 개요

사용자가 원하는 책의 주제와 스타일을 입력하면, 여러 AI 에이전트가 협업하여 책을 완성해주는 서비스입니다.

## Multi-Agent Architecture

```
사용자 입력 → Research Agent → Outliner Agent → Writer Agent → Editor Agent → Critic Agent → PDF 출력
                    ↑                                              ↓
                    └──────────────── 피드백 루프 ─────────────────┘
```

### Agent Roles

1. **Research Agent** - 자료 조사 및 검색
   - 웹 검색을 통한 관련 자료 수집
   - 참고 문헌 정리
   - 팩트 체크

2. **Outliner Agent** - 구조 설계
   - 책의 전체 구조 설계
   - 챕터 및 섹션 구성
   - 목차 생성

3. **Writer Agent** - 본문 작성
   - 한 페이지/섹션씩 순차 작성
   - 문체 일관성 유지
   - 사용자 선호 스타일 반영

4. **Editor Agent** - 검수 및 교정
   - 문법 및 맞춤법 검사
   - 문장 다듬기
   - 일관성 검토

5. **Critic Agent** - 평가 및 피드백
   - 품질 평가 (Pass/Revise 결정)
   - 개선 방향 제시
   - 최종 승인

## 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **AI Model**: Claude (Anthropic API - Headless Mode)
- **PDF Generation**: react-pdf / pdfmake
- **Database**: SQLite (책 프로젝트 저장)
- **State Management**: Zustand

## 책 종류

사용자가 선택 가능:
- 소설 (Fiction)
- 비소설/논픽션 (Non-fiction)
- 자기계발 (Self-help)
- 기술서적 (Technical)
- 에세이 (Essay)
- 동화 (Children's Book)
- 시집 (Poetry)

## 출력 형식

- PDF (A5, A4 선택 가능)
- 표지 디자인 포함
- 목차 자동 생성
- 페이지 번호 자동 삽입

## 프로젝트 구조

```
ai_book/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── page.tsx   # 메인 페이지
│   │   ├── write/     # 책 작성 페이지
│   │   └── preview/   # 미리보기 페이지
│   ├── agents/        # AI Agent 모듈
│   │   ├── research.ts
│   │   ├── outliner.ts
│   │   ├── writer.ts
│   │   ├── editor.ts
│   │   └── critic.ts
│   ├── lib/
│   │   ├── claude.ts  # Claude API 연동
│   │   └── pdf.ts     # PDF 생성
│   └── components/    # React 컴포넌트
├── public/
└── package.json
```

## 개발 현황

- [ ] 프로젝트 초기 설정
- [ ] Agent 시스템 설계
- [ ] Claude API 연동
- [ ] UI 구현
- [ ] PDF 출력 기능
- [ ] 테스트 및 최적화
