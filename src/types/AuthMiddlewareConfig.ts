type AuthMiddlewareConfig = {
  protectedPaths: { [route: string]: string[] };
};

export default AuthMiddlewareConfig;
