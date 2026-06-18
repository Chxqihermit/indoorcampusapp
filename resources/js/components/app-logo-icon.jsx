function AppLogoIcon({ className, ...props }) {
  return (
    <img
      src="/images/nust-logo.png"
      alt="NUST Logo"
      className={className}
      {...props}
    />
  );
}
export { AppLogoIcon as default };
