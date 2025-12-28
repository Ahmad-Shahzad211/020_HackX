"use client";
import {
  Monitor,
  Shield,
  MapPin,
  Clock,
  Chrome,
  AlertTriangle,
  Laptop,
  LaptopIcon,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUserStore } from "../../store/userInfoStore";
import { FaMobile } from "react-icons/fa";
import BreadCrumbs from "@/components/breadcrumbs";
import { useEffect, useState } from "react";
import { removeDeviceHandler } from "../../handlers/userInfo";
import { getLocation } from "@/utils/clientUtils";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [currentDeviceIP, setCurrentDeviceIP] = useState("");
  const [message, setMessage] = useState("");
  const { devices } = useUserStore();
  useEffect(() => {
    const fetchIP = async () => {
      const currentIP = await getLocation();
      setCurrentDeviceIP(currentIP.ip);
    };
    fetchIP();
  }, []);
  const handleRemoveDevice = async (ipAddress: string) => {
    setLoading(true);
    const resp = await removeDeviceHandler(ipAddress);
    setLoading(false);
    setMessage(resp?.message);
  };
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Bar */}
        <BreadCrumbs page={"Security"} />

        {/* Scrollable Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Enhanced Security Content Box */}
          <div className="bg-gradient-to-br from-[#A0D2DB]/90 to-[#A0D2DB]/70 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Active Devices
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage devices that have access to your account
                </p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-full p-3">
                <Shield className="w-8 h-8 text-[#329898]" />
              </div>
            </div>

            {/* Security Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Devices</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {devices.length}
                    </p>
                  </div>
                  <Monitor className="w-8 h-8 text-[#329898]" />
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Device</p>
                    <p className="text-2xl font-bold text-[#329898]">1</p>
                  </div>
                  <Shield className="w-8 h-8 text-[#329898]" />
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Activity</p>
                    <p className="text-sm font-semibold text-gray-800">Today</p>
                  </div>
                  <Clock className="w-8 h-8 text-[#329898]" />
                </div>
              </div>
            </div>
            {/* Display Message */}
            {message.length > 0 && (
              <div
                className={`${
                  message.includes("Success!") ? "bg-green-500" : "bg-red-500"
                } text-white rounded-xl p-4 mb-2`}
              >
                <p>{message}</p>
              </div>
            )}
            {/* Enhanced Device List */}
            <div className="space-y-4">
              {devices.reverse().map((device: any, id: number) => (
                <div
                  key={id}
                  className="transform scale-100 bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:bg-white/60"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
                    {/* Left Content */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-4 sm:space-y-0">
                      {/* Device Icon */}
                      <div className="bg-white/60 text-black backdrop-blur-sm rounded-full p-3 shadow-md flex items-center justify-center">
                        {device.browser?.includes("Mobile") ? (
                          <FaMobile />
                        ) : (
                          <Laptop />
                        )}
                      </div>

                      {/* Device Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                            {device.browser?.includes("Mobile")
                              ? "Mobile"
                              : "PC/Laptop"}
                          </h3>
                          {/* Current device badge (optional) */}
                          {currentDeviceIP == device.ipAddress && (
                            <span className="bg-[#329898] text-white text-xs px-3 py-1 rounded-full font-medium">
                              Current Device
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Chrome className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 break-all">
                              Browser: {device.browser}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Chrome className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 break-all">
                              Browser Version: {device.browserVersion}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <LaptopIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              OS: {device.osName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {device.city}, {device.country}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 col-span-full sm:col-span-1">
                            <span className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold">
                              IP
                            </span>
                            <span className="text-gray-600 font-mono text-xs break-all">
                              {device.ipAddress}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              Last active:{" "}
                              {formatDistanceToNow(
                                new Date(device.lastActive),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right-side Action Button */}
                    <div className="flex flex-col items-start space-y-2">
                      {!(currentDeviceIP == device.ipAddress) ? (
                        <button
                          disabled={loading}
                          onClick={() => handleRemoveDevice(device.ipAddress)}
                          className="group flex items-center space-x-2 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>{loading ? "Removing..." : "Remove"}</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-[#329898]/20 text-[#329898] text-sm rounded-lg">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Protected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="mt-8 bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">
                    Security Notice
                  </h4>
                  <p className="text-sm text-amber-700">
                    If you notice any unfamiliar devices, remove them
                    immediately and consider changing your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
