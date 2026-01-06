import { useEffect, useState } from "react";

export default function Home() {
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

  // Load Comments
  async function fetchComments() {
    const res = await fetch("http://localhost:5000/comments");
    setComments(await res.json());
  }

  useEffect(() => {
    fetchComments();
    detectCity();
  }, []);

  // Submit Comment
  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;

    await fetch("http://localhost:5000/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: comment,
        city,
        userId: "guest"
      })
    });

    setComment("");
    fetchComments();
    createEffect("⭐");
  }

  // Like
  async function likeComment(id) {
    await fetch(`http://localhost:5000/comment/like/${id}`, {
      method: "POST"
    });

    fetchComments();
    createEffect("⭐");
  }

  // Dislike
  async function dislikeComment(id) {
    await fetch(`http://localhost:5000/comment/dislike/${id}`, {
      method: "POST"
    });

    fetchComments();
    createEffect("😢");
  }

  // Floating emoji
  function createEffect(symbol) {
    const el = document.createElement("div");
    el.innerText = symbol;
    el.className = "floating";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // Translate
  async function translate(id) {
    try {
      const comment = comments.find(c => c._id === id);

      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
          comment.text
        )}`
      );

      const data = await res.json();
      alert("Translated: " + data[0][0][0]);
    } catch {
      alert("Translation failed. Try again.");
    }
  }

  return (
    <div className="page">
      <h2>Add Comment</h2>

      <form onSubmit={submitComment} className="card formCard">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
        />

        <button type="submit" className="primary">Submit</button>
      </form>

      {comments.map((c) => (
        <div key={c._id} className="card commentCard">
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
          font-family: "Segoe UI", Arial, sans-serif;
          animation: fadeIn 0.6s ease-in-out;
        }

        h2 {
          text-align: center;
          color: #7a4f01;
          margin-bottom: 18px;
        }

        .card {
          background: white;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          margin-bottom: 15px;
          animation: slideUp 0.5s ease;
        }

        textarea {
          width: 100%;
          height: 85px;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #b0bec5;
          outline: none;
          transition: all 0.25s ease;
        }

        textarea:focus {
          border-color: #ffc107;
          box-shadow: 0 0 6px rgba(255, 193, 7, 0.6);
        }

        .primary {
          margin-top: 10px;
          padding: 8px 15px;
          border-radius: 8px;
          background: #ffb300;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }

        .city {
          margin-top: 4px;
          color: #6c757d;
          font-size: 13px;
        }

        .actions button {
          margin-right: 6px;
          margin-top: 8px;
          border: none;
          background: #fff5d1;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .actions button:hover {
          background: #ffe49c;
          transform: scale(1.08);
        }

        .floating {
          position: fixed;
          left: 50%;
          top: 60%;
          font-size: 28px;
          animation: floatUp 1.2s ease forwards;
        }

        @keyframes floatUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, -50px); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
