import './globals.css';

export const metadata = {
  title: 'Dues · Razorpay prototype',
  description: 'See who owes you and nudge them on WhatsApp in under 2 minutes. A concept prototype for the Razorpay AI x PM Build Challenge.',
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1f44' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=IBM+Plex+Mono:wght@500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
