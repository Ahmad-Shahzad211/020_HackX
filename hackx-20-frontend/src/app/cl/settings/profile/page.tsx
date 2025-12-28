"use client";

import {
  User as UserIcon,
  Eye,
  EyeOff,
  UploadIcon,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useUserStore } from "../../store/userInfoStore";
import {
  getUserInfoHandler,
  updatePasswordHandler,
  updateUser,
  updateUserAvatarHandler,
  uploadProfileImageToCloudinary,
} from "../../handlers/userInfo";
import { DeviceType } from "@/types";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BreadCrumbs from "@/components/breadcrumbs";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// dummy patch handler for name (replace with your real API)
const updateUserNameHandler = async (newName: string) => {
  return { status: 200, message: "Name updated successfully!" };
};

export default function ProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const route = useRouter();

  // edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const { userInfo, setDevices, setUserInfo } = useUserStore();

  useEffect(() => {
    if (userInfo?.fullName) setTempName(userInfo.fullName);
  }, [userInfo]);

  const resetPasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(
        /[@$!%*?&#^()\-_=+{}[\]|;:'\",.<>/~`]/,
        "Must contain at least one special character"
      )
      .test(
        "not-same-as-current",
        "New password must be different from current password",
        function (value) {
          const { currentPassword } = this.parent;
          return value !== currentPassword;
        }
      ),
  });

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);

      const imageUrl = await uploadProfileImageToCloudinary(file);

      setUserInfo({
        ...userInfo,
        avatarUrl: imageUrl,
      });

      const resp = await updateUser({
        avatarUrl: imageUrl.message.resp.secure_url,
      });

      setMessage(resp.data.message);
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size must be less than 5MB.");
        return;
      }
      handleImageUpload(file);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const resp = await getUserInfoHandler();

        if (resp.status == 200) {
          const { userDeviceAndLocationInfo } = resp?.data;
          setUserInfo(resp?.data);

          const formattedDevices: DeviceType[] = userDeviceAndLocationInfo.map(
            (device: any) => ({
              id: device._id,
              ipAddress: device.ipAddress,
              country: device.location?.country || "",
              city: device.location?.city || "",
              browser: device.deviceInfo?.browser || "",
              browserVersion: device.deviceInfo?.browserVersion || "",
              osName: device.deviceInfo?.osName || "",
              lastActive: new Date(device.lastActive),
            })
          );

          setDevices(formattedDevices.reverse());
        } else if ([404, 401, 403].includes(resp.status)) {
          localStorage.clear();
          await Cookies.remove("__chatLegis__");
          location.reload();
        }
      } catch (error: any) {
        console.log(`error here: ${JSON.stringify(error.message)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <main className="flex-1 flex flex-col overflow-hidden">
        <BreadCrumbs page={"Manage Account"} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="bg-gradient-2 p-6 md:p-8 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
              User Profile
            </h2>

            {/* Avatar + Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
              {/* Avatar */}
              <div className="relative group w-16 h-16 mr-0 sm:mr-4 mb-3 sm:mb-0">
                {userInfo.avatarUrl ? (
                  <>
                    <Image
                      src={userInfo.avatarUrl}
                      alt={userInfo.fullName}
                      width={64}
                      height={64}
                      className="rounded-full object-cover w-16 h-16"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                        <Loader2
                          size={20}
                          className="text-white animate-spin"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <UserIcon size={32} />
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <UploadIcon size={20} className="text-white" />
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Name + Email */}
              <div>
                {!isEditingName ? (
                  <div className="flex items-center space-x-2 group">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                      {loading ? (
                        <div
                          className="h-5 w-32 rounded animate-pulse 
                  bg-white/30 border border-white/20 
                  backdrop-blur-sm shadow-sm"
                        />
                      ) : (
                        userInfo.fullName
                      )}
                    </h3>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Pencil size={16} className="text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="border p-1 rounded-md"
                    />
                    <button
                      onClick={async () => {
                        const resp = await updateUser({ fullName: tempName });

                        if (resp.status === 200) {
                          setUserInfo({ ...userInfo, fullName: tempName });
                          setMessage(resp.data.message);
                        }
                        setIsEditingName(false);
                      }}
                      className="text-green-600"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setTempName(userInfo.fullName);
                        setIsEditingName(false);
                      }}
                      className="text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
                <p className="text-xs md:text-sm text-gray-500">
                  {loading ? (
                    <div
                      className="h-5 w-32 rounded animate-pulse 
                  bg-white/30 border border-white/20 
                  backdrop-blur-sm shadow-sm"
                    />
                  ) : (
                    userInfo.email
                  )}
                </p>
              </div>
            </div>

            <hr className="border-neutral-600/20 my-6" />

            {/* Password Section */}
            <Formik
              initialValues={{
                currentPassword: "",
                newPassword: "",
              }}
              validationSchema={resetPasswordSchema}
              onSubmit={async (values, { resetForm }) => {
                const resp = await updatePasswordHandler(values);

                setMessage(resp?.message);
                setTimeout(() => setMessage(""), 7000);
                if (resp.status) {
                  route.push("/auth/login");
                }
                resetForm();
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4 mb-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Reset Password
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Password */}
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <Field
                          type={showCurrentPassword ? "text" : "password"}
                          id="currentPassword"
                          name="currentPassword"
                          className="w-full p-3 border border-gray-400 rounded-md shadow-sm focus:ring-[#329898] focus:border-[#329898] text-gray-900 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && touched.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Field
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          name="newPassword"
                          className="w-full p-3 border border-gray-400 rounded-md shadow-sm focus:ring-[#329898] focus:border-[#329898] text-gray-900 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                        >
                          {showNewPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && touched.newPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  {message.length > 0 && (
                    <div
                      className={`message md:mx-2 w-full xl:w-[300px] ${
                        message.includes("Error")
                          ? "bg-red-500"
                          : "bg-green-500"
                      } p-3 rounded-md`}
                    >
                      <p className="text-white">{message}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="px-6 py-2 bg-[#329898] text-white rounded-md hover:bg-[#2a8080]"
                    >
                      {isSubmitting ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>

            {/* Connected Accounts */}
            <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
                Connected With
              </h3>
              <div className="flex items-center justify-between p-3.5 border border-gray-300 rounded-md mb-3 bg-white/40">
                {userInfo.loginType != "google" ? (
                  <span className="text-black">
                    {userInfo?.loginType?.toUpperCase()}
                  </span>
                ) : (
                  <div className="flex items-center">
                    <Image
                      src="/images/Auth/google.svg"
                      alt="google"
                      width={20}
                      height={20}
                      className="object-cover w-7 h-7 bg-white p-1 rounded-full"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      {userInfo.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
