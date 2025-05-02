import Header from '../components/Header/Header';
import { UserProvider } from '../context/userContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <div>
        <Header />
        {children}
      </div>
    </UserProvider>
  );
}
