export const ROUTES = {
  home: "/",
  auth: {
    root: "/auth",
    login: "/auth/login",
    register: "/auth/register",
    verifyOtp: "/auth/verify-otp",
    forgotPassword: "/auth/forgot-password",
  },
  jobs: "/jobs",
  companies: "/companies",
  candidate: {
    root: "/candidate",
    profile: "/candidate/profile",
  },
  resume: {
    root: "/candidate/resume",
  },
  applications: {
    root: "/candidate/applications",
    savedJobs: "/candidate/applications/saved-jobs",
  },
  recruiter: {
    root: "/recruiter",
  },
} as const;
