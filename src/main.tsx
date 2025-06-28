import '@/components/keenicons/assets/styles.css';
import './styles/globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { ProvidersWrapper } from './providers';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <ProvidersWrapper>
      <App />
    </ProvidersWrapper>
  </GoogleOAuthProvider>
);
