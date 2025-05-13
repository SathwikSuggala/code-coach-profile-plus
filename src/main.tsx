
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Custom CSS for code editor
const customStyles = document.createElement('style');
customStyles.textContent = `
  pre.code-block {
    background-color: #282c34;
    color: #abb2bf;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    font-family: "Consolas", "Monaco", "Andale Mono", "Ubuntu Mono", monospace;
    font-size: 0.875rem;
    white-space: pre;
  }

  .api-card {
    transition: all 0.2s ease;
  }
  
  .api-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  
  .bg-dev-blue {
    background-color: #1e40af;
  }
  
  .text-dev-blue {
    color: #1e40af;
  }
`;
document.head.appendChild(customStyles);

createRoot(document.getElementById("root")!).render(<App />);
