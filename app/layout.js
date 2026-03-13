export const metadata = {
  title: 'Saúde e Performance — Botafogo-SP',
  description: 'Dashboard de performance e wellness do elenco',
  icons: {
    icon: 'https://www.ogol.com.br/img/logos/equipas/3154_imgbank_1685113109.png',
    apple: 'https://www.ogol.com.br/img/logos/equipas/3154_imgbank_1685113109.png',
  },
};
export default function RootLayout({ children }) {
  return (<html lang="pt-BR"><body style={{ margin: 0 }}>{children}</body></html>);
}
