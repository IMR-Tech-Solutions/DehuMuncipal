interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  onAddClick?: () => void;
  addButtonText?: string; // 🔹 New Prop for button text
  loading?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  onAddClick,
  addButtonText = "Add",
  loading = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>

          {onAddClick && (
            <button
              onClick={onAddClick}
              className={`flex items-center justify-center px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              type="button"
              disabled={loading}
            >
              {loading ? "Loading..." : addButtonText}
            </button>
          )}
        </div>

        {desc && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
