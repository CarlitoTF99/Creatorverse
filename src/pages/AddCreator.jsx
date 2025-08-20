// src/pages/AddCreator.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../client";
import "./FormCreator.css";

/** Upgrade small YouTube/Google avatar sizes (s88/s160/etc.) to s800 for sharp images */
function normalizeYouTubeImage(url) {
	if (!url) return url;
	return url.replace(/s\d{2,4}-/i, "s800-");
}

export default function AddCreator() {
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: "",
		description: "",
		imageURL: "",
		youtube: "", // optional
		instagram: "", // optional
		x: "", // optional (Twitter/X)
	});

	const [submitting, setSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	// Pack provided social links into the single `url` column (space-separated)
	const buildUrlField = () =>
		[form.youtube, form.instagram, form.x]
			.map((v) => v.trim())
			.filter(Boolean)
			.join(" ");

	const onSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setErrorMsg("");

		try {
			const payload = {
				name: form.name.trim(),
				description: form.description.trim(),
				url: buildUrlField(), // store socials here
			};

			if (form.imageURL.trim()) {
				payload.imageURL = normalizeYouTubeImage(form.imageURL.trim());
			}

			const { error } = await supabase.from("creators").insert([payload]);
			if (error) throw error;

			navigate("/");
		} catch (err) {
			setErrorMsg(err.message || String(err));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="container">
			<div className="page-head">
				<h1>Add Creator</h1>
				<div className="toolbar">
					<Link className="btn" to="/">
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
							placeholder="e.g., Tame Impala"
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
							placeholder="Write a short bio…"
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
							name="imageURL" /* change to image_url if your table uses snake_case */
							type="url"
							inputMode="url"
							placeholder="https://… (YouTube avatars auto-upgraded to s800)"
							value={form.imageURL}
							onChange={onChange}
						/>
					</label>

					{errorMsg && <p className="form-error">⚠️ {errorMsg}</p>}

					<button type="submit" disabled={submitting}>
						{submitting ? "Creating…" : "Create"}
					</button>
				</form>
			</div>
		</main>
	);
}
