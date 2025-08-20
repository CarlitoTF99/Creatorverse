// src/pages/EditCreator.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../client";
import "./FormCreator.css";

/** Upgrade small YouTube/Google avatar sizes (s88/s160/etc.) to s800 for sharp images */
function normalizeYouTubeImage(url) {
	if (!url) return url;
	return url.replace(/s\d{2,4}-/i, "s800-");
}

/** Parse multiple links from single `url` column and tag simple platforms */
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
		else if (u.includes("instagram.com")) platform = "instagram";
		else if (u.includes("twitter.com") || u.includes("x.com")) platform = "x";
		out.push({ platform, href: h });
	}
	return out;
}

export default function EditCreator() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: "",
		description: "",
		imageURL: "",
		youtube: "",
		instagram: "",
		x: "",
	});

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		(async () => {
			try {
				const { data, error } = await supabase
					.from("creators")
					.select("*")
					.eq("id", id)
					.single();
				if (error) throw error;

				const links = parseLinks(data?.url);
				const found = {
					youtube: links.find((l) => l.platform === "youtube")?.href || "",
					instagram: links.find((l) => l.platform === "instagram")?.href || "",
					x: links.find((l) => l.platform === "x")?.href || "",
				};

				setForm({
					name: data?.name ?? "",
					description: data?.description ?? "",
					imageURL: data?.imageURL ?? data?.image_url ?? "",
					...found,
				});
			} catch (e) {
				setErrorMsg(e.message || String(e));
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const buildUrlField = () =>
		[form.youtube, form.instagram, form.x]
			.map((v) => v.trim())
			.filter(Boolean)
			.join(" ");

	const onSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setErrorMsg("");

		try {
			const payload = {
				name: form.name.trim(),
				description: form.description.trim(),
				url: buildUrlField(),
			};
			if (form.imageURL.trim()) {
				payload.imageURL = normalizeYouTubeImage(form.imageURL.trim());
			} else {
				payload.imageURL = null; // allow clearing the image if desired
			}

			const { error } = await supabase
				.from("creators")
				.update(payload)
				.eq("id", id);
			if (error) throw error;

			navigate(`/view/${id}`);
		} catch (err) {
			setErrorMsg(err.message || String(err));
		} finally {
			setSaving(false);
		}
	};

	const onDelete = async () => {
		if (!confirm("Delete this creator?")) return;
		const { error } = await supabase.from("creators").delete().eq("id", id);
		if (error) setErrorMsg(error.message);
		else navigate("/");
	};

	if (loading) {
		return (
			<main className="container">
				<p>Loading…</p>
			</main>
		);
	}

	return (
		<main className="container">
			<div className="page-head">
				<h1>Edit Creator</h1>
				<div className="toolbar">
					<Link className="btn" to={`/view/${id}`}>
						← Back
					</Link>
				</div>
			</div>

			<div className="form-wrapper">
				<form onSubmit={onSubmit} noValidate>
					<label>
						<span>Name</span>
						<input
							name="name"
							type="text"
							value={form.name}
							onChange={onChange}
							required
						/>
					</label>

					<label>
						<span>Description</span>
						<textarea
							name="description"
							rows={6}
							value={form.description}
							onChange={onChange}
						/>
					</label>

					{/* Social links (all optional) */}
					<label>
						<span>YouTube (optional)</span>
						<input
							name="youtube"
							type="url"
							inputMode="url"
							placeholder="https://youtube.com/@handle or https://youtu.be/..."
							value={form.youtube}
							onChange={onChange}
						/>
					</label>

					<label>
						<span>Instagram (optional)</span>
						<input
							name="instagram"
							type="url"
							inputMode="url"
							placeholder="https://instagram.com/handle"
							value={form.instagram}
							onChange={onChange}
						/>
					</label>

					<label>
						<span>X / Twitter (optional)</span>
						<input
							name="x"
							type="url"
							inputMode="url"
							placeholder="https://x.com/handle or https://twitter.com/handle"
							value={form.x}
							onChange={onChange}
						/>
					</label>

					<label>
						<span>Image URL (optional)</span>
						<input
							name="imageURL"
							type="url"
							inputMode="url"
							placeholder="https://… (YouTube avatars auto-upgraded to s800)"
							value={form.imageURL}
							onChange={onChange}
						/>
					</label>

					{errorMsg && <p className="form-error">⚠️ {errorMsg}</p>}

					<button type="submit" disabled={saving}>
						{saving ? "Saving…" : "Save Changes"}
					</button>

					<button type="button" onClick={onDelete} style={{ marginTop: 8 }}>
						Delete
					</button>
				</form>
			</div>
		</main>
	);
}
