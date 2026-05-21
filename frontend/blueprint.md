frontend/
  ├── public/                    <-- Vite static files
  ├── src/                       
  │    ├── components/           <-- Reusable UI elements
  │    │    ├── Navbar.jsx       <-- Desktop & Mobile Responsive TopBar
  │    │    ├── Sidebar.jsx      <-- Slidable menu for Mobile / Fixed for Desktop
  │    │    └── AgendaCard.jsx   <-- Touch-friendly list items for mobile
  │    │
  │    ├── context/              
  │    │    └── AuthContext.jsx  <-- Global User Session & Login state
  │    │
  │    ├── pages/                <-- Full screen views
  │    │    ├── Login.jsx        <-- Login page
  │    │    ├── Register.jsx     <-- Account creation page
  │    │    ├── Dashboard.jsx    <-- Core Current List and Stats view
  │    │    ├── MeetingFloor.jsx <-- Live action desk for Admin/TMC/ZMT
  │    │    ├── History.jsx      <-- [NEW] Purane meetings ke records aur logs dekhne ke liye
  │    │    └── Profile.jsx      <-- [NEW] User profile data aur password change karne ke liye
  │    │
  │    ├── services/             
  │    │    └── api.js           <-- API Central Axios instance
  │    │
  │    ├── App.jsx               <-- Main Routing Router Core
  │    └── main.jsx              <-- App entry point
  │
  ├── .env                       <-- [Yeh hum bana chuke hain]
  ├── index.html
  ├── package.json
  └── tailwind.config.js