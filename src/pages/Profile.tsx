import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const profileImageUrl = useMemo(() => {
    if (!profileData?.profileImg) return '';
    
    // If it's already a base64 string
    if (typeof profileData.profileImg === 'string') {
      // Check if it's already a data URL
      if (profileData.profileImg.startsWith('data:')) {
        return profileData.profileImg;
      }
      // If it's a base64 string without the data URL prefix
      if (profileData.profileImg.length > 100) {
        return `data:image/jpeg;base64,${profileData.profileImg}`;
      }
    }
    
    // If it's a byte array (Uint8Array or ArrayBuffer)
    if (profileData.profileImg instanceof Uint8Array || profileData.profileImg instanceof ArrayBuffer) {
      const byteArray = profileData.profileImg instanceof Uint8Array ? profileData.profileImg : new Uint8Array(profileData.profileImg);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    
    return '';
  }, [profileData?.profileImg]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user info
        const userData = await apiService.getUserInfo();
        setUser(userData);

        // Fetch profile data
        const profileResult = await apiService.getProfileData();
        setProfileData(profileResult);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dev-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-600">
            View and manage your profile information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profileImageUrl} />
                  <AvatarFallback className="text-2xl bg-dev-blue text-white">
                    {user?.fullName?.split(' ').map((n: string) => n[0]).join('') || user?.userName?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user?.fullName || user?.username || "User"}</CardTitle>
                <CardDescription>{user?.emailId || "No email provided"}</CardDescription>
                
                <div className="mt-2">
                  <Badge className="bg-dev-blue">{profileData?.role || "User"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Active</p>
                  <p>{profileData?.lastRefresh || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Profile Views</p>
                  <p>{profileData?.profileViews || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Name</p>
                  <p>{user?.username || "Not set"}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Connected Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.platforms?.map((platform: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                      >
                        {platform.logo && (
                          <img 
                            src={platform.logo} 
                            alt={platform.name} 
                            className="h-4 w-4 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span>{platform.name}</span>
                      </div>
                    ))}
                    {(!profileData?.platforms || profileData.platforms.length === 0) && (
                      <p className="text-gray-500 text-sm">No platforms connected</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your profile details and account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p>{user?.emailId || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                      <p>{user?.mobileNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p>{user?.dateOfBirth || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p>{user?.gender || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Education & Location</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">College</p>
                      <p>{user?.collegeName || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Degree</p>
                      <p>{user?.degree || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Course</p>
                      <p>{user?.course || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p>
                        {user?.address?.city ? `${user.address.city}, ` : ""}
                        {user?.address?.state ? `${user.address.state}, ` : ""}
                        {user?.address?.country || "Address not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">Social & Coding Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">GitHub</p>
                      <p>{user?.gitHubId || "Not linked"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                      <p>{user?.linkedinId || "Not linked"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">LeetCode</p>
                      <p>{user?.leetCodeUserName || "Not linked"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">CodeForces</p>
                      <p>{user?.codeForcesUserName || "Not linked"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Coding Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.codingLanguages?.map((language: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">{language}</Badge>
                    ))}
                    {(!user?.codingLanguages || user.codingLanguages.length === 0) && (
                      <p className="text-gray-500 text-sm">No coding languages listed</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
