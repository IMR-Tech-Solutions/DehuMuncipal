import { Link } from "react-router";

interface ComponentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  buttontitle?: string; // Description text
  buttonlink?: string;
}

const ButtonComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  buttontitle = "",
  buttonlink = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {buttontitle && (
          <Link to={buttonlink}>
            <button className="flex items-center justify-center px-6 py-2 text-xs font-medium text-gray-600 dark:text-white transition rounded-lg bg-gray-300 hover:bg-gray-200 dark:bg-gray-600 shadow-theme-xs dark:hover:bg-gray-700">
              {buttontitle}
            </button>
          </Link>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ButtonComponentCard;
