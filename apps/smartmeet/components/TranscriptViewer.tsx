import { Card } from "@smartx/ui";

interface TranscriptViewerProps {
  transcript: {
    id: string;
    speaker: string;
    text: string;
    startTime?: number;
    endTime?: number;
  }[];
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  return (
    <Card className="mt-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Transcript</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transcript.map((segment) => (
            <div key={segment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                  {segment.speaker.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{segment.speaker}</span>
                    {segment.startTime && (
                      <span className="text-xs text-gray-500">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{segment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function formatTime(seconds?: number): string {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
