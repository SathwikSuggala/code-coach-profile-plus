import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import { apiService, API_BASE_URL } from "../services/apiService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

interface Address {
  city: string;
  state: string;
  country: string;
}

interface FormData {
  fullName: string;
  accountsConnected: string[];
  address: Address;
  collegeName: string;
  gitHubId: string;
  linkedinId: string;
  emailId: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string;
  degree: string;
  course: string;
  codingLanguages: string[];
  leetCodeUserName: string;
  codeForcesUserName: string;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    accountsConnected: [],
    address: {
      city: "",
      state: "",
      country: ""
    },
    collegeName: "",
    gitHubId: "",
    linkedinId: "",
    emailId: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    degree: "",
    course: "",
    codingLanguages: [],
    leetCodeUserName: "",
    codeForcesUserName: ""
  });

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
        setFormData({
          fullName: userData.fullName || "",
          accountsConnected: userData.accountsConnected || [],
          address: userData.address || { city: "", state: "", country: "" },
          collegeName: userData.collegeName || "",
          gitHubId: userData.gitHubId || "",
          linkedinId: userData.linkedinId || "",
          emailId: userData.emailId || "",
          mobileNumber: userData.mobileNumber || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender || "",
          degree: userData.degree || "",
          course: userData.course || "",
          codingLanguages: userData.codingLanguages || [],
          leetCodeUserName: userData.leetCodeUserName || "",
          codeForcesUserName: userData.codeForcesUserName || ""
        });

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      if (selectedImage) {
        formDataToSend.append('userimg', selectedImage);
      }
      formDataToSend.append('data', JSON.stringify(formData));

      const token = localStorage.getItem('jwt');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/uploadImage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        // Refresh profile data
        const userData = await apiService.getUserInfo();
        setUser(userData);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
            <p className="text-gray-600">
              View and manage your profile information
            </p>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileImage">Profile Image</Label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailId">Email</Label>
                      <Input
                        id="emailId"
                        name="emailId"
                        type="email"
                        value={formData.emailId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="collegeName">College Name</Label>
                      <Input
                        id="collegeName"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="address.city">City</Label>
                      <Input
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address.state">State</Label>
                      <Input
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address.country">Country</Label>
                      <Input
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gitHubId">GitHub ID</Label>
                      <Input
                        id="gitHubId"
                        name="gitHubId"
                        value={formData.gitHubId}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedinId">LinkedIn ID</Label>
                      <Input
                        id="linkedinId"
                        name="linkedinId"
                        value={formData.linkedinId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="leetCodeUserName">LeetCode Username</Label>
                      <Input
                        id="leetCodeUserName"
                        name="leetCodeUserName"
                        value={formData.leetCodeUserName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="codeForcesUserName">CodeForces Username</Label>
                      <Input
                        id="codeForcesUserName"
                        name="codeForcesUserName"
                        value={formData.codeForcesUserName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
