import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
function AlertError({
  errors,
  title
}) {
  return <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{title || "Something went wrong."}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm">
                    {Array.from(new Set(errors)).map((error, index) => <li key={index}>{error}</li>)}
                </ul>
            </AlertDescription>
        </Alert>;
}
export {
  AlertError as default
};
