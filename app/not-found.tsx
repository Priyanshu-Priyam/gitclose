import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-8 py-12 text-center">
      <h1 className="text-xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-gray-400">
        The resource you requested does not exist or may have been removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-emerald-400 hover:text-emerald-300"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
