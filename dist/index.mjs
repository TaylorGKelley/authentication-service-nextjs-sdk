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
  AUTH_PUBLIC_ROUTE_PERMISSION: process.env.AUTH_PUBLIC_ROUTE_PERMISSION || "public"
};
var config_default = config;

// src/utils/getCSRFToken.ts
import { cookies } from "next/headers";
var getCSRFToken = () => __async(null, null, function* () {
  var _a;
  try {
    const cookieStore = yield cookies();
    let csrfToken = (_a = cookieStore.get("csrfToken")) == null ? void 0 : _a.value;
    if (!csrfToken) {
      const response = yield fetch(`${config_default.SITE_URL}/api/auth/csrf`, {
        method: "get"
      });
      const body = yield response.json();
      if (!body.success) throw new Error(body.error);
      csrfToken = body.data.csrfToken;
    }
    return csrfToken;
  } catch (error) {
    return null;
  }
});

// src/utils/isExpiredToken.ts
import jwt from "jsonwebtoken";
function isExpiredToken(token) {
  const { exp } = jwt.decode(token);
  const expirationTime = exp * 1e3;
  return expirationTime < Date.now();
}

// src/utils/refreshTokens.ts
var refreshTokens = () => __async(null, null, function* () {
  const response = yield fetch(config_default.SITE_URL + "/api/auth/refresh", {
    method: "get"
  });
  if (response.status == 200 || response.status == 201) {
    const resData = yield response.json();
    if (!resData.success) {
      throw new Error(resData.error);
    } else {
      return resData.data;
    }
  } else {
    throw new Error("Invalid Refresh Token");
  }
});
var refreshTokens_default = refreshTokens;

