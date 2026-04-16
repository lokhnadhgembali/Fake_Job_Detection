"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  User, Mail, Briefcase, Linkedin, Github, Globe,
  Camera, Save, Loader2, CheckCircle, AlertCircle, Shield
} from "lucide-react";
import Link from "next/link";

interface Profile {
  username: string;
  email: string;
  role: string;
  bio: string;
  profession: string;
  linkedin: string;
  github: string;
  website: string;
  profile_pic: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ bio: "", profession: "", linkedin: "", github: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [picPreview, setPicPreview] = useState<string>("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      setForm({
        bio: res.data.bio || "",
        profession: res.data.profession || "",
        linkedin: res.data.linkedin || "",
        github: res.data.github || "",
        website: res.data.website || "",
      });
      if (res.data.profile_pic) {
        setPicPreview(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${res.data.profile_pic}`);
      }
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await api.put("/profile", form);
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPicPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Upload
    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPicPreview(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${res.data.profile_pic}`);
      await refreshUser();
      setSuccess("Profile picture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to upload picture. Only jpg/png/gif/webp allowed.");
    } finally {
      setUploadingPic(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pt-24 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">My Profile</h1>
          <p className="text-slate-500 text-sm">Manage your personal information and account settings</p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left column — Avatar + identity */}
          <div className="md:col-span-1 space-y-4">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
              {/* Picture */}
              <div
                className="relative w-28 h-28 rounded-full cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {picPreview ? (
                  <img
                    src={picPreview}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {initials}
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPic
                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                    : <Camera className="w-6 h-6 text-white" />
                  }
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePicChange}
              />
              <p className="mt-3 text-xs text-slate-400">Click to change photo</p>

              <div className="mt-4 w-full space-y-1 text-center">
                <p className="text-xl font-bold text-slate-900">{profile.username}</p>
                {form.profession && (
                  <p className="text-sm text-slate-500">{form.profession}</p>
                )}
                <span className={`inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-xs font-medium ${
                  profile.role === "admin"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  <Shield className="w-3 h-3" />
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Read-only info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Account Info</h3>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="break-all">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profile.username}</span>
              </div>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right column — editable fields */}
          <div className="md:col-span-2">
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Edit Profile</h2>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profession / Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-emerald-500 transition-all"
                    placeholder="e.g. Software Engineer"
                    value={form.profession}
                    onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Tell us a little about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-emerald-500 transition-all"
                    placeholder="https://linkedin.com/in/yourname"
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  />
                </div>
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-emerald-500 transition-all"
                    placeholder="https://github.com/yourname"
                    value={form.github}
                    onChange={(e) => setForm({ ...form, github: e.target.value })}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Personal Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-emerald-500 transition-all"
                    placeholder="https://yourwebsite.com"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>
              </div>

              {/* Save */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>

            {/* Social links preview (if filled) */}
            {(form.linkedin || form.github || form.website) && (
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Links</h3>
                <div className="flex flex-wrap gap-3">
                  {form.linkedin && (
                    <a href={form.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                      <Linkedin className="w-4 h-4 text-emerald-600" /> LinkedIn
                    </a>
                  )}
                  {form.github && (
                    <a href={form.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-slate-800 hover:text-slate-900 transition-all">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {form.website && (
                    <a href={form.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-purple-400 hover:text-emerald-600 transition-all">
                      <Globe className="w-4 h-4 text-emerald-500" /> Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
