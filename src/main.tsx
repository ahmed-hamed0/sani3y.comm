
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './craftsmen/profileStyles.css'; // Fixed import path

createRoot(document.getElementById("root")).render(<App />);
