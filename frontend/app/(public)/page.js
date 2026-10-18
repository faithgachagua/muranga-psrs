import Link from 'next/link';
import { ArrowRight, Bell, FilePlus2, Paperclip, Search, Star, UserPlus } from 'lucide-react';
import TrackBox from '@/components/TrackBox';
import { SECTOR_LIST } from '@/lib/sectors';
import { IMAGES } from '@/lib/images';

const STEPS = [
  { icon: UserPlus, title: 'Create an account', text: 'Register with your email and national ID number. It takes a minute.' },
  { icon: FilePlus2, title: 'Send your request', text: 'Pick the sector and your ward, describe the issue and attach photos if you have them.' },
  { icon: Bell, title: 'Follow the progress', text: 'See it move from Submitted to Resolved and get a notification at every step.' },
  { icon: Star, title: 'Rate the service', text: 'Once it is resolved, tell us how it was handled so we can improve.' },
];

const QUICK = [
  { href: '/submit', icon: FilePlus2, title: 'Send a request', text: 'Report an issue or ask for a county service.' },
  { href: '/track', icon: Search, title: 'Track a request', text: 'Check progress with your reference number.' },
  { href: '/register', icon: UserPlus, title: 'Create an account', text: 'Register once, use it for every request.' },
];

export default function Landing() {
  return (
    <>
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">Report it. Track it. <span className="text-brand-600">See it fixed.</span></h1>
            <p className="mt-4 max-w-lg text-lg text-ink-600">Broken road, blocked sewer, missed garbage collection? Send your request to the county under the right sector and follow it until it is resolved.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/submit" className="btn-primary px-6 py-3 text-base"><FilePlus2 className="h-5 w-5" aria-hidden="true" />Send a request</Link>
              <Link href="/login" className="btn-outline px-6 py-3 text-base">Log in</Link>
            </div>
            <div className="mt-8 max-w-lg rounded-2xl border border-blue-100 bg-white p-4 shadow-tile">
              <p className="mb-2 text-sm font-semibold text-navy-900">Already sent a request? Track it</p>
              <TrackBox />
            </div>
          </div>
          <img src={IMAGES.landingHero} alt="Green hills below a snow-capped peak in Murang'a County" width="893" height="1761"
            className="mx-auto aspect-[4/5] w-full max-w-md rounded-3xl object-cover shadow-2xl ring-1 ring-blue-100 lg:ml-auto lg:mr-0" />
        </div>
      </section>

      <section className="mx-auto mt-2 grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        {QUICK.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="tile group flex items-start gap-4 p-5">
            <span className="icon-tile"><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <span className="flex-1"><span className="block font-heading font-semibold text-navy-900">{title}</span><span className="mt-0.5 block text-sm text-ink-500">{text}</span></span>
            <ArrowRight className="mt-1 h-4 w-4 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-28 px-4 pt-20">
        <h2 className="text-center text-3xl font-bold text-navy-900">How it works</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">Four simple steps from reporting an issue to rating the result.</p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card relative pt-8">
              <span className="absolute -top-4 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 font-heading text-sm font-bold text-white">{i + 1}</span>
              <span className="icon-tile mb-3"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3 className="font-semibold text-navy-900">{title}</h3>
              <p className="mt-1 text-sm text-ink-500">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="services" className="mx-auto max-w-6xl scroll-mt-28 px-4 pt-20">
        <h2 className="text-center text-3xl font-bold text-navy-900">Choose a sector</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">Pick the sector that fits your issue and your request is filed under it for the county to act on.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTOR_LIST.map(({ slug, name, icon: Icon }) => (
            <Link key={slug} href={`/submit?sector=${slug}`} className="tile group flex items-center gap-4 p-4">
              <span className="icon-tile"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="flex-1 font-medium text-ink-800">{name}</span>
              <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 bg-cover bg-right px-8 py-12 text-white sm:px-12 sm:py-16" style={{ backgroundImage: `url(${IMAGES.landingBand})` }}>
          <div className="relative max-w-md">
            <h2 className="text-3xl font-bold">Add a photo, get it fixed faster</h2>
            <p className="mt-2 text-blue-100"><Paperclip className="mr-1 inline h-4 w-4" aria-hidden="true" />Attach photos or documents to any request, so the county sees exactly what you see.</p>
            <Link href="/register" className="btn-primary mt-6">Create an account<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
