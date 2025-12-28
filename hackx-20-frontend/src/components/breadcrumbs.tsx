import { useUserStore } from "@/app/cl/store/userInfoStore";

const BreadCrumbs = ({ page }: { page: string }) => {
  const userAvatar = useUserStore((state) => state.userAvatar);
  return (
    <>
      <div className="mt-5 bg-white/80 backdrop-blur-sm shadow-sm px-10 h-16 flex justify-between items-center flex-shrink-0 mx-4 rounded-xl border border-white/20">
        <div className="flex items-center space-x-2">
          <div className="ml-2 sm:ml-5 lg:ml-0">
            <span className="text-sm text-gray-500">Settings / </span>
            <span className="text-sm text-gray-700 font-semibold">{page}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BreadCrumbs;
