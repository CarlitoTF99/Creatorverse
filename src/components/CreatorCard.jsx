// src/components/CreatorCard.jsx
import "./CreatorCard.css";
import { Link } from "react-router-dom";

/* --- tiny helper: detect platforms from a comma/space separated string --- */
function parseLinks(urlField = "") {
	const raw = String(urlField || "").trim();
	if (!raw) return [];
	const parts = raw.split(/[\s,]+/).filter(Boolean);

	const out = [];
	for (const href of parts) {
		const h = href.trim();
		if (!/^https?:\/\//i.test(h)) continue; // only real links

		let platform = "site";
		const u = h.toLowerCase();

		if (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("/@"))
			platform = "youtube";
		else if (u.includes("twitter.com") || u.includes("x.com"))
			platform = "twitter";
		else if (u.includes("instagram.com")) platform = "instagram";
		else if (u.includes("tiktok.com")) platform = "tiktok";
		else if (u.includes("twitch.tv")) platform = "twitch";

		// de-dupe by platform+href
		if (!out.some((x) => x.href === h)) out.push({ platform, href: h });
	}
	return out;
}

/* --- minimalist SVG icons so you don’t need any extra libs --- */
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
			<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5-2.2a1 1 0 1 1 0 2.2 1 1 0 0 1 0-2.2z" />
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
			<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.3a14 14 0 0 0-1.2-5 8.1 8.1 0 0 1 4.5 5zM12 4.1c.9 1.3 1.7 3 2 4.9H10c.3-1.9 1.1-3.6 2-4.9zM4.1 11a8.1 8.1 0 0 1 4.5-5 14 14 0 0 0-1.2 5H4.1zm0 2h3.3c.2 1.8.9 3.6 1.9 5a8.1 8.1 0 0 1-5.2-5zM12 19.9c-.9-1.3-1.7-3-2-4.9h4c-.3 1.9-1.1 3.6-2 4.9zm3.4-.9a15.7 15.7 0 0 0 1.2-5h3.3a8.1 8.1 0 0 1-4.5 5z" />
		</svg>
	),
};

function SocialIcon({ platform }) {
	const Cmp = Icon[platform] || Icon.site;
	return <Cmp />;
}

export default function CreatorCard({ creator }) {
	if (!creator) return null;

	const img =
		creator.image_url ??
		creator.imageURL ??
		"https://placehold.co/640x360?text=Creator";
	const name = creator.name ?? "Untitled";
	const desc = creator.description ?? "";
	const links = parseLinks(creator.url);

	return (
		<article className="creator-card">
			<Link to={`/view/${creator.id ?? ""}`} className="card-hit">
				<img className="thumb" src={img} alt={name} loading="lazy" />
				<h3 className="title">{name}</h3>
				<p className="desc clamp-3">{desc}</p>
			</Link>

			{/* Social icons row */}
			{links.length > 0 && (
				<div className="socials">
					{links.map((l) => (
						<a
							key={l.href}
							href={l.href}
							target="_blank"
							rel="noreferrer"
							className={`social-btn ${l.platform}`}
							aria-label={l.platform}
							title={l.href}
						>
							<SocialIcon platform={l.platform} />
						</a>
					))}
				</div>
			)}

			<div className="card-actions">
				<Link to={`/view/${creator.id ?? ""}`}>View</Link>
				<Link to={`/edit/${creator.id ?? ""}`}>Edit</Link>
			</div>
		</article>
	);
}
