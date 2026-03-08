import Header from '../components/Header/Header';
import { UserProvider } from '../context/userContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <ToastContainer position="bottom-center" autoClose={4000} />
      </div>
    </UserProvider>
  );
}
