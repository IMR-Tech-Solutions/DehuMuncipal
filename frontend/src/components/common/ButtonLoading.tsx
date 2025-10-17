import Spinner from "../spinner/spinner";

const ButtonLoading = ({
  loading,
  state,
  loadingstate,
  className,
}: {
  loading: boolean;
  state: string;
  loadingstate: string;
  className?: string;
}) => {
  return (
    <button
      className={`${className} flex items-center justify-center px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 ${
        loading ? "opacity-60 cursor-not-allowed" : ""
      }`}
      type="submit"
      disabled={loading}
    >
      {loading && <Spinner />}
      {loading ? `${loadingstate}` : `${state}`}
    </button>
  );
};

export default ButtonLoading;
