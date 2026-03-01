import Link from "next/link";

export default function AdminNav() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex gap-6">
          <Link
            href="/admin"
            className="text-gray-700 hover:text-primary font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/upload"
            className="text-gray-700 hover:text-primary font-medium"
          >
            Bulk & Paste
          </Link>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-primary"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
