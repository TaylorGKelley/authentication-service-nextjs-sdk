import { cache } from 'react';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// src/config.ts
var config = {
  AUTH_SERVICE_CONNECTED_SERVICE_ID: process.env.AUTH_SERVICE_CONNECTED_SERVICE_ID,
  AUTH_SERVICE_HOST_URL: process.env.AUTH_SERVICE_HOST_URL,
  SITE_URL: process.env.SITE_URL,
  SITE_UNAUTHORIZED_URL: process.env.SITE_UNAUTHORIZED_URL,
  SITE_LOGIN_URL: process.env.SITE_LOGIN_URL,
  AUTH_POST_LOGOUT_REDIRECT: process.env.AUTH_POST_LOGOUT_REDIRECT,
  AUTH_PUBLIC_ROUTE_PERMISSION: process.env.AUTH_PUBLIC_ROUTE_PERMISSION || "default"
};
var config_default = config;
async function getToken(token) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  let tokenValue;
  switch (token) {
    case "accessToken": {
      const isRefreshed = headerStore.get("x-token-refreshed") === "true";
      tokenValue = isRefreshed ? headerStore.get("x-access-token") || "" : cookieStore.get("accessToken")?.value || "";
      break;
    }
    case "csrfToken": {
      const isRefreshed = headerStore.get("x-csrf-refreshed") === "true";
      tokenValue = isRefreshed ? headerStore.get("x-csrf-token") || "" : cookieStore.get("csrfToken")?.value || "";
      break;
    }
    case "_csrfCookie": {
      const isRefreshed = headerStore.get("x-csrf-refreshed") === "true";
      tokenValue = isRefreshed ? headerStore.get("x-xsrf-token") || "" : cookieStore.get("_csrf")?.value || "";
      break;
    }
  }
  return tokenValue;
}
var getToken_default = getToken;

// src/apiClient/index.ts
async function fetchWithAuth(input, init) {
  try {
    let accessToken = await getToken_default("accessToken");
    const csrfToken = await getToken_default("csrfToken");
    const response = await fetch(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRF-Token": csrfToken,
        cookie: `_csrf=${await getToken_default("_csrfCookie")};`,
        ...init?.headers
      }
    });
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// src/utils/getPermissions.ts
var getPermissions = cache(async () => {
  try {
    const response = await fetchWithAuth(
      `${config_default.AUTH_SERVICE_HOST_URL}/api/v1/user-permissions/${config_default.AUTH_SERVICE_CONNECTED_SERVICE_ID}`,
      {
        method: "get"
      }
    );
    if (!response.success) throw new Error(response.message);
    return response.data;
  } catch (error) {
    throw error;
  }
});
var getPermissions_default = getPermissions;
function isExpiredToken(token) {
  const { exp } = jwt.decode(token);
  const expirationTime = exp * 1e3;
  return expirationTime < Date.now() - 2 * 60 * 1e3;
}
var getCSRFToken = async () => {
  try {
    const cookieStore = await cookies();
    const csrfToken = cookieStore.get("csrfToken")?.value;
    return csrfToken;
  } catch (error) {
    return null;
  }
};

// src/utils/parseCookie.ts
var parseCookie = (name, cookieHeader) => {
  if (!cookieHeader || cookieHeader.length === 0) return {};
  const cookie = cookieHeader.find((cookie2) => cookie2.startsWith(name));
  if (!cookie) return {};
  const pairs = cookie.split(";");
  const [key, value] = pairs[0].split("=");
  const splittedPairs = pairs.slice(1).map((cookie2) => cookie2.split("="));
  const cookieObj = Object.fromEntries(
    splittedPairs.reduce(
      (obj, pair) => {
        obj.set(
          decodeURIComponent(pair[0]?.trim()),
          decodeURIComponent(pair[1]?.trim())
        );
        const [key2, value2] = [pair[0]?.trim(), pair[1]?.trim()];
        switch (key2) {
          case "Secure":
          case "HttpOnly":
            obj.set(key2, Boolean(value2));
            break;
          case "SameSite":
            obj.set(key2, value2);
            break;
          case "Domain":
          case "Path":
            obj.set(key2, value2);
            break;
          case "Expires":
            obj.set(key2, new Date(value2));
            break;
          case "Max-Age":
            obj.set(key2, parseInt(value2));
            break;
        }
        return obj;
      },
      /* @__PURE__ */ new Map()
    )
  );
  cookieObj.Name = key;
  cookieObj.Value = value;
  return cookieObj;
};

