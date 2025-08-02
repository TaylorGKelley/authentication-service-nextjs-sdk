var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

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

// src/utils/getPermissions.ts
import { cache } from "react";

// src/utils/getCSRFToken.ts
import { cookies } from "next/headers";
var getCSRFToken = () => __async(null, null, function* () {
  var _a;
  try {
    const cookieStore = yield cookies();
    const csrfToken = (_a = cookieStore.get("csrfToken")) == null ? void 0 : _a.value;
    return csrfToken;
  } catch (error) {
    return null;
  }
});

// src/apiClient/index.ts
import { cookies as cookies2 } from "next/headers";
function fetchWithAuth(input, init) {
  return __async(this, null, function* () {
    var _a;
    try {
      const cookieStore = yield cookies2();
      let accessToken = (_a = cookieStore.get("accessToken")) == null ? void 0 : _a.value;
      const csrfToken = yield getCSRFToken();
      const response = yield fetch(input, __spreadProps(__spreadValues({}, init), {
        headers: __spreadProps(__spreadValues({}, init == null ? void 0 : init.headers), {
          Authorization: `Bearer ${accessToken}`,
          "X-CSRF-Token": csrfToken || ""
        })
      }));
      const data = yield response.json();
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
  });
}

// src/utils/getPermissions.ts
var getPermissions = cache(() => __async(null, null, function* () {
  try {
    const response = yield fetchWithAuth(
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
}));
var getPermissions_default = getPermissions;

// src/utils/isExpiredToken.ts
import jwt from "jsonwebtoken";
function isExpiredToken(token) {
  const { exp } = jwt.decode(token);
  const expirationTime = exp * 1e3;
  return expirationTime < Date.now() - 2 * 60 * 1e3;
}

// src/utils/refreshTokens.ts
import { cookies as cookies3 } from "next/headers";

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
        var _a, _b, _c, _d;
        obj.set(
          decodeURIComponent((_a = pair[0]) == null ? void 0 : _a.trim()),
          decodeURIComponent((_b = pair[1]) == null ? void 0 : _b.trim())
        );
        const [key2, value2] = [(_c = pair[0]) == null ? void 0 : _c.trim(), (_d = pair[1]) == null ? void 0 : _d.trim()];
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
  console.log(cookieObj);
  return cookieObj;
};

// src/utils/refreshTokens.ts
var refreshTokens = () => __async(null, null, function* () {
  var _a, _b;
  const cookieStore = yield cookies3();
  let csrfToken = yield getCSRFToken();
  if (!csrfToken) {
    const csrfResponse = yield fetch(
      config_default.AUTH_SERVICE_HOST_URL + "/api/v1/refresh-token",
      {
        method: "get"
      }
    );
    const { csrfToken: newCSRFToken } = yield csrfResponse.json();
    const xsrfCookie = parseCookie(
      "_csrf",
      csrfResponse.headers.getSetCookie()
    );
    cookieStore.set("_csrf", xsrfCookie.Value, {
      httpOnly: xsrfCookie.HttpOnly || true,
      expires: xsrfCookie.Expires,
      path: (_a = xsrfCookie.Path) != null ? _a : "/",
      sameSite: xsrfCookie.SameSite || "lax"
    });
    cookieStore.set("csrfToken", newCSRFToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });
    csrfToken = newCSRFToken;
  }
  const response = yield fetch(
    config_default.AUTH_SERVICE_HOST_URL + "/api/v1/refresh-token",
    {
      method: "post",
      headers: {
        "X-CSRF-Token": csrfToken
      }
    }
  );
  console.log(response.status, yield response.json());
  if (response.status == 200 || response.status == 201) {
    const resData = yield response.json();
    const { accessToken } = yield response.json();
    const refreshCookie = parseCookie(
      "refreshToken",
      response.headers.getSetCookie()
    );
    cookieStore.set("accessToken", accessToken, {
      expires: Date.now() + 15 * 60 * 1e3,
      // 15 minutes
      httpOnly: true,
      path: "/",
      sameSite: "lax"
    });
    cookieStore.set("refreshToken", refreshCookie.Value, {
      httpOnly: refreshCookie.HttpOnly || true,
      expires: refreshCookie.Expires,
      path: (_b = refreshCookie.Path) != null ? _b : "/",
      sameSite: refreshCookie.SameSite || "lax"
    });
    if (!resData.success) {
      throw new Error(resData.error);
    } else {
      return resData.data;
    }
  } else {
    throw new Error("Failed to refresh token");
  }
});
var refreshTokens_default = refreshTokens;

// src/middleware/index.ts
import {
  NextResponse
} from "next/server";
var authMiddleware = (req, options, onSuccess) => __async(null, null, function* () {
  var _a, _b;
  try {
    const url = req.nextUrl.clone();
    if (!Object.keys(options.protectedPaths).includes(url.pathname)) {
      return yield onSuccess({ user: null });
    }
    const refreshToken = (_a = req.cookies.get("refreshToken")) == null ? void 0 : _a.value;
    let accessToken = (_b = req.cookies.get("accessToken")) == null ? void 0 : _b.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    if (!accessToken || isExpiredToken(accessToken)) {
      yield refreshTokens_default();
      console.log("refreshed tokens");
    }
    const { user, permissions } = yield getPermissions_default();
    if (!user) {
      return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    if (!options.protectedPaths[url.pathname].some(
      (permission) => permissions.includes(permission) || permission === config_default.AUTH_PUBLIC_ROUTE_PERMISSION
    )) {
      return NextResponse.redirect(new URL(config_default.SITE_UNAUTHORIZED_URL));
    }
    return yield onSuccess({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
  }
});
var withAuth = (middleware, options) => {
  return (...args) => __async(null, null, function* () {
    const req = args[0];
    return yield authMiddleware(req, options, (_0) => __async(null, [_0], function* ({ user }) {
      args[0].user = user;
      return yield middleware(...args);
    }));
  });
};
export {
  fetchWithAuth,
  withAuth
};
