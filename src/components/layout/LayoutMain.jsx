import StickyMenu from './StickyMenu';
import Footer from './Footer';
import CookieBanner from '../common/CookieBanner';
import './LayoutMain.css';

export default function LayoutMain({ children }) {
    return (
        <div className="layout">
            <StickyMenu />
            <main className="layout__content">
                {children}
            </main>
            <Footer />
            <CookieBanner />
        </div>
    );
}
