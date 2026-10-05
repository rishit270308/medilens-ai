import './globals.css';

export const metadata = {
  title: 'MediLens AI — Clinical EHR Digitizer',
  description: 'Multimodal EHR Digitizer, Vernacular Translator & Clinical Decision Support System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
