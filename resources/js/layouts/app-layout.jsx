import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";
var stdin_default = ({ children, breadcrumbs, ...props }) => <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>;
export {
  stdin_default as default
};
