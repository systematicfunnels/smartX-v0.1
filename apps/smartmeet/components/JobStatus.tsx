import { Card } from "@smartx/ui";

interface JobStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

export const JobStatus: React.FC<JobStatusProps> = ({ status, progress = 0, message }: JobStatusProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100', textColor: 'text-yellow-800', text: 'Pending' };
      case 'processing':
        return { color: 'bg-blue-100', textColor: 'text-blue-800', text: 'Processing' };
      case 'completed':
        return { color: 'bg-green-100', textColor: 'text-green-800', text: 'Completed' };
      case 'failed':
        return { color: 'bg-red-100', textColor: 'text-red-800', text: 'Failed' };
      default:
        return { color: 'bg-gray-100', textColor: 'text-gray-800', text: 'Unknown' };
    }
  };

  const { color, textColor, text } = getStatusInfo();

  return (
    <Card title="Job Status" className="mt-6">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-2">Job Status</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${textColor}`}>
              {text}
            </div>
          </div>
          {status === 'processing' && (
            <div className="text-sm text-gray-600">
              {progress}% complete
            </div>
          )}
        </div>

        {status === 'processing' && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-800">{message}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
