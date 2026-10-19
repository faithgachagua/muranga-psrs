import PageLoader from '@/components/PageLoader';

// Shown while a page outside the signed-in area loads
export default function Loading() {
  return <PageLoader fullScreen />;
}
