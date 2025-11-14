import { motion } from 'motion/react';
import { Settings as SettingsIcon, User, Bell, Lock, Database, Palette, Globe } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useState, useEffect } from 'react';
import { apiGet, apiPatch } from '../lib/api';
import { getUser } from '../lib/auth';

export function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // Load user data and settings
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user from auth
        const currentUser = getUser();
        if (currentUser) {
          setUser(currentUser);
          setFirstName(currentUser.first_name || '');
          setLastName(currentUser.last_name || '');
          setEmail(currentUser.email || currentUser.user?.email || '');
        }

        // Fetch profile
        try {
          const profilesResponse = await apiGet('/profiles/');
          const profiles = profilesResponse.results || profilesResponse;
          if (Array.isArray(profiles) && profiles.length > 0) {
            const userProfile = profiles.find(p => 
              p.user?.id === currentUser?.id || p.user_id === currentUser?.id
            ) || profiles[0];
            setProfile(userProfile);
            setRole(userProfile.role || '');
          }
        } catch (err) {
          console.warn('Could not fetch profile:', err);
        }

        // Fetch settings
        try {
          const settingsResponse = await apiGet('/settings/');
          const allSettings = settingsResponse.results || settingsResponse;
          setSettings(Array.isArray(allSettings) ? allSettings : []);
        } catch (err) {
          console.warn('Could not fetch settings:', err);
        }
      } catch (error) {
        console.error('Failed to load settings data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update profile if exists
      if (profile) {
        await apiPatch(`/profiles/${profile.id}/`, {
          role: role,
        });
      }
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] flex items-center justify-center">
          <SettingsIcon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-white mb-1">Settings</h1>
          <p className="text-white/60">Manage your account and preferences</p>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9D4EDD] data-[state=active]:to-[#FF006E]">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-6">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80 mb-2 block">First Name</Label>
                      <Input 
                        className="bg-white/5 border-white/10 text-white" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label className="text-white/80 mb-2 block">Last Name</Label>
                      <Input 
                        className="bg-white/5 border-white/10 text-white" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/80 mb-2 block">Email</Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white" 
                      value={email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80 mb-2 block">Role</Label>
                    <Select value={role} onValueChange={setRole} disabled={loading}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16161F] border-white/10">
                        <SelectItem value="admin" className="text-white">Admin</SelectItem>
                        <SelectItem value="editor" className="text-white">Editor</SelectItem>
                        <SelectItem value="viewer" className="text-white">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  <Button 
                    className="bg-gradient-to-r from-[#9D4EDD] to-[#FF006E] hover:opacity-90 text-white border-0 disabled:opacity-50"
                    onClick={handleSaveProfile}
                    disabled={loading || saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-4">Profile Picture</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {firstName?.[0]?.toUpperCase() || lastName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'U'}
                      {lastName?.[0]?.toUpperCase() || ''}
                    </span>
                  </div>
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" disabled>
                    Change Photo (Coming Soon)
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {[
                { label: 'Email Notifications', description: 'Receive email updates about your jobs' },
                { label: 'Job Completion Alerts', description: 'Get notified when jobs are completed' },
                { label: 'System Updates', description: 'Receive notifications about system updates' },
                { label: 'Marketing Emails', description: 'Receive tips and product updates' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-white mb-1">{item.label}</h4>
                    <p className="text-white/50 text-sm">{item.description}</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-[#9D4EDD]" defaultChecked={index < 2} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-white mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 mb-2 block">Current Password</Label>
                  <Input type="password" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/80 mb-2 block">New Password</Label>
                  <Input type="password" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/80 mb-2 block">Confirm Password</Label>
                  <Input type="password" className="bg-white/5 border-white/10 text-white" />
                </div>
                <Button className="w-full bg-gradient-to-r from-[#9D4EDD] to-[#FF006E] hover:opacity-90 text-white border-0">
                  Update Password
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-4">Two-Factor Authentication</h3>
                <p className="text-white/60 text-sm mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                  Enable 2FA
                </Button>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white mb-4">Active Sessions</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white text-sm">Current Session - {new Date().toLocaleString()}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-2">Session management coming soon</p>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-white mb-6">Application Preferences</h3>
            <div className="space-y-6">
              <div>
                <Label className="text-white/80 mb-2 block">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    <SelectItem value="en" className="text-white">English</SelectItem>
                    <SelectItem value="es" className="text-white">Spanish</SelectItem>
                    <SelectItem value="fr" className="text-white">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/80 mb-2 block">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#16161F] border-white/10">
                    <SelectItem value="utc" className="text-white">UTC</SelectItem>
                    <SelectItem value="est" className="text-white">EST</SelectItem>
                    <SelectItem value="pst" className="text-white">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <h4 className="text-white mb-1">Auto-save Projects</h4>
                    <p className="text-white/50 text-sm">Automatically save your work</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-[#9D4EDD]" defaultChecked />
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

