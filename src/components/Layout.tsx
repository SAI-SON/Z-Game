import React from 'react';
import { ParticleField } from '../animations/ParticleField';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-bg">
      <div className="absolute inset-0">
        <ParticleField count={100} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
