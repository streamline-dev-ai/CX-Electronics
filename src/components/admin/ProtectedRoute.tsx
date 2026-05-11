// TEMPORARY: admin auth is disabled while we sort out login issues.
// To restore protection, replace this file with the original allow-list version
// (see git history — commit before this one).

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
