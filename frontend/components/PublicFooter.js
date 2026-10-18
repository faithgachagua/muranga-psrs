import Link from 'next/link';
import Brand from './Brand';

export default function PublicFooter() {
  return (
    <footer className="mt-20 bg-navy-900 text-blue-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div><Brand light /><p className="mt-4 max-w-xs text-sm">Send a request to the county, follow its progress and tell us how we did.</p></div>
        <div><h2 className="mb-3 text-sm font-semibold text-white">Quick links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/register" className="hover:text-white">Create an account</Link></li>
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
            <li><Link href="/track" className="hover:text-white">Track a request</Link></li>
          </ul></div>
        <div><h2 className="mb-3 text-sm font-semibold text-white">County Government of Murang'a</h2>
          <p className="text-sm">Murang'a County Headquarters<br />A prosperous county, a brighter future</p></div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs">© {new Date().getFullYear()} County Government of Murang'a</div>
    </footer>
  );
}
