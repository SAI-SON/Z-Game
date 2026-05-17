import { Outlet } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import Layout from './Layout';

export default function ProtectedLayout() {
  return (
    <AuthGuard>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGuard>
  );
}
