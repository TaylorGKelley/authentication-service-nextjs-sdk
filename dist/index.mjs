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

// src/middleware/index.ts
import { URL as URL2 } from "url";

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
  if (response.status == 200) {
    return yield response.json();
  } else {
    throw new Error("Invalid Refresh Token");
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
    if (Object.keys(options.protectedPaths).includes(url.pathname)) {
      return yield onSuccess({ user: null });
    }
    const refreshToken = (_a = req.cookies.get("refreshToken")) == null ? void 0 : _a.value;
    let accessToken = (_b = req.cookies.get("accessToken")) == null ? void 0 : _b.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL2(config_default.SITE_LOGIN_URL));
    }
    if (accessToken && isExpiredToken(accessToken)) {
      accessToken = (yield refreshTokens_default()).accessToken;
    }
    const { user, permissions } = yield fetchPermissions_default();
    if (!user) {
      return NextResponse.redirect(new URL2(config_default.SITE_LOGIN_URL));
    }
    if (!options.protectedPaths[url.pathname].some(
      (permission) => permissions.includes(permission) || permission === config_default.AUTH_PUBLIC_ROUTE_PERMISSION
    )) {
      return NextResponse.redirect(new URL2(config_default.SITE_UNAUTHORIZED_URL));
    }
    return yield onSuccess({ user });
  } catch (error) {
    return NextResponse.redirect(new URL2(config_default.SITE_LOGIN_URL));
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
var routeHandler = (req) => {
  return NextResponse2.json({ success: true, data: {} });
};
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
var routeHandler3 = (req) => {
  return NextResponse4.json({});
};
var logout_default = { routeId: routeId3, routeHandler: routeHandler3 };

// src/handler/initialize.ts
import { NextResponse as NextResponse5 } from "next/server";
var routeId4 = "initialize";
var routeHandler4 = (req) => {
  return NextResponse5.json({
    success: true,
    data: {
      user: {
        id: 0,
        email: ""
      }
    }
  });
};
var initialize_default = { routeId: routeId4, routeHandler: routeHandler4 };

// src/handler/index.ts
var routeMap = {
  [refresh_default.routeId]: refresh_default.routeHandler,
  [callback_default.routeId]: callback_default.routeHandler,
  [logout_default.routeId]: logout_default.routeHandler,
  [initialize_default.routeId]: initialize_default.routeHandler
};
var routeHandler5 = (req, context) => __async(null, null, function* () {
  const { authService: routeId5 } = yield context.params;
  const handler = routeMap[routeId5];
  return handler(req);
});
function handleAuth() {
  return routeHandler5;
}
export {
  handleAuth,
  withAuth
};
