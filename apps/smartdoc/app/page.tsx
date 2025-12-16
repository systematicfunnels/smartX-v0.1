import { Button } from "@smartx/ui";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SmartDoc</h1>
      <p className="text-lg mb-8">AI-Powered Document Generation</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Document</h2>
          <Button variant="primary">New Document</Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Document Templates</h2>
          <p className="text-gray-600">No templates available</p>
        </div>
      </div>
    </div>
  );
}
