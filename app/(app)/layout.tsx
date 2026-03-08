import Header from '../components/Header/Header';
import { UserProvider } from '../context/userContext';
import { ToastContainer } from 'react-toastify';
import SolicitationNotifier from '../components/SolicitationNotifier/SolicitationNotifier';
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
        <SolicitationNotifier />
        {children}
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </UserProvider>
  );
}
