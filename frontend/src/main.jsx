import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Menu from './pages/MenuPage'
import CharacterPage from './pages/CharactersPage'
import { UserProvider } from "./pages/UserContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/menu" element={<Menu />} />
        <Route path="/characters" element={<CharacterPage />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
)

