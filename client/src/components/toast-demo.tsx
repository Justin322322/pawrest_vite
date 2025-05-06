import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyErrorMessage } from "@/lib/error-handler";

export function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Default Toast",
            description: "This is a default toast message",
          });
        }}
      >
        Show Default Toast
      </Button>

      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: "destructive",
            title: "Error Toast",
            description: "This is an error toast message",
          });
        }}
      >
        Show Error Toast
      </Button>

      <Button
        variant="outline"
        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
        onClick={() => {
          toast({
            variant: "success",
            title: "Success Toast",
            description: "This is a success toast message",
          });
        }}
      >
        Show Success Toast
      </Button>

      <Button
        variant="outline"
        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
        onClick={() => {
          toast({
            variant: "warning",
            title: "Warning Toast",
            description: "This is a warning toast message",
          });
        }}
      >
        Show Warning Toast
      </Button>

      <Button
        variant="outline"
        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
        onClick={() => {
          toast({
            variant: "info",
            title: "Info Toast",
            description: "This is an info toast message",
          });
        }}
      >
        Show Info Toast
      </Button>

      <h3 className="font-medium mt-4 mb-2">Error Message Examples:</h3>

      <Button
        variant="outline"
        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
        onClick={() => {
          const error = new Error("401: Unauthorized");
          const friendlyMessage = getUserFriendlyErrorMessage(error);
          toast({
            variant: "destructive",
            title: "Login Error Example",
            description: friendlyMessage,
          });
        }}
      >
        Show Login Error
      </Button>

      <Button
        variant="outline"
        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
        onClick={() => {
          const error = new Error("User already exists");
          const friendlyMessage = getUserFriendlyErrorMessage(error);
          toast({
            variant: "destructive",
            title: "Registration Error Example",
            description: friendlyMessage,
          });
        }}
      >
        Show Registration Error
      </Button>

      <Button
        variant="outline"
        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
        onClick={() => {
          const error = new Error("Network Error");
          const friendlyMessage = getUserFriendlyErrorMessage(error);
          toast({
            variant: "destructive",
            title: "Connection Error Example",
            description: friendlyMessage,
          });
        }}
      >
        Show Connection Error
      </Button>
    </div>
  );
}
