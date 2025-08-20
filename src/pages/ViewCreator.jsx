// src/pages/ViewCreator.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../client";
import "./ViewCreator.css";

/* ---- helpers duplicated here for a self-contained file ---- */
function parseLinks(urlField = "") {
	const raw = String(urlField || "").trim();
	if (!raw) return [];
	const parts = raw.split(/[\s,]+/).filter(Boolean);
	const out = [];
	for (const href of parts) {
		const h = href.trim();
		if (!/^https?:\/\//i.test(h)) continue;
		const u = h.toLowerCase();
		let platform = "site";
		if (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("/@"))
			platform = "youtube";
		else if (u.includes("twitter.com") || u.includes("x.com"))
			platform = "twitter";
		else if (u.includes("instagram.com")) platform = "instagram";
		else if (u.includes("tiktok.com")) platform = "tiktok";
		else if (u.includes("twitch.tv")) platform = "twitch";
		if (!out.some((x) => x.href === h)) out.push({ platform, href: h });
	}
	return out;
}
const Icon = {
	youtube: () => (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.8 3 12 3 12 3s-6.8 0-8.7.4A4 4 0 0 0 .5 6.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 5.8 4 4 0 0 0 2.8 2.8C5.2 21 12 21 12 21s6.8 0 8.7-.4a4 4 0 0 0 2.8-2.8 41 41 0 0 0 .5-5.8 41 41 0 0 0-.5-5.8zM9.6 15.3V8.7L15.8 12l-6.2 3.3z" />
		</svg>
	),
	twitter: () => (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M21.5 5.9c-.7.3-1.5.6-2.2.7.8-.5 1.4-1.2 1.7-2.1-.8.5-1.7.9-2.6 1.1a4 4 0 0 0-6.9 3.6A11.6 11.6 0 0 1 3.2 5.2a4 4 0 0 0 1.3 5.4c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 3.9c-.5.1-1 .2-1.6.1a4 4 0 0 0 3.8 2.8A8 8 0 0 1 2 19.2a11.3 11.3 0 0 0 6.3 1.8c7.6 0 11.8-6.3 11.8-11.8v-.5c.8-.5 1.4-1.2 1.9-1.9z" />
		</svg>
	),
	instagram: () => (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM18 6.8a1 1 0 1 1 0 2.2 1 1 0 0 1 0-2.2z" />
		</svg>
	),
	tiktok: () => (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M16 2c1 2.3 2.7 3.7 5 4v3c-1.8-.1-3.4-.7-5-1.9v7.6A6.5 6.5 0 1 1 9.5 8c.6 0 1.1.1 1.7.3v3A3.5 3.5 0 1 0 13 14V2h3z" />
		</svg>
	),
	twitch: () => (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M4 2h16v11l-4 4h-4l-3 3H7v-3H4V2zm3 2v9h3v3l3-3h4V4H7zm7 2h2v5h-2V6zm-4 0h2v5h-2V6z" />
		</svg>
	),
	site: () => (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
		</svg>
	),
};
function SocialIcon({ platform }) {
	const Cmp = Icon[platform] || Icon.site;
	return <Cmp />;
}
/* ---- end helpers ---- */

export default function ViewCreator() {
	const { id } = useParams();
	const [creator, setCreator] = useState(null);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const { data, error } = await supabase
					.from("creators")
					.select("*")
					.eq("id", id)
					.single();
				if (error) throw error;

				setCreator({
					...data,
					image_url: data.image_url ?? data.imageURL ?? null,
				});
			} catch (e) {
				setErr(e.message || String(e));
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	if (loading)
		return (
			<main className="container">
				<p>Loading…</p>
			</main>
		);

	if (err || !creator) {
		return (
			<main className="container">
				<p>Creator not found.</p>
				<Link to="/">← Back</Link>
			</main>
		);
	}

	const links = parseLinks(creator.url);

	return (
		<main className="container view-layout">
			<div className="view-media">
				<img
					src={creator.image_url ?? "https://placehold.co/800x600?text=Creator"}
					alt={creator.name ?? "Creator"}
				/>
			</div>

			<div className="view-body">
				<h1>{creator.name}</h1>

				{links.length > 0 && (
					<div className="socials" style={{ marginBottom: 8 }}>
						{links.map((l) => (
							<a
								key={l.href}
								href={l.href}
								target="_blank"
								rel="noreferrer"
								className={`social-btn ${l.platform}`}
							>
								<SocialIcon platform={l.platform} />
							</a>
						))}
					</div>
				)}

				{creator.description && <p>{creator.description}</p>}

				<div style={{ marginTop: "1rem" }}>
					<Link to="/">← Back</Link>{" "}
					<Link to={`/edit/${creator.id}`}>Edit</Link>
				</div>
			</div>
		</main>
	);
}
