import { useState, useEffect, FormEvent } from 'react'
import { useProfile, type ProfileData } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'

export default function AccountProfilePage() {
  const {
    profile,
    isLoading,
    isUpdating,
    isCreating,
    error,
    updateError,
    createError,
    fetchProfile,
    updateProfile,
    createProfile,
  } = useProfile()

  const {
    changePassword,
    isChangingPassword,
    passwordChangeError,
  } = useAuth()

  const { toast } = useToast()

  const [profileFormData, setProfileFormData] = useState<ProfileData>({
    phone_number: '',
    bio: '',
  })

  const [passwordFormData, setPasswordFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileFormData({
        phone_number: profile.phone_number || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setProfileFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccessMessage(null)

    try {
      if (profile) {
        await updateProfile(profileFormData)
      } else {
        await createProfile(profileFormData)
      }
      // Success toast is handled by the hook
    } catch (err) {
      // Error toast is handled by the hook
    }
  }

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await changePassword(passwordFormData)
      toast({
        title: 'Success',
        description: 'Password changed successfully!',
        variant: 'success',
      })
      // Clear form on success
      setPasswordFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err) {
      // Error is handled by the hook and displayed via passwordChangeError
      toast({
        title: 'Error',
        description: passwordChangeError || 'Failed to change password. Please try again.',
        variant: 'error',
      })
    }
  }

  const displayProfileError = updateError || createError || error
  const displayPasswordError = passwordChangeError

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Account Profile
        </h1>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="security">Security Settings</TabsTrigger>
          </TabsList>

          {/* Profile Details Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-gray-600">Loading profile...</span>
                </div>
              )}

              {!isLoading && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {displayProfileError && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            {displayProfileError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="phone_number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={profileFormData.phone_number}
                      onChange={handleProfileChange}
                      placeholder="+254700000000"
                      className={cn(
                        'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                        'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                        'sm:text-sm sm:leading-6',
                        displayProfileError
                          ? 'ring-red-300 focus:ring-red-500'
                          : 'ring-gray-300'
                      )}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={profileFormData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                      className={cn(
                        'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                        'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                        'sm:text-sm sm:leading-6',
                        displayProfileError
                          ? 'ring-red-300 focus:ring-red-500'
                          : 'ring-gray-300'
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating || isCreating}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md text-white',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                        isUpdating || isCreating
                          ? 'bg-primary-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-700'
                      )}
                    >
                      {isUpdating || isCreating ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {profile ? 'Updating...' : 'Creating...'}
                        </span>
                      ) : profile ? (
                        'Update Profile'
                      ) : (
                        'Create Profile'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {displayPasswordError && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {displayPasswordError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="old_password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="old_password"
                    name="old_password"
                    type="password"
                    value={passwordFormData.old_password}
                    onChange={handlePasswordChange}
                    required
                    className={cn(
                      'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                      'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                      'sm:text-sm sm:leading-6',
                      displayPasswordError
                        ? 'ring-red-300 focus:ring-red-500'
                        : 'ring-gray-300'
                    )}
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={passwordFormData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className={cn(
                      'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                      'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                      'sm:text-sm sm:leading-6',
                      displayPasswordError
                        ? 'ring-red-300 focus:ring-red-500'
                        : 'ring-gray-300'
                    )}
                    placeholder="Enter your new password (min. 6 characters)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={passwordFormData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className={cn(
                      'block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
                      'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary',
                      'sm:text-sm sm:leading-6',
                      displayPasswordError
                        ? 'ring-red-300 focus:ring-red-500'
                        : 'ring-gray-300'
                    )}
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md text-white',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                      isChangingPassword
                        ? 'bg-primary-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-700'
                    )}
                  >
                    {isChangingPassword ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Changing Password...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