// src/utils/refreshTokens.ts
var refreshTokens = async () => {
  const cookieStore = await cookies();
  let csrfToken = await getCSRFToken();
  let newXSRFToken = void 0;
  if (!csrfToken) {
    const csrfResponse = await fetch(
      config_default.AUTH_SERVICE_HOST_URL + "/api/v1/csrf-token",
      {
        method: "get"
      }
    );
    const { csrfToken: newCSRFToken } = await csrfResponse.json();
    const xsrfCookie = parseCookie(
      "_csrf",
      csrfResponse.headers.getSetCookie()
    );
    cookieStore.set("_csrf", xsrfCookie.Value, {
      httpOnly: xsrfCookie.HttpOnly || true,
      // expires: undefined, // cookie will expire at end of browser session
      path: xsrfCookie.Path ?? "/",
      sameSite: xsrfCookie.SameSite || "lax"
    });
    cookieStore.set("csrfToken", newCSRFToken, {
      httpOnly: true,
      // expires: undefined, // cookie will expire at end of browser session
      sameSite: "lax",
      path: "/"
    });
    csrfToken = newCSRFToken;
    newXSRFToken = xsrfCookie.Value;
  }
  const response = await fetch(
    config_default.AUTH_SERVICE_HOST_URL + "/api/v1/refresh-token",
    {
      method: "post",
      headers: {
        "X-CSRF-Token": csrfToken,
        cookie: `refreshToken=${cookieStore.get("refreshToken")?.value}; _csrf=${cookieStore.get("_csrf")?.value}`
      }
    }
  );
  if (response.status == 200 || response.status == 201) {
    const refreshResponse = await response.json();
    const { accessToken } = refreshResponse;
    const refreshCookie = parseCookie(
      "refreshToken",
      response.headers.getSetCookie()
    );
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60 * 1e3),
      // 15 minutes
      path: "/",
      sameSite: "lax"
    });
    cookieStore.set("refreshToken", refreshCookie.Value, {
      httpOnly: refreshCookie.HttpOnly || true,
      expires: refreshCookie.Expires,
      path: refreshCookie.Path ?? "/",
      sameSite: refreshCookie.SameSite || "lax"
    });
    return { accessToken, csrfToken, xsrfToken: newXSRFToken };
  } else {
    throw new Error("Failed to refresh token");
  }
};
var refreshTokens_default = refreshTokens;
var authMiddleware = async (req, options, onSuccess) => {
  try {
    const url = req.nextUrl.clone();
    if (!Object.keys(options.protectedPaths).includes(url.pathname)) {
      return await onSuccess({ user: null });
    }
    const refreshToken = req.cookies.get("refreshToken")?.value;
    let accessToken = req.cookies.get("accessToken")?.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    let newAccessToken = void 0;
    let newCSRFToken = void 0;
    let newXSRFToken = void 0;
    if (!accessToken || isExpiredToken(accessToken)) {
      try {
        ({
          accessToken: newAccessToken,
          csrfToken: newCSRFToken,
          xsrfToken: newXSRFToken
        } = await refreshTokens_default());
      } catch (error) {
        return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
      }
    }
    const { user, permissions } = await getPermissions_default();
    if (!user) {
      return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    if (!options.protectedPaths[url.pathname].some(
      (permission) => permissions.includes(permission) || permission === config_default.AUTH_PUBLIC_ROUTE_PERMISSION
    )) {
      return NextResponse.redirect(new URL(config_default.SITE_UNAUTHORIZED_URL));
    }
    const res = await onSuccess({ user });
    if (!newAccessToken) return res;
    const finalResponse = NextResponse.next({
      request: {
        headers: new Headers(req.headers)
      }
    });
    finalResponse.headers.set("x-access-token", newAccessToken);
    finalResponse.headers.set("x-csrf-token", newCSRFToken || "");
    finalResponse.headers.set("x-xsrf-token", newXSRFToken || "");
    finalResponse.headers.set(
      "x-csrf-refreshed",
      String(newXSRFToken !== void 0)
    );
    finalResponse.headers.set("x-token-refreshed", "true");
    return finalResponse;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
  }
};
var withAuth = (middleware, options) => {
  return async (...args) => {
    const req = args[0];
    return await authMiddleware(req, options, async ({ user }) => {
      args[0].user = user;
      return await middleware(...args);
    });
  };
};

// src/apiClient/server/index.ts
async function fetchWithAuthServerSide(input, init) {
  try {
    let accessToken = await getToken_default("accessToken");
    let csrfToken = await getToken_default("csrfToken");
    let xsrfToken = await getToken_default("_csrfCookie");
    if (!accessToken || isExpiredToken(accessToken)) {
      const newTokens = await refreshTokens_default();
      accessToken = newTokens.accessToken;
      csrfToken = newTokens.csrfToken;
      if (newTokens.xsrfToken) {
        xsrfToken = newTokens.xsrfToken;
      }
    }
    const response = await fetch(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-CSRF-Token": csrfToken,
        cookie: `_csrf=${xsrfToken};`,
        ...init?.headers
      }
    });
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export { fetchWithAuth, fetchWithAuthServerSide, withAuth };
