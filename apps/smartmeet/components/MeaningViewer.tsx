import { Card } from "@smartx/ui";

interface MeaningViewerProps {
  meaning: {
    topics: string[];
    actionItems: string[];
    decisions: string[];
    sentiment: string;
    summary: string;
  };
}

export function MeaningViewer({ meaning }: MeaningViewerProps) {
  return (
    <Card className="mt-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Extracted Meaning</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
            <p className="text-gray-800">{meaning.summary}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
              {meaning.topics.map((topic, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Action Items</h4>
            {meaning.actionItems.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {meaning.actionItems.map((item, index) => (
                  <li key={index} className="text-gray-800">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No action items identified</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Decisions</h4>
            {meaning.decisions.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {meaning.decisions.map((decision, index) => (
                  <li key={index} className="text-gray-800">{decision}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No decisions identified</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Sentiment</h4>
            <p className="text-gray-800 capitalize">{meaning.sentiment}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
