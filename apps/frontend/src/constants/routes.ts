export const ROUTES = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
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
