// src/pages/ShowCreators.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../client";
import CreatorCard from "../components/CreatorCard";
import "./ShowCreators.css";

export default function ShowCreators() {
	const [creators, setCreators] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				// Safe fetch: select everything so we don't 400 on missing columns
				const { data, error } = await supabase.from("creators").select("*");
				if (error) throw error;

				// Normalize image field client-side
				const normalized = (data ?? []).map((row) => ({
					...row,
					image_url: row.image_url ?? row.imageURL ?? null,
				}));

				// Gentle client-side ordering
				normalized.sort((a, b) => {
					if (a.created_at && b.created_at) {
						return new Date(b.created_at) - new Date(a.created_at);
					}
					if (a.id && b.id) return String(b.id).localeCompare(String(a.id));
					return String(a.name ?? "").localeCompare(String(b.name ?? ""));
				});

				setCreators(normalized);
			} catch (err) {
				console.error("Supabase fetch error:", err?.message || err);
				setCreators([]);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<main className="container">
			<div className="page-head">
				<h1>Creatorverse</h1>

				{/* Upper-right buttons */}
				<div className="toolbar">
					<Link className="btn" to="/">
						All creators
					</Link>
					<Link className="btn" to="/add">
						+ Add creator
					</Link>
				</div>
			</div>

			{loading ? (
				<p>Loading…</p>
			) : creators.length === 0 ? (
				<p>No creators yet. Add your first one!</p>
			) : (
				<div className="cards-grid">
					{creators.map((c, i) => (
						<CreatorCard key={c.id ?? i} creator={c} />
					))}
				</div>
			)}
		</main>
	);
}
