import { Button } from "@smartx/ui";
import Link from "next/link";

export default function MeetingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Link href="/upload" passHref>
          <Button variant="primary">Upload Meeting</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">No meetings found. Upload your first meeting to get started.</p>
      </div>
    </div>
  );
}
