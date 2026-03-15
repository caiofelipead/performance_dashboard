export const metadata = {
  title: 'Saúde e Performance — Botafogo-SP',
  description: 'Dashboard de performance e wellness do elenco',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};
export default function RootLayout({ children }) {
  return (<html lang="pt-BR"><body style={{ margin: 0, transition: "background .3s" }}>{children}</body></html>);
}
