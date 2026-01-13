import { useEffect, useState } from "react";

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [city, setCity] = useState("");

  // Detect City
  async function detectCity() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      setCity(data.city || "Unknown");
    } catch {
      setCity("Unknown");
    }
  }

  // Fetch comments
  async function fetchComments() {
    if (!API) return;
    try {
      const res = await fetch(`${API}/comments`);
      const data = await res.json();
      setComments(data);
    } catch {
      console.error("Failed to load comments");
    }
  }

  useEffect(() => {
    fetchComments();
    detectCity();
  }, []);

  // Submit comment
  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim() || !API) return;

    await fetch(`${API}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: comment,
        city,
        userId: "guest",
      }),
    });

    setComment("");
    fetchComments();
    createEffect("⭐");
  }

  // Like
  async function likeComment(id) {
    if (!API) return;
    await fetch(`${API}/comment/like/${id}`, { method: "POST" });
    fetchComments();
    createEffect("⭐");
  }

  // Dislike
  async function dislikeComment(id) {
    if (!API) return;
    await fetch(`${API}/comment/dislike/${id}`, { method: "POST" });
    fetchComments();
    createEffect("😢");
  }

  // Emoji animation (client safe)
  function createEffect(symbol) {
    if (typeof window === "undefined") return;
    const el = document.createElement("div");
    el.innerText = symbol;
    el.className = "floating";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // Translate
  async function translate(id) {
    try {
      const c = comments.find((c) => c._id === id);
      if (!c) return;

      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
          c.text
        )}`
      );

      const data = await res.json();
      alert("Translated: " + data[0][0][0]);
    } catch {
      alert("Translation failed");
    }
  }

  return (
    <div className="page">
      <h2>Add Comment</h2>

      <form onSubmit={submitComment} className="card">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
        />
        <button className="primary">Submit</button>
      </form>

      {comments.map((c) => (
        <div key={c._id} className="card">
          <b>{c.text}</b>
          <div className="city">City: {c.city}</div>

          <div className="actions">
            <button onClick={() => likeComment(c._id)}>👍 {c.likes}</button>
            <button onClick={() => dislikeComment(c._id)}>👎 {c.dislikes}</button>
            <button onClick={() => translate(c._id)}>🌐 Translate</button>
          </div>
        </div>
      ))}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          background: linear-gradient(135deg, #fff3cd, #ffe8a1);
          font-family: Arial, sans-serif;
        }

        h2 {
          text-align: center;
          color: #7a4f01;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 14px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        textarea {
          width: 100%;
          height: 80px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .primary {
          margin-top: 10px;
          background: #ffb300;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        .city {
          font-size: 13px;
          color: #555;
        }

        .actions button {
          margin-right: 6px;
          margin-top: 8px;
          background: #fff1c1;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .floating {
          position: fixed;
          left: 50%;
          top: 60%;
          font-size: 26px;
          animation: floatUp 1.2s ease forwards;
        }

        @keyframes floatUp {
          from {
            transform: translate(-50%, 20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -60px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
