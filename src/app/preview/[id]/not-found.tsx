import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-gray-600">404</h1>
        <h2 className="text-2xl font-semibold mb-4">프로젝트를 찾을 수 없습니다</h2>
        <p className="text-gray-400 mb-8">
          요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
        </p>
        <Link
          href="/projects"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          프로젝트 목록으로
        </Link>
      </div>
    </div>
  )
}
