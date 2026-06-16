import { cn } from "@/lib/utils";
function InputError({
  message,
  className = "",
  ...props
}) {
  return message ? <p
    {...props}
    className={cn("text-sm text-red-600 dark:text-red-400", className)}
  >
            {message}
        </p> : null;
}
export {
  InputError as default
};
