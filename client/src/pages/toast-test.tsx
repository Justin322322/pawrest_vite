import { ToastDemo } from "@/components/toast-demo";

export default function ToastTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Toast Test Page</h1>
      <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Test Different Toast Styles</h2>
        <ToastDemo />
      </div>
    </div>
  );
}
