// ============================================
// CONFIGURATION
// ============================================

export const CONFIG = {
  name: "Baraka",
  title: "Computer Engineer",
  tagline: "Virginia Tech '27",
  email: "barakaeli@vt.edu",
  phone: "+1 (540) 998-2037",
  location: "Blacksburg, VA",
  github: "github.com/Brillar0101",
  linkedin: "linkedin.com/in/barakaeli",

  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_51n3oya",
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_ckrtvvp",
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "eEWjLIqXAn2IdqCjL"
  }
};
