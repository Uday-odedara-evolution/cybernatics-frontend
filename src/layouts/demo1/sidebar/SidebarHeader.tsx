import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout } = useDemo1Layout();

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        {/* Full logo when sidebar is expanded */}
        <img
          src={toAbsoluteUrl('/media/app/newlogo.png')}
          className="default-logo h-10 w-auto max-w-[180px]"
        />
        {/* Mini logo when sidebar is collapsed */}
        <img
          src={toAbsoluteUrl('/media/app/new-mini.png')}
          className="small-logo h-10 w-auto max-w-[50px]"
        />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img
          src={toAbsoluteUrl('/media/app/newlogo.png')}
          className="default-logo h-10 w-auto max-w-[180px]"
        />
        <img
          src={toAbsoluteUrl('/media/app/new-mini.png')}
          className="small-logo h-10 w-auto max-w-[50px]"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      {/* Full logo for dark mode */}
      <img
        src={toAbsoluteUrl('/media/app/newlogo.png')}
        className="default-logo h-10 w-auto max-w-[180px]"
      />
      {/* Mini logo when sidebar is collapsed */}
      <img
        src={toAbsoluteUrl('/media/app/new-mini.png')}
        className="small-logo h-10 w-auto max-w-[50px]"
      />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
    >
      {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
