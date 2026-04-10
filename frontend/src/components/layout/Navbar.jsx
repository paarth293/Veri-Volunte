'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Badge from '@/components/ui/Badge';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/events', label: 'Browse Events' },
  { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <header className={styles.header} id="main-navbar">
      <nav className={styles.nav}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <span className={styles.logoText}>
            Veri<span className={styles.logoAccent}>Volunte</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {NAV_LINKS.filter(l => !l.requiresAuth || user).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[styles.link, pathname === link.href ? styles.active : ''].join(' ')}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className={styles.actions}>
          <ThemeToggle />

          {user ? (
            <div className={styles.userMenu}>
              {profile?.role && (
                <Badge color={profile.role === 'NGO' ? 'secondary' : 'primary'}>
                  {profile.role}
                </Badge>
              )}
              <Link href="/profile" className={styles.avatar} title="My profile" id="nav-profile-link">
                {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
              </Link>
              <button onClick={handleSignOut} className={styles.signOutBtn} id="nav-signout-btn">
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn} id="nav-login-btn">
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="nav-hamburger-btn"
          >
            {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.filter(l => !l.requiresAuth || user).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[styles.mobileLink, pathname === link.href ? styles.active : ''].join(' ')}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Profile</Link>
              <button onClick={handleSignOut} className={styles.mobileSignOut}>Sign Out</button>
            </>
          ) : (
            <Link href="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
