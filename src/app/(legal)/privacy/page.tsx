import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보 처리방침 | AI Book',
  description: 'AI Book 서비스의 개인정보 처리방침',
}

export default function PrivacyPage() {
  return (
    <>
      <h1>개인정보 처리방침</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        시행일: 2026년 2월 20일
      </p>

      <p>
        AI Book(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 중요시하며,
        「개인정보 보호법」을 준수합니다. 본 방침은 서비스가 수집하는 개인정보의
        항목, 수집 목적, 보유 기간 및 이용자의 권리를 안내합니다.
      </p>

      <h2>1. 수집하는 개인정보 항목</h2>
      <ul>
        <li>
          <strong>필수 수집:</strong> 이메일 주소, 비밀번호(해시 처리), 이름(닉네임)
        </li>
        <li>
          <strong>소셜 로그인 시:</strong> OAuth 제공자로부터 전달받는 이메일, 프로필
          이미지, 고유 식별자
        </li>
        <li>
          <strong>자동 수집:</strong> IP 주소, 접속 일시, 브라우저 정보 (서비스 보안
          및 오류 분석 목적)
        </li>
      </ul>

      <h2>2. 개인정보의 수집 및 이용 목적</h2>
      <ul>
        <li>회원가입 및 본인 확인</li>
        <li>서비스 제공 (AI 기반 책 집필 기능)</li>
        <li>서비스 개선 및 오류 분석</li>
        <li>부정 이용 방지 및 보안</li>
      </ul>

      <h2>3. 제3자 제공 (AI 서비스)</h2>
      <p>
        본 서비스는 책 집필을 위해 이용자가 입력한 콘텐츠(주제, 설명, 텍스트)를
        Anthropic(Claude API)에 전송합니다. 전송되는 데이터는 AI 모델의 응답
        생성에만 사용되며, Anthropic의{' '}
        <a
          href="https://www.anthropic.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          개인정보 처리방침
        </a>
        에 따라 처리됩니다.
      </p>

      <h2>4. 개인정보의 보유 및 파기</h2>
      <ul>
        <li>
          <strong>보유 기간:</strong> 회원 탈퇴 시까지 또는 수집 목적 달성 시까지
        </li>
        <li>
          <strong>파기 방법:</strong> 전자적 파일은 기술적 방법으로 영구 삭제, 종이
          문서는 파쇄
        </li>
        <li>
          관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 별도
          보관합니다.
        </li>
      </ul>

      <h2>5. 이용자의 권리 및 행사 방법</h2>
      <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
      <ul>
        <li>개인정보 열람, 정정, 삭제 요청</li>
        <li>처리 정지 요청</li>
        <li>회원 탈퇴</li>
      </ul>
      <p>
        위 요청은 서비스 내 설정 페이지 또는 이메일을 통해 접수할 수 있으며, 지체
        없이 처리합니다.
      </p>

      <h2>6. 개인정보의 안전성 확보 조치</h2>
      <ul>
        <li>비밀번호 bcrypt 해시 처리</li>
        <li>HTTPS 통신 암호화</li>
        <li>CSRF 보호 및 Rate Limiting 적용</li>
        <li>접근 권한 최소화 및 로그 관리</li>
      </ul>

      <h2>7. 개인정보 보호 책임자</h2>
      <p>
        개인정보 처리에 관한 문의, 불만, 피해 구제는 아래 연락처로 접수해 주시기
        바랍니다. 접수 후 10일 이내에 답변 드리겠습니다.
      </p>
      <ul>
        <li>
          <strong>서비스명:</strong> AI Book
        </li>
        <li>
          <strong>이메일:</strong> support@aibook.example.com
        </li>
      </ul>
    </>
  )
}
