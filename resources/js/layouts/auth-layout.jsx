import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";
function AuthLayout({
  children,
  title,
  description,
  ...props
}) {
  return <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthLayoutTemplate>;
}
export {
  AuthLayout as default
};
