import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
      <Chatbot />
    </Router>
  );
}

export default App;

