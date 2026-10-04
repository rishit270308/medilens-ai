export const metadata = {
  title: 'MediLens AI — Multimodal EHR Digitizer',
  description: 'Hackdays 2.0 Project by Team Hackathoners (GCET)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}