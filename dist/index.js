"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  fetchWithAuth: () => fetchWithAuth,
  handleAuth: () => handleAuth,
  withAuth: () => withAuth
});
module.exports = __toCommonJS(index_exports);

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
var import_headers = require("next/headers");
var getCSRFToken = () => __async(null, null, function* () {
  var _a;
  try {
    const cookieStore = yield (0, import_headers.cookies)();
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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function isExpiredToken(token) {
  const { exp } = import_jsonwebtoken.default.decode(token);
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
var import_headers2 = require("next/headers");
function fetchWithAuth(input, init) {
  return __async(this, null, function* () {
    var _a;
    try {
      const cookieStore = yield (0, import_headers2.cookies)();
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
var import_server = require("next/server");
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
      return import_server.NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    if (accessToken && isExpiredToken(accessToken)) {
      accessToken = (yield refreshTokens_default()).accessToken;
    }
    const { user, permissions } = yield fetchPermissions_default();
    if (!user) {
      return import_server.NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
    }
    if (!options.protectedPaths[url.pathname].some(
      (permission) => permissions.includes(permission) || permission === config_default.AUTH_PUBLIC_ROUTE_PERMISSION
    )) {
      return import_server.NextResponse.redirect(new URL(config_default.SITE_UNAUTHORIZED_URL));
    }
    return yield onSuccess({ user });
  } catch (error) {
    return import_server.NextResponse.redirect(new URL(config_default.SITE_LOGIN_URL));
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
var import_server2 = require("next/server");
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
    const result = import_server2.NextResponse.json({
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
    return import_server2.NextResponse.json({
      success: false,
      error: error.message
    });
  }
});
var refresh_default = { routeId, routeHandler };

// src/handler/callback.ts
var import_server3 = require("next/server");
var routeId2 = "callback";
var routeHandler2 = (req) => {
  return import_server3.NextResponse.redirect(new URL(config_default.SITE_URL));
};
var callback_default = { routeId: routeId2, routeHandler: routeHandler2 };

// src/handler/logout.ts
var import_server4 = require("next/server");
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
    const result = import_server4.NextResponse.json({
      success: true,
      data: void 0
    });
    result.cookies.delete("accessToken");
    result.cookies.delete("refreshToken");
    return result;
  } catch (error) {
    return import_server4.NextResponse.json({
      success: false,
      error: error.message
    });
  }
});
var logout_default = { routeId: routeId3, routeHandler: routeHandler3 };

// src/handler/initialize.ts
var import_server5 = require("next/server");
var routeId4 = "initialize";
var routeHandler4 = (req) => __async(null, null, function* () {
  const data = yield fetchPermissions_default();
  return import_server5.NextResponse.json({
    success: true,
    data
  });
});
var initialize_default = { routeId: routeId4, routeHandler: routeHandler4 };

// src/handler/csrf.ts
var import_server6 = require("next/server");
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
    const nextResponse = import_server6.NextResponse.json({
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
    return import_server6.NextResponse.json({
      success: false,
      error: error.message
    });
  }
});
var csrf_default = { routeId: routeId5, routeHandler: routeHandler5 };

// src/handler/login.ts
var import_headers3 = require("next/headers");
var import_server7 = require("next/server");
var routeId6 = "login";
var routeHandler6 = (req) => __async(null, null, function* () {
  const cookieStore = yield (0, import_headers3.cookies)();
  cookieStore.set("test", "test", {
    httpOnly: true,
    path: "/",
    sameSite: "strict"
  });
  const body = req.body;
  return import_server7.NextResponse.json({
    success: true,
    data: {
      accessToken: "",
      user: {
        id: 0,
        email: ""
      }
    }
  });
});
var login_default = { routeId: routeId6, routeHandler: routeHandler6 };

// src/handler/register.ts
var import_server8 = require("next/server");
var routeId7 = "register";
var routeHandler7 = (req) => {
  return import_server8.NextResponse.json({
    success: true,
    data: {
      user: {
        id: 0,
        email: ""
      }
    }
  });
};
var register_default = { routeId: routeId7, routeHandler: routeHandler7 };

// src/handler/index.ts
var routeMap = {
  [refresh_default.routeId]: refresh_default.routeHandler,
  [csrf_default.routeId]: csrf_default.routeHandler,
  [initialize_default.routeId]: initialize_default.routeHandler,
  [callback_default.routeId]: callback_default.routeHandler,
  [logout_default.routeId]: logout_default.routeHandler,
  [login_default.routeId]: login_default.routeHandler,
  [register_default.routeId]: register_default.routeHandler
};
var routeHandler8 = (req, context) => __async(null, null, function* () {
  const { authService: routeId8 } = yield context.params;
  const handler = routeMap[routeId8];
  return handler(req);
});
function handleAuth() {
  return routeHandler8;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fetchWithAuth,
  handleAuth,
  withAuth
});
