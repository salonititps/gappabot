import { useEffect, useState, useCallback } from 'react';
import { signOut, getUser, getUserFromIdToken } from '@okta/okta-react-native';
import axios from 'axios';

import { useAuthStore } from '../../store/useAuthStore';
import { discoveryUri } from '../../utils/constants';

const useHome = () => {
  const {
    clearTokens,
    loginMethod,
    userInfo: storedUserInfo,
    setUserInfo: setStoreUserInfo,
    accessToken,
  } = useAuthStore();

  const [userInfo, setUserInfo] = useState<any>(storedUserInfo);
  const [loading, setLoading] = useState(true);

  const fetchUserInfoFromApi = useCallback(async (token: string) => {
    const { data } = await axios.get(`${discoveryUri}/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return data;
  }, []);

  const loadUser = useCallback(async () => {
    try {
      if (loginMethod === 'browser') {
        const user: any = await getUser();

        if (user) {
          setUserInfo(user);
          setStoreUserInfo({
            name: user?.name,
            email: user?.email,
            preferred_username: user?.preferred_username,
            given_name: user?.given_name,
            family_name: user?.family_name,
          });
        }
        return;
      }

      if (loginMethod === 'custom' && accessToken) {
        try {
          const userData = await fetchUserInfoFromApi(accessToken);

          setUserInfo(userData);
          setStoreUserInfo({
            name: userData?.name,
            email: userData?.email,
            preferred_username: userData?.preferred_username,
            given_name: userData?.given_name,
            family_name: userData?.family_name,
            sub: userData?.sub,
          });
        } catch (e) {
          console.warn(
            'Failed to fetch user info from API, trying getUserFromIdToken',
            e,
          );
          try {
            const idTokenUser = await getUserFromIdToken();
            setUserInfo(idTokenUser);
            setStoreUserInfo({
              name: idTokenUser?.name as string,
              email: idTokenUser?.email as string,
              preferred_username: idTokenUser?.preferred_username as string,
              given_name: idTokenUser?.given_name as string,
              family_name: idTokenUser?.family_name as string,
              sub: idTokenUser?.sub as string,
            });
          } catch (tokenError) {
            console.warn('Failed to get user from ID token', tokenError);
            if (storedUserInfo) {
              setUserInfo(storedUserInfo);
            }
          }
        }
        return;
      }

      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
      }
    } catch (error) {
      console.warn('Error loading user', error);

      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
      }
    } finally {
      setLoading(false);
    }
  }, [loginMethod, accessToken, storedUserInfo]);

  useEffect(() => {
    if (
      loginMethod === 'browser' ||
      (loginMethod === 'custom' && accessToken)
    ) {
      loadUser();
      return;
    }

    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
    }

    setLoading(false);
  }, [accessToken, loginMethod]);

  const handleLogout = async () => {
    try {
      if (loginMethod === 'browser') {
        await signOut();
      }
    } catch (error) {
      console.warn('Logout error', error);
    } finally {
      clearTokens();
    }
  };

  return {
    userInfo,
    loading,
    handleLogout,
  };
};

export default useHome;
