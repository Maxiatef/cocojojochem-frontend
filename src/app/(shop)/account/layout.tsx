import localFont from 'next/font/local';

const display = localFont({
  src: [
    { path: '../../../fonts/SpaceGrotesk-500.ttf', weight: '500', style: 'normal' },
    { path: '../../../fonts/SpaceGrotesk-600.ttf', weight: '600', style: 'normal' },
    { path: '../../../fonts/SpaceGrotesk-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-account-display',
});

const mono = localFont({
  src: [
    { path: '../../../fonts/JetBrainsMono-400.ttf', weight: '400', style: 'normal' },
    { path: '../../../fonts/JetBrainsMono-500.ttf', weight: '500', style: 'normal' },
    { path: '../../../fonts/JetBrainsMono-600.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-account-mono',
});

export default function AccountSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
