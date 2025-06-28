import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel } from '@/auth';
import ApiClient from '@/utils/ApiClient';
import { usePremium, useUser } from '@/store/store';
import { SubscriptionDetailsType, User } from '@/interface';

const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/auth/login`;
export const REGISTER_URL = `${API_URL}/auth/signup`;
export const FORGOT_PASSWORD_URL = `${API_URL}/auth/reset-password/request`;
export const RESET_PASSWORD_URL = `${API_URL}/auth/reset-password/change`;
export const GET_USER_URL = `${API_URL}/auth/user`;
export const GOOGLE_LOGIN_URL = `${API_URL}/auth/google-login`;
export const SEND_OTP_URL = `${API_URL}/auth/send-otp`;

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, password: string, remember: boolean) => Promise<void | unknown>;
  loginGoogle: (token: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  // register: (email: string, password: string, password_confirmation: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    password_confirmation: string,
    name: string,
    jobTitle: string,
    referral: string
  ) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string
    // password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}
const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { setUser } = useUser();
  const { setIsPremium, setSubscription, setPlanDetails } = usePremium();

  const verify = async () => {
    if (auth) {
      try {
        const { data: user } = await getUser();
        setCurrentUser(user);
        setUser(user);
      } catch {
        saveAuth(undefined);
        setCurrentUser(null);
        setUser(null);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string, remember: boolean) => {
    const { data } = await ApiClient.post(LOGIN_URL, { email, password, remember });

    return new Promise((resolve, reject) => {
      try {
        // Ensure `accessToken` is correctly mapped to `access_token`

        if (data.isPasswordResetRequired) {
          const { resetToken, email } = data;
          const resetUrl = `/auth/reset-password/change?token=${resetToken}&email=${encodeURIComponent(email)}`;
          window.location.href = resetUrl;
          resolve(true);
          return;
        }

        const auth: AuthModel = {
          access_token: data.accessToken, // Ensure correct mapping
          refreshToken: data.refreshToken || '',
          api_token: data.api_token || ''
        };

        saveAuth(auth);
        setTimeout(async () => {
          try {
            const { data: user } = await getUser();
            if (user) {
              localStorage.setItem('userEmail', user.email);
              localStorage.setItem('userName', user.name);
            }
            setCurrentUser(user);
            setUser(user);
            resolve(true);
          } catch (userError) {
            reject(new Error(`Error ${userError}`));
          }
        }, 100);
      } catch (error) {
        saveAuth(undefined);
        // console.error('Login error:', error);
        reject(new Error(`Error ${error}`));
      }
    });
  };

  const loginGoogle = async (token: string) => {
    try {
      const { data } = await ApiClient.post(GOOGLE_LOGIN_URL, {
        token: token // Send token to backend
      });

      const auth: AuthModel = {
        access_token: data.accessToken, // Ensure correct mapping
        refreshToken: data.refreshToken || '',
        api_token: data.api_token || ''
      };
      saveAuth(auth);
      setTimeout(async () => {
        const { data: user } = await getUser();
        if (user) {
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userName', user.name);
        }
        if (user) {
          setCurrentUser(user);
          setUser(user);
        }
      }, 100);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const register = async (
    email: string,
    password: string,
    password_confirmation: string,
    name: string,
    jobTitle: string,
    referral: string
  ) => {
    try {
      const { data } = await axios.post(REGISTER_URL, {
        email,
        password,
        password_confirmation,
        name,
        jobTitle,
        referral
      });
      const auth: AuthModel = {
        access_token: data.accessToken, // Ensure correct mapping
        refreshToken: data.refreshToken || '',
        api_token: data.api_token || ''
      };
      saveAuth(auth);
      try {
        await axios.post(
          SEND_OTP_URL,
          {},
          {
            headers: {
              Authorization: `Bearer ${auth.access_token}` // Pass token
            }
          }
        );
      } catch {
        throw new Error('OTP sending failed');
      }
      // Wait for auth state to update before fetching user
      setTimeout(async () => {
        const { data: user } = await getUser();
        if (user) {
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userName', user.name);
        }
        setCurrentUser(user);
        setUser(user);
      }, 100);
    } catch (error: any) {
      saveAuth(undefined);
      const errorMessage =
        error?.response?.data?.message || error.message || 'Something went wrong';
      throw new Error(errorMessage);
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    await ApiClient.post(FORGOT_PASSWORD_URL, {
      email
    });
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string
    // password_confirmation: string
  ) => {
    await ApiClient.post(RESET_PASSWORD_URL, {
      email,
      token,
      password
      // password_confirmation
    });
  };

  const getSubscriptionDetails = (companyId: number) => {
    return new Promise((resolve) => {
      ApiClient.get<SubscriptionDetailsType>(`/company/premium/${companyId}`)
        .then((res) => {
          setIsPremium(res.data.isPremium);
          if (res.data.isPremium && res.data.subscription) {
            setSubscription(res.data.subscription);
          }
          if (res.data.isPremium && res.data.planDetails) {
            setPlanDetails(res.data.planDetails);
          }
        })
        .finally(() => {
          resolve(true);
        });
    });
  };

  const getUser = async () => {
    const storedAuth = authHelper.getAuth(); // Get latest auth from localStorage
    if (!storedAuth?.access_token) {
      throw new Error('No auth token found');
    }
    const response = await ApiClient.get<User>(GET_USER_URL, {
      headers: {
        Authorization: `Bearer ${storedAuth.access_token}`
      }
    });

    if (response.data.companyId) {
      await getSubscriptionDetails(response.data.companyId);
    }

    return Promise.resolve(response);
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        loginGoogle,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
