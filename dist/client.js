'use strict';

var React = require('react');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

var authContext = React__default.default.createContext({
  user: null,
  permissions: []
});

// src/providers/AuthProvider.tsx
var useAuthContext = () => {
  const context = React.useContext(authContext);
  return context;
};
var AuthProvider = ({
  user,
  permissions,
  children
}) => {
  return /* @__PURE__ */ React__default.default.createElement(
    authContext.Provider,
    {
      value: { user: user || null, permissions: permissions || [] }
    },
    children
  );
};

exports.AuthProvider = AuthProvider;
exports.useAuthContext = useAuthContext;
