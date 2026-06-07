import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <AppRoutes />
      <Chatbot />
    </Router>
  );
}

export default App;
