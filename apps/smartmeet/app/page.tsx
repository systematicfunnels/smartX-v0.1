import { Button } from "@smartx/ui";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SmartMeet</h1>
      <p className="text-lg mb-8">AI-Powered Meeting Intelligence Platform</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload Meeting</h2>
          <Button variant="primary">Upload Audio/Video</Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
          <p className="text-gray-600">No recent meetings found</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Meeting Analytics</h2>
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    </div>
  );
}
