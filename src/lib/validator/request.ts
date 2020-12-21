import axios from 'axios';

interface IHeaders {
  [name: string]: string;
}
interface IRequestOptions {
  url: string;
  method: 'get' | 'post' | 'put' | 'delete';
  data?: any;
  headers?: IHeaders;
  params?: any;
}

interface IResponse {
  status: number;
  headers: IHeaders;
  response: {
    success: boolean;
    data?: any;
    errors?: any;
    message?: string;
  };
}

const request = async (options: IRequestOptions): Promise<IResponse> => {
  try {
    const rs = await axios(options);
    return {
      status: rs.status,
      headers: rs.headers,
      response: rs.data,
    };
  } catch (e) {
    if (e.response) {
      return {
        status: e.response.status,
        headers: e.response.headers,
        response: e.response.data,
      };
    } else {
      throw e;
    }
  }
};

export const validateGoogleToken = async (token: string) => {
  const checkTokenUrl = process.env.CHECK_TOKEN_GG_URL;
  const options: IRequestOptions = {
    url: `${checkTokenUrl}${token}`,
    method: 'get',
    headers: {
      'User-Agent': 'midom',
      'Content-Type': 'application/json',
    },
  };
  const socialInfor = await request(options);
  return socialInfor;
};

export const validateFacebookToken = async (id: string, token: string) => {
  let checkTokenUrl = process.env.CHECK_TOKEN_FB_URL;
  checkTokenUrl = checkTokenUrl.replace('{id}', id);
  const options: IRequestOptions = {
    url: `${checkTokenUrl}${token}`,
    method: 'get',
    headers: {
      'User-Agent': 'midom',
      'Content-Type': 'application/json',
    },
  };
  const socialInfor = await request(options);
  return socialInfor;
};

export const validateAppleCode = async (code: string, clientSecret: string) => {
  const verifyAppleUrl = process.env.VERIFY_APPLE_URL;
  const appleClientId = process.env.APPLE_CLIENT_ID;
  const options: IRequestOptions = {
    url: verifyAppleUrl,
    method: 'post',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: {
      client_id: appleClientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
    },
  };
  const socialInfor = await request(options);
  return socialInfor;
};