// src/apiClient/index.ts
import { cookies as cookies2 } from "next/headers";
function fetchWithAuth(input, init) {
  return __async(this, null, function* () {
    var _a;
    try {
      const cookieStore = yield cookies2();
      let accessToken = (_a = cookieStore.get("accessToken")) == null ? void 0 : _a.value;
      const csrfToken = yield getCSRFToken();
      let response = void 0;
      if (accessToken && isExpiredToken(accessToken)) {
        response = yield fetch(input, __spreadProps(__spreadValues({}, init), {
          headers: __spreadProps(__spreadValues({}, init == null ? void 0 : init.headers), {
            Authorization: `Bearer ${accessToken}`,
            "X-CSRF-Token": csrfToken || ""
          })
        }));
      }
      if (response && response.status >= 200 && response.status < 300) {
        const data2 = yield response.json();
        return { success: true, data: data2 };
      }
      if (!accessToken || !response || response.status === 401) {
        accessToken = (yield refreshTokens_default()).accessToken;
      }
      response = yield fetch(input, __spreadProps(__spreadValues({}, init), {
        headers: __spreadProps(__spreadValues({}, init == null ? void 0 : init.headers), {
          Authorization: `Bearer ${accessToken}`,
          "X-CSRF-Token": csrfToken || ""
        })
      }));
      if (response.status > 200 && response.status > 300) {
        throw new Error(response.statusText);
      }
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

// src/utils/fetchPermissions.ts
var fetchPermissions = () => __async(null, null, function* () {
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
});
var fetchPermissions_default = fetchPermissions;

// src/middleware/index.ts
import {
  NextResponse
} from "next/server";
var authMiddleware = (req, options, onSuccess) => __async(null, null, function* () {
  var _a, _b;
  try {
    const url = req.nextUrl.clone();
    if (Object.keys(options.protectedPaths).includes(url.pathname)) {
      return yield onSuccess({ user: null });
    }
    const refreshToken = (_a = req.cookies.get("refreshToken")) == null ? void 0 : _a.value;
    let accessToken = (_b = req.cookies.get("accessToken")) == null ? void 0 : _b.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    if (accessToken && isExpiredToken(accessToken)) {
      accessToken = (yield refreshTokens_default()).accessToken;
    }
    const { user, permissions } = yield fetchPermissions_default();
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
    return NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
  }
});
var withAuth = (middleware, options) => {
  return (...args) => __async(null, null, function* () {
    const req = args[0];
    yield authMiddleware(req, options, (_0) => __async(null, [_0], function* ({ user }) {
      args[0].user = user;
      return yield middleware(...args);
    }));
  });
};

// src/handler/refresh.ts
import { NextResponse as NextResponse2 } from "next/server";
var routeId = "refresh";
var routeHandler = (_req) => __async(null, null, function* () {
  var _a;
  try {
    const csrfToken = yield getCSRFToken();
    const response = yield fetch(
      `${config_default.AUTH_SERVICE_HOST_URL}/api/v1/refresh`,
      {
        method: "post",
        headers: {
          "X-CSRF-Token": csrfToken
        }
      }
    );
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    const { accessToken } = yield response.json();
    const refreshToken = (_a = response.headers.getSetCookie().find((cookie) => cookie.startsWith("refreshToken"))) == null ? void 0 : _a.split(";")[0].split("=")[1];
    const result = NextResponse2.json({
      success: true,
      data: {
        accessToken: ""
      }
    });
    result.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: true,
      expires: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    result.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: true,
      expires: 15 * 60 * 1e3
      // 15 minutes
    });
    return result;
  } catch (error) {
    return NextResponse2.json({
      success: false,
      error: error.message
    });
  }
});
var refresh_default = { routeId, routeHandler };

// src/handler/callback.ts
import { NextResponse as NextResponse3 } from "next/server";
var routeId2 = "callback";
var routeHandler2 = (req) => {
  return NextResponse3.redirect(new URL(config_default.SITE_URL));
};
var callback_default = { routeId: routeId2, routeHandler: routeHandler2 };

// src/handler/logout.ts
import { NextResponse as NextResponse4 } from "next/server";
var routeId3 = "logout";
var routeHandler3 = (_req) => __async(null, null, function* () {
  try {
    const response = yield fetchWithAuth(
      `${config_default.AUTH_SERVICE_HOST_URL}/api/v1/logout`,
      {
        method: "get"
      }
    );
    if (!response.success) {
      throw new Error(response.message);
    }
    const result = NextResponse4.json({
      success: true,
      data: void 0
    });
    result.cookies.delete("accessToken");
    result.cookies.delete("refreshToken");
    return result;
  } catch (error) {
    return NextResponse4.json({
      success: false,
      error: error.message
    });
  }
});
var logout_default = { routeId: routeId3, routeHandler: routeHandler3 };

// src/handler/initialize.ts
import { NextResponse as NextResponse5 } from "next/server";
var routeId4 = "initialize";
var routeHandler4 = (req) => __async(null, null, function* () {
  const data = yield fetchPermissions_default();
  return NextResponse5.json({
    success: true,
    data
  });
});
var initialize_default = { routeId: routeId4, routeHandler: routeHandler4 };

// src/handler/csrf.ts
import { NextResponse as NextResponse6 } from "next/server";
var routeId5 = "csrf";
var routeHandler5 = (_req) => __async(null, null, function* () {
  var _a;
  try {
    const response = yield fetch(
      `${config_default.AUTH_SERVICE_HOST_URL}/api/v1/csrf-token`,
      {
        method: "get"
      }
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    }
    const data = yield response.json();
    const nextResponse = NextResponse6.json({
      success: true,
      data: {
        csrfToken: data.csrfToken
      }
    });
    nextResponse.cookies.set("csrfToken", data.csrfToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax"
    });
    const csrfSessionKey = (_a = response.headers.getSetCookie().find((val) => val.startsWith("_csrf"))) == null ? void 0 : _a.split(";")[0].split("=")[1];
    nextResponse.cookies.set("_csrf", csrfSessionKey, {
      httpOnly: true,
      path: "/",
      sameSite: "strict"
    });
    return nextResponse;
  } catch (error) {
    return NextResponse6.json({
      success: false,
      error: error.message
    });
  }
});
var csrf_default = { routeId: routeId5, routeHandler: routeHandler5 };

// src/handler/index.ts
var routeMap = {
  [refresh_default.routeId]: refresh_default.routeHandler,
  [csrf_default.routeId]: csrf_default.routeHandler,
  [callback_default.routeId]: callback_default.routeHandler,
  [logout_default.routeId]: logout_default.routeHandler,
  [initialize_default.routeId]: initialize_default.routeHandler
};
var routeHandler6 = (req, context) => __async(null, null, function* () {
  const { authService: routeId6 } = yield context.params;
  const handler = routeMap[routeId6];
  return handler(req);
});
function handleAuth() {
  return routeHandler6;
}
export {
  fetchWithAuth,
  handleAuth,
  withAuth
};
