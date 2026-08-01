import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cute: {
          bg: "#EBF5FB",     // สีฟ้าอ่อนพาสเทล (Background)
          blue: "#5DADE2",   // สีฟ้าหลักที่ดูสดใสแต่น่ารัก
          dark: "#2C3E50",   // สีน้ำเงินเข้มอมเทา (ทำให้ตัวหนังสืออ่านง่าย ไม่กระด้าง)
          card: "#FFFFFF",   // สีขาว
        },
      },
      fontFamily: {
        mali: ['var(--font-mali)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;