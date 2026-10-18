import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

export default function PublicLayout({ children }) {
  return (<><PublicHeader /><main>{children}</main><PublicFooter /></>);
}
