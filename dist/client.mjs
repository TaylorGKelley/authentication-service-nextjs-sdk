import React, { useContext } from 'react';

var authContext = React.createContext({
  user: null,
  permissions: []
});

// src/providers/AuthProvider.tsx
var useAuthContext = () => {
  const context = useContext(authContext);
  return context;
};
var AuthProvider = ({
  user,
  permissions,
  children
}) => {
  return /* @__PURE__ */ React.createElement(authContext.Provider, { value: { user, permissions } }, children);
};

export { AuthProvider, useAuthContext };
