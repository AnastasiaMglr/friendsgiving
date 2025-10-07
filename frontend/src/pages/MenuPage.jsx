import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import axios from "axios";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import "./friendsgivingpage.css";
import FallingLeaves from './FallingLeaves';
import AudioPlayer from "./audioplayer";
import { fadeInAudio, fadeOutAudio } from "./audioSingleton";
import { bgAudio, fadeAudio } from "./audioSingleton";


// Composant pour afficher les bulles de commentaire de chaque item
const CommentBubble = ({ title, comment, friend, onClose, canRemove, onRemove }) => {
  return (
    <div className="comment-bubble">
      <button className="close-btn" onClick={onClose}>×</button>
      <h3>{title}</h3>
      {comment && <p>{comment}</p>}
      {friend && <small>{friend}</small>}
            {/* Right side: remove button */}
       {canRemove&& (
        <button className="remove-btn" onClick={onRemove}>
        Remove
      </button>
       )}
    </div>
  );
};

// Composant pour chaque item
const MenuItem = ({ item, currentUser, onRemove }) => {
  const [showComment, setShowComment] = useState(false);

  // Vérifie si l'utilisateur peut supprimer cet item
  const canRemove =
    currentUser === item.friend || currentUser === "Zach" || currentUser === "Ana";

  return (
    <>
    <div className="menu-item" onClick={() => setShowComment(!showComment)}>
      {/* Left side: title, comment, friend, toggle */}
      <div className="menu-item-left">
        <span className="menu-item-title">{item.title}</span>
      </div>
      <div className="menu-item-right">

        <span className="menu-item-friend">{item.friend}</span>

        <button
          className="hide-btn"
          onClick={(e) =>
            {e.stopPropagation(); 
            setShowComment(!showComment);}}
        >
          {showComment ? "Hide" : "..."}
        </button>
      </div>
    </div>
    {showComment && (
        <CommentBubble
          title={item.title}
          comment={item.comment}
          friend={item.friend}
          onClose={(e) => 
            {e.stopPropagation();
            setShowComment(false);}}
          canRemove={canRemove}
          onRemove={(e) => {
            e.stopPropagation();
            onRemove();
            setShowComment(false);
          }}
        />
      )}
    </>
  );
};


// Composant pour chaque catégorie ou sous-catégorie
const MenuCategory = ({ name, subcategories = [], parentCategory, currentUser }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [comment, setComment] = useState("");
  const friend = currentUser
  const [showForm, setShowForm] = useState(false);
  const [open, setOpen] = useState(false);

  const category = parentCategory ?? name;
  const subcategory = parentCategory ? name : null;

  // Récupérer les items depuis le backend
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/menuItems`, {
        params: { category, subcategory },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Fetch items error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      console.log("Friend user", friend)
      await axios.post(`${import.meta.env.VITE_API_URL}/menuItems`, {
        title: newItem,
        comment,
        friend,
        category,
        subcategory,
      });
      setNewItem("");
      setComment("");
      setShowForm(false);
      fetchItems();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error("Add Item error:", errorMessage);
      alert(errorMessage);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/menuItems/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div>
      <div className="category-header" onClick={() => setOpen(!open)}>
        <span>{name}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {open && subcategories.length > 0 && (
        <div className="subcategory-container">
          {subcategories.map((sub) => (
            <MenuCategory
              key={sub}
              name={sub}
              subcategories={[]}
              parentCategory={category}
              currentUser= {friend}
            />
          ))}
        </div>
      )}

      {open && subcategories.length === 0 && items.length > 0 && (
        <div className="item-list">
          {items.map((item) => (
            <MenuItem
              key={item._id}
              item={item}
              currentUser= {friend}
              onRemove={() => removeItem(item._id)}
            />
          ))}
        </div>
      )}

      {open && subcategories.length === 0 && (
        <div className="subcategory-container">
          <button
            onClick={() => setShowForm(!showForm)}
            className="add-btn">
          {showForm ? (
            <>
              <Minus size={16} /> Cancel
            </>
          ) : (
            <>
              <Plus size={16} /> Add Item
            </>
          )}
          </button>

          {showForm && (
            <form onSubmit={handleAddItem} className="item-form">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Dish name"
                required
              />
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comment (optional)"
              />
              <button type="submit">Save</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

// Page principale
export default function FriendsgivingMenu() {

  const { user } = useUser();
  console.log("Current user:", user);
  const navigate = useNavigate();
  const [currentMusic, setCurrentMusic] = useState(null);

  
  const categories = [
    { name: "Appetizers", subcategories: ["Drinks","Snacks"] },
    { name: "First Course", subcategories: [] },
    { name: "Main Course", subcategories: [] },
    { name: "Dessert", subcategories: [] },
  ];

  useEffect(() => {
    document.body.className = "menu-page";
    return () => {
      document.body.className = "";
    };
  }, []);

  useEffect(() => {
  const root = document.querySelector(".menu-page");
  if (root) {
    root.classList.add("page-fade-in");
    }
  }, []);

    useEffect(() => {
    // When page mounts, we can assign the AudioPlayer audio
    const audioEl = document.querySelector("audio");
    if (audioEl) setCurrentMusic(audioEl);
  }, []);

  const handleBack = async () => {
    // 1. Fade out current music
    fadeAudio(bgAudio, 0, 1000);
    setTimeout(() => bgAudio.pause(), 1000);

    // 2. Play character select music
    const charAudio = new Audio("/sounds/choose.mp3");
    charAudio.loop = true;
    charAudio.volume = 0;
    charAudio.play();
    fadeAudio(charAudio, 0.5, 1000); // fade in

    // 3. Fade out page & navigate
    document.querySelector(".page-container")?.classList.add("page-fade-out");
    setTimeout(() => navigate("/characters"), 800);
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={handleBack}>
        ← Back
      </button>
      <FallingLeaves count={60} />
      <div className="welcome-message">
        Welcome, {user?.name}
      </div>
      {/* Audio player en bas de page */}
      <AudioPlayer />
      <h1 className="page-title">Friendsgiving Menu</h1>
      <div className="category-list">
        {categories.map((cat) => (
          <MenuCategory
            key={cat.name}
            name={cat.name}
            subcategories={cat.subcategories}
            currentUser={user?.name}
          />
        ))}
      </div>
    </div>
  );
}
