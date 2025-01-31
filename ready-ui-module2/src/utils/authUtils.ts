import { IPublicClientApplication } from "@azure/msal-browser";

export const getUserId = (instance: IPublicClientApplication) => {
  const accounts = instance.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    return account.homeAccountId;
  }
  return null;
};

export const getUserFullName = (instance: IPublicClientApplication) => {
  const accounts = instance.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    return account.name;
  }
  return null;
};

export const getUserLocation = async (instance: IPublicClientApplication) => {
  try {
    const accounts = instance.getAllAccounts();
    if (accounts.length === 0) return null;

    const response = await instance.acquireTokenSilent({
      scopes: ["User.Read"],
      account: accounts[0]
    });

    const locationResponse = await fetch('https://graph.microsoft.com/v1.0/me/officeLocation/$value', {
      headers: {
        'Authorization': `Bearer ${response.accessToken}`
      }
    });
    if (!locationResponse.body) return null;
    const reader = locationResponse.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(result.value);
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
};

export const getUserIdToken = async (instance: IPublicClientApplication) => {
  const accounts = instance.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    const idToken = account.idToken as any;

    if (idToken) {
      const tokenExpiration = idToken.exp * 1000;
      const currentTime = Date.now();

      if (currentTime >= tokenExpiration) {
        console.warn('JWT token has expired. Refreshing token...');
        try {
          const response = await instance.acquireTokenSilent({
            scopes: ["User.Read"],
            account: account
          });
          return response.idToken;
        } catch (error) {
          console.error('Error refreshing token:', error);
          return null;
        }
      }
      return idToken;
    }
  }
  return null;
};

export const fetchUserPhoto = async (instance: IPublicClientApplication, loginRequest: any): Promise<string | null> => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL;
    // Check local storage for stored photo URL
    const storedUrl = localStorage.getItem('userPhotoUrl');
    if (storedUrl) {
      return storedUrl;
    }

    const accounts = instance.getAllAccounts();
    if (accounts.length === 0) return null;

    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0]
    });

    const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: {
        'Authorization': `Bearer ${response.accessToken}`
      }
    });

    if (!photoResponse.ok) return null;

    const blob = await photoResponse.blob();

    const formData = new FormData();
    formData.append('file', blob, 'user-photo.jpg');

    const idToken = await getUserIdToken(instance);

    // Send the photo to the backend
    const backendResponse = await fetch(`${apiUrl}/users/upload-photo`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      method: 'POST',
      body: formData,
    });

    if (!backendResponse.ok) {
      console.error('Error uploading photo to backend:', backendResponse.statusText);
      return null;
    }

    const backendJson = await backendResponse.json();

    if (backendJson.success && backendJson.responseObject?.url) {
      const url = backendJson.responseObject.url;
      localStorage.setItem('userPhotoUrl', url);
      return url; 
    }
    return null;
  } catch (error) {
    console.error('Error fetching user photo:', error);
    return null;
  }
};

