type Cookie = {
  Name: string;
  Value: string;
  HttpOnly?: boolean;
  SameSite?: 'lax' | 'strict' | 'none';
  Path?: string;
  Secure?: boolean;
  Expires?: Date;
  'Max-Age'?: number;
  Domain?: string;
};

const parseCookie = (name: string, cookieHeader: string[] | undefined) => {
  if (!cookieHeader || cookieHeader.length === 0) return {} as Cookie;

  const cookie = cookieHeader.find((cookie) => cookie.startsWith(name));

  if (!cookie) return {} as Cookie;

  const pairs = cookie.split(';');
  const [key, value] = pairs[0].split('=');

  const splittedPairs = pairs.slice(1).map((cookie) => cookie.split('='));
  const cookieObj = Object.fromEntries(
    splittedPairs.reduce(
      (obj: Map<keyof Cookie, Cookie[keyof Cookie]>, pair: string[]) => {
        obj.set(
          decodeURIComponent(pair[0]?.trim()) as keyof Cookie,
          decodeURIComponent(pair[1]?.trim())
        );
        const [key, value] = [pair[0]?.trim(), pair[1]?.trim()];
        switch (key) {
          case 'Secure':
          case 'HttpOnly':
            obj.set(key, Boolean(value));
            break;
          case 'SameSite':
            obj.set(key, value as 'lax' | 'strict' | 'none');
            break;
          case 'Domain':
          case 'Path':
            obj.set(key, value);
            break;
          case 'Expires':
            obj.set(key, new Date(value));
            break;
          case 'Max-Age':
            obj.set(key, parseInt(value));
            break;
        }

        return obj;
      },
      new Map()
    )
  ) as Cookie;

  cookieObj.Name = key;
  cookieObj.Value = value;

  console.log(cookieObj);

  return cookieObj;
};

export { parseCookie as default, type Cookie };
