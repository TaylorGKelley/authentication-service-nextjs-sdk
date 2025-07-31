"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  handleAuth: () => handleAuth,
  withAuth: () => withAuth
});
module.exports = __toCommonJS(index_exports);

// src/middleware/index.ts
var import_node_url = require("url");

// src/config.ts
var config = {
  AUTH_SERVICE_CONNECTED_SERVICE_ID: process.env.AUTH_SERVICE_CONNECTED_SERVICE_ID,
  AUTH_SERVICE_HOST_URL: process.env.AUTH_SERVICE_HOST_URL,
  SITE_URL: process.env.SITE_URL,
  SITE_UNAUTHORIZED_URL: process.env.SITE_UNAUTHORIZED_URL,
  SITE_LOGIN_URL: process.env.SITE_LOGIN_URL,
  AUTH_POST_LOGOUT_REDIRECT: process.env.AUTH_POST_LOGOUT_REDIRECT,
  PUBLIC_ROUTE_PERMISSION: process.env.PUBLIC_ROUTE_PERMISSION || "public"
};
var config_default = config;

// src/utils/fetchPermissions.ts
var fetchPermissions = () => __async(null, null, function* () {
  try {
    const response = yield fetch(`${config_default.SITE_URL}/api/auth/permissions`, {
      method: "get"
    });
    const data = yield response.json();
    return data;
  } catch (error) {
    throw error;
  }
});
var fetchPermissions_default = fetchPermissions;

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
  if (response.status == 200) {
    return yield response.json();
  } else {
    throw new Error("Invalid Refresh Token");
  }
});
var refreshTokens_default = refreshTokens;

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
      return import_server.NextResponse.redirect(new import_node_url.URL(config_default.SITE_LOGIN_URL));
    }
    if (accessToken && isExpiredToken(accessToken)) {
      accessToken = (yield refreshTokens_default()).accessToken;
    }
    const { user, permissions } = yield fetchPermissions_default();
    if (!user) {
      return import_server.NextResponse.redirect(new import_node_url.URL(config_default.SITE_LOGIN_URL));
    }
    if (!options.protectedPaths[url.pathname].some(
      (permission) => permissions.includes(permission) || permission === config_default.PUBLIC_ROUTE_PERMISSION
    )) {
      return import_server.NextResponse.redirect(new import_node_url.URL(config_default.SITE_UNAUTHORIZED_URL));
    }
    return yield onSuccess({ user });
  } catch (error) {
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
var routeHandler = (req) => {
  return new import_server2.NextResponse("");
};
var refresh_default = { routeId, routeHandler };

// src/handler/callback.ts
var import_server3 = require("next/server");
var routeId2 = "callback";
var routeHandler2 = (req) => {
  return new import_server3.NextResponse("");
};
var callback_default = { routeId: routeId2, routeHandler: routeHandler2 };

// src/handler/index.ts
var routeMap = {
  [refresh_default.routeId]: refresh_default.routeHandler,
  [callback_default.routeId]: callback_default.routeHandler
};
var routeHandler3 = (req, context) => {
  const routeId3 = context.params.authService;
  const routeHandler4 = routeMap[routeId3];
  return routeHandler4(req);
};
function handleAuth() {
  return routeHandler3;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleAuth,
  withAuth
});
