import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDashboard from './pages/MemberDashboard';
import Books from './pages/Books';
import Rankings from './pages/Rankings';
import PeerReview from './pages/PeerReview';
import Events from './pages/Events';
import Academy from './pages/Academy';
import Quotes from './pages/Quotes';
import Log from './pages/Log';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { useUser } from './context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useUser();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/members/:id" element={<MemberDashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/log" element={<Log />} />
                <Route path="/peer-review" element={<PeerReview />} />
                <Route path="/events" element={<Events />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/academy" element={<Academy />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
