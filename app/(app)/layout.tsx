import Header from "../components/Header/Header";
import { UserProvider } from "../context/userContext";

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode
}>) {
  return (
    <UserProvider>
      <div>
        <Header />
        {children}
        {modal}
      </div>
    </UserProvider>
  );
}
