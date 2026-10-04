import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar/Sidebar';
import { Navbar } from '../components/navigation/Navbar/Navbar';
import './MainLayout.css';

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="main-layout">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="main-layout-body">
        <Navbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="main-content-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
