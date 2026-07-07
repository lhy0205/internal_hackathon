import Sidebar from './Sidebar';
import Hearts from '../common/Hearts';

export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="page-layout">
      <Sidebar />

      <div className="page-layout__main">
        {/* Desktop Header */}
        <header className="desktop-header">
          <div className="desktop-header__left">
            <h1 className="desktop-header__title">{title}</h1>
            {subtitle && <p className="desktop-header__subtitle">{subtitle}</p>}
          </div>
          <div className="desktop-header__right">
            <Hearts filled={2} total={3} />
            <button className="desktop-header__settings">⚙ 설정</button>
          </div>
        </header>

        <div className="page-layout__content">
          {children}
        </div>
      </div>
    </div>
  );
}
